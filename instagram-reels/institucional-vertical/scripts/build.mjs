#!/usr/bin/env node
/**
 * Monta a timeline do vídeo a partir das falas (voice.mjs + falas.mjs):
 *
 *   build/timeline.js   início de cada cena e de cada palavra, em segundos absolutos,
 *                       mais os blocos da legenda — é o que a composição GSAP lê
 *   build/icons.js      os ícones Lucide do narracao.json ("icones"), inline
 *   build/audio.m4a     voz nas posições certas + trilha por baixo, com ducking
 *   output/<nome>.pt-BR.vtt   legenda para o <track> do <video>
 *
 *   node video/scripts/build.mjs
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { ROOT, REPO, BUILD, OUT, VOZ, cfg, NOME, cena, resolve, probe } from './env.mjs';

fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// ── Cenas e palavras em tempo absoluto ───────────────────────────────────────
let t = cfg.lead ?? 1.0;
const scenes = cfg.cenas.map((c, i) => {
  const mp3 = path.join(VOZ, `${cena(i)}.mp3`);
  let { words } = JSON.parse(fs.readFileSync(path.join(VOZ, `${cena(i)}.json`), 'utf8'));
  // a legenda usa a pontuação de leitura (as reticências da voz viram vírgula ou nada)
  if (c.legenda) {
    const lw = c.legenda.split(' ');
    if (lw.length === words.length) words = words.map((w, j) => ({ ...w, w: lw[j] }));
    else console.warn(`⚠️  ${c.id}: legenda com ${lw.length} palavras, fala com ${words.length}; usando a fala`);
  }
  const audio = probe(mp3);
  const start = t;
  const dur = audio + (cfg.gap ?? 1.0) + (c.hold || 0);
  t += dur;
  return {
    id: c.id, start: +start.toFixed(3), dur: +dur.toFixed(3), audio: +audio.toFixed(3), mp3,
    words: words.map((w) => ({ w: w.w, start: +(start + w.start).toFixed(3), end: +(start + w.end).toFixed(3) })),
  };
});
const total = +(t + (cfg.tail ?? 4.2)).toFixed(3);

// ── Blocos de legenda: uma linha, quebrando onde a fala respira ─────────────
// Corta em orações (pontuação) e junta as vizinhas enquanto couber numa linha;
// atravessar o fim de uma frase só se o bloco ficar curto. Ponto final na
// legenda força a quebra (use-o para separar itens de uma enumeração).
const vertical = cfg.formato === '9:16';
const MAX = vertical ? 32 : 56, SHORT = vertical ? 24 : 42;
const text = (ws) => ws.map((x) => x.w).join(' ');
const captions = [];
for (const s of scenes) {
  const clauses = [];
  let cur = [];
  for (const w of s.words) { cur.push(w); if (/[.,:;!?]$/.test(w.w)) { clauses.push(cur); cur = []; } }
  if (cur.length) clauses.push(cur);
  // oração que não cabe numa linha: corta na palavra mais perto do meio
  for (let k = 0; k < clauses.length; k++) {
    const c = clauses[k];
    if (text(c).length <= MAX || c.length < 2) continue;
    let best = 1, diff = Infinity;
    for (let j = 1; j < c.length; j++) {
      const d = Math.abs(text(c.slice(0, j)).length - text(c.slice(j)).length);
      if (d < diff) { diff = d; best = j; }
    }
    clauses.splice(k, 1, c.slice(0, best), c.slice(best));
    k--;
  }
  let block = [];
  for (const c of clauses) {
    const joined = text([...block, ...c]).length;
    const endsSentence = block.length && /[.:!?]$/.test(block[block.length - 1].w);
    if (block.length && (joined > MAX || (endsSentence && joined > SHORT))) { captions.push(block); block = []; }
    block = [...block, ...c];
  }
  if (block.length) captions.push(block);
}
const cues = captions.map((ws, i) => {
  const next = captions[i + 1];
  const start = ws[0].start - 0.08;
  // fica até a próxima entrar, mas não atravessa um silêncio longo
  const end = Math.min(next ? next[0].start - 0.1 : total, ws[ws.length - 1].end + 0.9);
  return { start: +start.toFixed(3), end: +end.toFixed(3), words: ws };
});

fs.writeFileSync(path.join(BUILD, 'timeline.js'),
  `window.TIMELINE = ${JSON.stringify({ total, scenes: scenes.map(({ mp3, ...s }) => s), cues }, null, 2)};\n`);

// ── VTT ──────────────────────────────────────────────────────────────────────
const ts = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = (s % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec}`;
};
fs.writeFileSync(path.join(OUT, `${NOME}.pt-BR.vtt`),
  'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.words.map((w) => w.w).join(' ')}\n`).join('\n'));

// ── Ícones Lucide, do node_modules do projeto (lucide-static ou lucide-react) ─
const icons = {};
for (const name of cfg.icones || []) {
  const stat = path.join(REPO, 'node_modules/lucide-static/icons', `${name}.svg`);
  const react = path.join(REPO, 'node_modules/lucide-react/dist/esm/icons', `${name}.js`);
  if (fs.existsSync(stat)) {
    const svg = fs.readFileSync(stat, 'utf8');
    icons[name] = svg.replace(/<!--[\s\S]*?-->/g, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].replace(/\s+/g, ' ').trim();
  } else if (fs.existsSync(react)) {
    const node = JSON.parse(fs.readFileSync(react, 'utf8').match(/const __iconNode = (\[[\s\S]*?\]);/)[1]
      .replace(/(\w+):/g, '"$1":'));
    icons[name] = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key')
      .map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  } else console.warn(`⚠️  ícone "${name}" não encontrado (instale lucide-static ou lucide-react no projeto)`);
}
fs.writeFileSync(path.join(BUILD, 'icons.js'), `window.ICONS = ${JSON.stringify(icons)};\n`);

// ── Áudio: voz posicionada + trilha por baixo ───────────────────────────────
// o TTS às vezes termina a fala com amostra alta: sem rampa, vira estalo no corte
const SUAVE = 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.18,areverse';
const inputs = scenes.flatMap((s) => ['-i', s.mp3]);
const voiceChains = scenes.map((s, i) => `[${i}:a]${SUAVE},adelay=${Math.round(s.start * 1000)}:all=1,aresample=44100[v${i}]`);
const voz = `${scenes.map((_, i) => `[v${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0,apad=whole_dur=${total}`;
const music = cfg.music?.file && resolve(cfg.music.file);
let filter;
if (music && fs.existsSync(music)) {
  const mi = scenes.length;
  const vol = cfg.music.volume ?? 0.2;
  // realce: a trilha sobe com rampas suaves durante a cena que fala dela
  const realce = cfg.music.realce && scenes.find((s) => s.id === cfg.music.realce.cena);
  const volExpr = realce
    ? `volume='${vol}*(1+${cfg.music.realce.ganho}*min(1,max(0,(t-${realce.start})/1.5))*min(1,max(0,(${(realce.start + realce.dur).toFixed(3)}-t)/1.5)))':eval=frame`
    : `volume=${vol}`;
  inputs.push('-stream_loop', '-1', '-i', music);
  filter = [
    ...voiceChains,
    `${voz},asplit[vsc][vmix]`,
    `[${mi}:a]atrim=start=${cfg.music.start ?? 0}:duration=${total},asetpts=PTS-STARTPTS,${volExpr},afade=t=in:d=1.2,afade=t=out:st=${(total - 2.2).toFixed(2)}:d=2.2[bed]`,
    // ducking leve: a música abaixa sob a voz, mas continua presente
    `[bed][vsc]sidechaincompress=${cfg.music.duck || 'threshold=0.05:ratio=2.5:attack=80:release=700'}[ducked]`,
    `[ducked][vmix]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]`,
  ].join(';');
} else {
  if (cfg.music?.file) console.warn(`⚠️  trilha não encontrada: ${music}`);
  filter = [...voiceChains, `${voz},alimiter=limit=0.95[out]`].join(';');
}
const r = spawnSync('ffmpeg', ['-y', ...inputs, '-filter_complex', filter, '-map', '[out]',
  '-t', String(total), '-c:a', 'aac', '-b:a', '192k', path.join(BUILD, 'audio.m4a')], { stdio: ['ignore', 'ignore', 'pipe'] });
if (r.status !== 0) { console.error(r.stderr.toString().slice(-2000)); process.exit(1); }

// níveis: a voz deve ficar perto de -18 dB e a trilha sozinha (nos respiros) perto de -30
const lvl = (ss, dur) => spawnSync('ffmpeg', ['-v', 'info', '-ss', String(ss), '-t', String(dur), '-i', path.join(BUILD, 'audio.m4a'), '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' })
  .stderr.match(/mean_volume: (-?[\d.]+)/)?.[1];
const respiro = scenes.length > 1 ? [scenes[0].start + scenes[0].audio + 0.2, Math.max(0.3, scenes[1].start - scenes[0].start - scenes[0].audio - 0.4)] : null;

console.log(`\n⏱  ${total}s · ${scenes.length} cenas · ${cues.length} legendas`);
for (const s of scenes) console.log(`   ${s.start.toFixed(2).padStart(6)}s  ${s.id.padEnd(14)} ${s.dur.toFixed(2)}s`);
console.log(`\n🔊  geral ${lvl(0, total)} dB${respiro ? ` · só a trilha (respiro da cena 1) ${lvl(...respiro)} dB` : ''}\n`);
