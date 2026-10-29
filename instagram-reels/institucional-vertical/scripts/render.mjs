#!/usr/bin/env node
/**
 * Renderiza a composição GSAP quadro a quadro e junta com o áudio.
 *
 *   node video/scripts/render.mjs                  # output/<nome>.mp4 (legenda queimada)
 *   node video/scripts/render.mjs --clean          # output/<nome>-limpo.mp4 (sem legenda, para usar o .vtt)
 *   node video/scripts/render.mjs --snap 2,9.5,23  # só PNGs desses instantes + grade, para revisar
 *   node video/scripts/render.mjs --snap cenas     # meio e fim de cada cena
 *   node video/scripts/render.mjs --web --poster 12  # + <nome>-web.mp4 (720p, leve) e <nome>-poster.webp
 *
 * Não grava a tela: posiciona a timeline (window.__seek) e fotografa. O vídeo
 * sai idêntico a cada render, sem quadro perdido, em qualquer máquina.
 */

import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { pathToFileURL } from 'url';
import { ROOT, OUT, BUILD, NOME, LARGURA, ALTURA, opt, flag } from './env.mjs';

const { chromium } = await import('playwright').catch(() => import('@playwright/test'));

fs.mkdirSync(OUT, { recursive: true });
const clean = flag('--clean');
const fps = parseInt(opt('--fps') || '30', 10);
const snapArg = opt('--snap');

const url = pathToFileURL(path.join(ROOT, 'index.html')).href + (clean ? '?captions=0' : '');
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => window.__ready);
const total = await page.evaluate(() => window.__total);

if (snapArg) {
  let snap;
  if (snapArg === 'cenas') {
    const scenes = await page.evaluate(() => window.TIMELINE.scenes);
    snap = scenes.flatMap((s) => [s.start + s.dur * 0.5, s.start + s.dur - 0.4]).map((v) => +v.toFixed(2));
  } else snap = snapArg.split(',').map(Number);
  const dir = path.join(BUILD, 'snapshots'); // output/ guarda só o que vai ser entregue
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const t of snap) {
    await page.evaluate((t) => window.__seek(t), t);
    const f = path.join(dir, `t-${t.toFixed(2)}.png`);
    await page.screenshot({ path: f });
    files.push(f);
  }
  await browser.close();
  // grade na ordem dos instantes pedidos (3 colunas no 16:9, 4 no 9:16)
  const cols = Math.min(LARGURA > ALTURA ? 3 : 4, files.length);
  const w = LARGURA > ALTURA ? 640 : 360, h = Math.round((w * ALTURA) / LARGURA);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ['-i', f]);
  const scaled = files.map((_, i) => `[${i}:v]scale=${w}:${h}[v${i}]`);
  const pad = Array.from({ length: rows * cols - files.length }, (_, i) => `color=c=white:s=${w}x${h}:d=1[p${i}]`);
  const all = [...files.map((_, i) => `[v${i}]`), ...pad.map((_, i) => `[p${i}]`)].join('');
  const layout = Array.from({ length: rows * cols }, (_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
  const filter = [...scaled, ...pad, rows * cols > 1 ? `${all}xstack=inputs=${rows * cols}:layout=${layout}` : `${all}null`].join(';');
  spawnSync('ffmpeg', ['-y', ...inputs, '-filter_complex', filter, '-frames:v', '1', path.join(dir, 'grid.png')], { stdio: 'ignore' });
  console.log(`\n📸  ${files.length} quadros (${snap.join(', ')}) → ${path.join(dir, 'grid.png')}\n`);
  process.exit();
}

const name = clean ? `${NOME}-limpo` : NOME;
const out = path.join(OUT, `${name}.mp4`);
const frames = Math.round(total * fps);

const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', path.join(BUILD, 'audio.m4a'), '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-tune', 'animation',
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'pipe'] });
let ffErr = '';
ff.stderr.on('data', (d) => { ffErr = (ffErr + d).slice(-3000); });

const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.__seek(t), i / fps);
  let buf;
  for (let tentativa = 1; !buf; tentativa++) {
    try { buf = await page.screenshot({ type: 'jpeg', quality: 95, timeout: 120000 }); }
    catch (e) { if (tentativa >= 4) throw e; console.error(`\n  quadro ${i}: ${e.name}, tentando de novo (${tentativa})`); await new Promise((r) => setTimeout(r, 2000)); await page.evaluate((t) => window.__seek(t), i / fps); }
  }
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\r  ${name}: ${(i / fps).toFixed(0)}s / ${total.toFixed(0)}s`);
}
ff.stdin.end();
await browser.close();
const code = await new Promise((r) => ff.on('close', r));
if (code !== 0) { console.error('\nffmpeg falhou:\n' + ffErr); process.exit(1); }
console.log(`\r  ✅  ${out}  (${frames} quadros, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);

// versão para a web: 720 px no lado menor, bem mais leve para <video preload="none">
if (flag('--web')) {
  const scale = LARGURA > ALTURA ? 'scale=-2:720' : 'scale=720:-2';
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-vf', scale, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(OUT, `${name}-web.mp4`)], { stdio: 'inherit' });
  console.log(`  ✅  ${path.join(OUT, `${name}-web.mp4`)}`);
}
// pôster para o <video poster>: um quadro sem legenda, em webp
if (opt('--poster')) {
  const png = path.join(BUILD, 'poster.png');
  const p = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
  const pg = await p.newPage({ viewport: { width: LARGURA, height: ALTURA } });
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '?captions=0', { waitUntil: 'networkidle' });
  await pg.evaluate(() => window.__ready);
  await pg.evaluate((t) => window.__seek(t), parseFloat(opt('--poster')));
  await pg.screenshot({ path: png });
  await p.close();
  const webp = path.join(OUT, `${NOME}-poster.webp`);
  const r = spawnSync('cwebp', ['-q', '82', '-quiet', png, '-o', webp]);
  if (r.status !== 0) spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', png, '-quality', '82', webp]);
  console.log(`  ✅  ${webp}`);
}
console.log('');
