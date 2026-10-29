#!/usr/bin/env node
/**
 * Prepara o áudio e a timeline do reel a partir da gravação original.
 *   1. limpa a voz (ruído, graves, compressão, loudnorm) → voz/limpo.wav
 *   2. lê build/transcricao.json (Whisper, palavra a palavra) → build/timeline.js + VTT
 *   3. mistura a voz com a trilha (ducking) → build/audio.m4a
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { ROOT, BUILD, OUT, VOZ, NOME, cfg, resolve, probe } from './env.mjs';

fs.mkdirSync(OUT, { recursive: true });
const run = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
};

// ── 1 · voz limpa ───────────────────────────────────────────────────────────
const pre = path.join(VOZ, 'pre.wav');
const limpo = path.join(VOZ, 'limpo.wav');
run(['-i', path.join(VOZ, 'original.m4a'), '-ar', '48000', '-ac', '1', '-af',
  'highpass=f=90,afftdn=nr=20:nf=-48:tn=1,agate=threshold=0.012:ratio=2.5:attack=15:release=250:range=0.15,lowpass=f=13000,' +
  'acompressor=threshold=-22dB:ratio=2.5:attack=12:release=220:makeup=2', pre]);
// loudnorm em duas passadas (a segunda, linear, não levanta o ruído de fundo dos respiros)
const m = spawnSync('ffmpeg', ['-hide_banner', '-i', pre, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' })
  .stderr.match(/\{[\s\S]*\}/)[0];
const j = JSON.parse(m);
run(['-i', pre, '-af', `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`, '-ar', '48000', limpo]);
fs.rmSync(pre);

// ── 2 · palavras e legendas ─────────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync(path.join(BUILD, 'transcricao.json'), 'utf8'));
const voz = probe(limpo);
const total = +(voz + 5.8).toFixed(2); // a voz acaba, a marca respira e entra a assinatura
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// o Whisper escreve "gota de cura" e "9" em minúsculas/algarismo: o nome é próprio
let segs = raw.map((s) => s.words.map((w) => ({ w: w.w.trim(), start: +w.s.toFixed(3), end: +w.e.toFixed(3) })).filter((w) => w.w));
for (const ws of segs) {
  ws.forEach((w, i) => {
    if (norm(w.w) === 'gota' && norm(ws[i + 1]?.w || '') === 'de' && norm(ws[i + 2]?.w || '') === 'cura') {
      [0, 2].forEach((k) => { ws[i + k].w = ws[i + k].w.replace(/^./, (c) => c.toUpperCase()); });
    }
  });
}
const text = (ws) => ws.map((w) => w.w).join(' ');
const MAX = 46;
const blocks = [];
for (const ws of segs) {
  let queue = [ws];
  while (queue.length) {
    const c = queue.shift();
    if (text(c).length <= MAX || c.length < 2) { blocks.push(c); continue; }
    // quebra na vírgula mais perto do meio; sem vírgula, no meio das palavras
    const mid = text(c).length / 2;
    let best = Math.floor(c.length / 2), diff = Infinity, pos = 0;
    c.forEach((w, i) => {
      pos += w.w.length + 1;
      if (i < c.length - 1 && /[,;]$/.test(w.w) && Math.abs(pos - mid) < diff) { diff = Math.abs(pos - mid); best = i + 1; }
    });
    queue.unshift(c.slice(0, best), c.slice(best));
  }
}
const cues = blocks.map((ws, i) => {
  const next = blocks[i + 1];
  return {
    start: +Math.max(0, ws[0].start - 0.08).toFixed(3),
    end: +Math.min(next ? next[0].start - 0.08 : total, ws[ws.length - 1].end + 0.7).toFixed(3),
    words: ws,
  };
});
const words = blocks.flat();
fs.writeFileSync(path.join(BUILD, 'timeline.js'),
  `window.TIMELINE = ${JSON.stringify({ total, scenes: [{ id: 'all', start: 0, dur: total, words }], cues }, null, 2)};\n`);

const ts = (s) => {
  const h = Math.floor(s / 3600), mi = Math.floor(s / 60) % 60, sec = (s % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${sec}`;
};
fs.writeFileSync(path.join(OUT, `${NOME}.pt-BR.vtt`),
  'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${text(c.words)}\n`).join('\n'));

// ── 3 · mixagem ─────────────────────────────────────────────────────────────
const music = resolve(cfg.music.file);
const filter = [
  `[0:a]apad=whole_dur=${total},asplit[vsc][vmix]`,
  `[1:a]atrim=start=${cfg.music.start ?? 0}:duration=${total},asetpts=PTS-STARTPTS,volume=${cfg.music.volume},afade=t=in:d=1.5,afade=t=out:st=${(total - 2.6).toFixed(2)}:d=2.6[bed]`,
  '[bed][vsc]sidechaincompress=threshold=0.04:ratio=3:attack=80:release=700[ducked]',
  '[ducked][vmix]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]',
].join(';');
run(['-i', limpo, '-stream_loop', '-1', '-i', music, '-filter_complex', filter, '-map', '[out]', '-t', String(total), '-c:a', 'aac', '-b:a', '192k', path.join(BUILD, 'audio.m4a')]);
console.log(`⏱  ${total}s · ${words.length} palavras · ${cues.length} legendas`);
cues.forEach((c) => console.log(`  ${c.start.toFixed(1).padStart(5)}  ${text(c.words)}`));
