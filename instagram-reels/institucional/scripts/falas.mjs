#!/usr/bin/env node
/**
 * Confere e acerta as falas geradas (voz/cena-NN.mp3):
 *
 *   node video/scripts/falas.mjs            # relatório: fim cortado? silêncio sobrando?
 *   node video/scripts/falas.mjs --auto     # refaz as cortadas (3 takes cada), fica com a limpa e apara o silêncio
 *   node video/scripts/falas.mjs --auto 5   # até 5 takes por fala cortada
 *   node video/scripts/falas.mjs --aparar   # só apara o silêncio do fim de todas
 *
 * O eleven_v3 às vezes termina a fala no meio da última palavra ("cobran-"):
 * o arquivo acaba com som alto. Um [pause] no fim do texto ajuda, mas não
 * resolve sempre; o jeito seguro é gerar alguns takes e ficar com o que decai.
 * Depois, o silêncio do fim é aparado (som + 0,4 s, com rampa) para o ritmo
 * entre as cenas vir do gap do narracao.json, não do acaso de cada take.
 */

import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { ROOT, BUILD, VOZ, cfg, cena, args, flag, probe, envelope } from './env.mjs';

const JANELA = 0.05;
const CORTE_DB = -30; // fim de arquivo acima disso = a palavra foi cortada
const SOM_DB = -40; // acima disso conta como fala (para aparar)

function analisa(file) {
  const env = envelope(file);
  const dur = probe(file);
  const fim = Math.max(...env.slice(-2));
  let ultimo = 0;
  env.forEach((v, i) => { if (v > SOM_DB) ultimo = (i + 1) * JANELA; });
  return { dur, cortada: fim > CORTE_DB, fim, ultimo: Math.min(ultimo, dur) };
}

function apara(file) {
  const a = analisa(file);
  const corte = +(a.ultimo + 0.4).toFixed(2);
  if (a.cortada || corte >= a.dur - 0.1) return false;
  const tmp = file.replace(/\.mp3$/, '.tmp.mp3');
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-t', String(corte), '-af', `afade=t=out:st=${(corte - 0.25).toFixed(2)}:d=0.25`, '-b:a', '128k', tmp]);
  fs.renameSync(tmp, file);
  return true;
}

const todas = cfg.cenas.map((c, i) => ({ i, id: c.id, mp3: path.join(VOZ, `${cena(i)}.mp3`), text: c.text }));
const faltando = todas.filter((f) => !fs.existsSync(f.mp3));
if (faltando.length) { console.error(`Faltam falas: ${faltando.map((f) => cena(f.i)).join(', ')} — rode voice.mjs.`); process.exit(1); }

// ── --auto: refaz as cortadas em takes paralelos e escolhe ──────────────────
if (flag('--auto')) {
  const n = parseInt(args[args.indexOf('--auto') + 1], 10) || 3;
  const cortadas = todas.filter((f) => analisa(f.mp3).cortada);
  if (cortadas.length) {
    const only = cortadas.map((f) => f.i + 1).join(',');
    console.log(`\n♻️  ${cortadas.length} fala(s) com o fim cortado (${only}): gerando ${n} takes…`);
    fs.rmSync(path.join(BUILD, 'takes'), { recursive: true, force: true });
    // um take por vez: cada voice.mjs já usa as 3 requisições simultâneas que o plano permite
    for (let k = 0; k < n; k++) {
      await new Promise((ok) => spawn('node', [path.join(ROOT, 'scripts/voice.mjs'), '--only', only, '--out', path.join(BUILD, 'takes', `t${k + 1}`)], { stdio: 'ignore' }).on('close', ok));
    }
    for (const f of cortadas) {
      const words = JSON.parse(fs.readFileSync(f.mp3.replace(/\.mp3$/, '.json'), 'utf8')).words.length;
      const takes = Array.from({ length: n }, (_, k) => path.join(BUILD, 'takes', `t${k + 1}`, `${cena(f.i)}.mp3`))
        .filter((t) => fs.existsSync(t))
        .map((t) => ({ t, ...analisa(t), words: JSON.parse(fs.readFileSync(t.replace(/\.mp3$/, '.json'), 'utf8')).words.length }))
        // limpa, com todas as palavras; entre as limpas, a que termina mais baixo
        .filter((t) => !t.cortada && t.words === words)
        .sort((a, b) => a.fim - b.fim);
      if (!takes.length) { console.log(`  ⚠️  ${cena(f.i)} (${f.id}): nenhum take limpo — rode de novo ou mude o fim do texto`); continue; }
      fs.copyFileSync(takes[0].t, f.mp3);
      fs.copyFileSync(takes[0].t.replace(/\.mp3$/, '.json'), f.mp3.replace(/\.mp3$/, '.json'));
      console.log(`  ✅  ${cena(f.i)} (${f.id}): ${path.relative(BUILD, takes[0].t)}`);
    }
  }
}

// ── aparar o silêncio e relatório ───────────────────────────────────────────
const aparar = flag('--auto') || flag('--aparar');
console.log('');
for (const f of todas) {
  const aparou = aparar && apara(f.mp3);
  const a = analisa(f.mp3);
  const fimTexto = /\[(long )?pause\]\s*$/.test(f.text) ? '' : '  (sem [pause] no fim)';
  const estado = a.cortada ? `❌ fim cortado (${a.fim.toFixed(0)} dB)` : a.dur - a.ultimo > 0.8 ? `… ${(a.dur - a.ultimo).toFixed(1)} s de silêncio no fim` : '✓';
  console.log(`  ${cena(f.i)}  ${f.id.padEnd(14)} ${a.dur.toFixed(2).padStart(5)} s  ${estado}${aparou ? '  (aparada)' : ''}${fimTexto}`);
}
console.log('\n  Ouça as falas marcadas e a última palavra de cada uma antes do render.\n');
