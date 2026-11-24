#!/usr/bin/env node
/**
 * Renderiza index.html quadro a quadro (Playwright) e junta com a trilha (ffmpeg).
 *   node divulgacao/videos/16x9/tv-loja-linhas/render.mjs               → video-tv-16x9.mp4
 *   node divulgacao/videos/16x9/tv-loja-linhas/render.mjs --snap 1,9,60  → PNGs + grade em /tmp-like build/
 */
import fs from 'fs'
import path from 'path'
import { spawn, spawnSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(HERE, '../../../../instagram-reels/package.json'))
const { chromium } = require('playwright')

const FPS = 30
const snapArg = process.argv.includes('--snap') ? process.argv[process.argv.indexOf('--snap') + 1] : null
const out = path.join(HERE, 'gotadecura-gotinha-tv-16x9.mp4')

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }))
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1 })
await page.goto(pathToFileURL(path.join(HERE, 'index.html')).href, { waitUntil: 'networkidle' })
await page.evaluate(() => window.__ready)
const total = await page.evaluate(() => window.__total)

if (snapArg) {
  const dir = path.join(HERE, 'build'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true })
  const times = snapArg.split(',').map(Number)
  const files = []
  for (const t of times) {
    await page.evaluate((t) => window.__seek(t), t)
    const f = path.join(dir, `t-${t}.png`); await page.screenshot({ path: f }); files.push(f)
  }
  await browser.close()
  const cols = 3, w = 640, h = 360, rows = Math.ceil(files.length / cols)
  const inputs = files.flatMap((f) => ['-i', f])
  const scaled = files.map((_, i) => `[${i}:v]scale=${w}:${h}[v${i}]`)
  const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|')
  spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', `${scaled.join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}`, '-frames:v', '1', path.join(dir, 'grid.png')])
  console.log(path.join(dir, 'grid.png'))
  process.exit()
}

// trilha: entra suave, sai suave no fim, e cobre exatamente a duração do vídeo
const audio = path.join(HERE, 'build', 'audio.m4a')
fs.mkdirSync(path.dirname(audio), { recursive: true })
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-stream_loop', '-1', '-i', path.join(HERE, 'assets', 'musica.mp3'), '-t', String(total),
  '-af', `volume=0.55,afade=t=in:st=0:d=2,afade=t=out:st=${(total - 3).toFixed(2)}:d=3`, '-c:a', 'aac', '-b:a', '192k', audio])
if (r.status !== 0) process.exit(1)

const frames = Math.round(total * FPS)
const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-tune', 'animation',
  '-c:a', 'copy', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'pipe'] })
let err = ''; ff.stderr.on('data', (d) => { err = (err + d).slice(-2000) })
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.__seek(t), i / FPS)
  const buf = await page.screenshot({ type: 'jpeg', quality: 95 })
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  if (i % FPS === 0) process.stdout.write(`\r  ${(i / FPS).toFixed(0)}s / ${total.toFixed(0)}s`)
}
ff.stdin.end(); await browser.close()
const code = await new Promise((r) => ff.on('close', r))
if (code !== 0) { console.error(err); process.exit(1) }
console.log(`\n  ✅ ${out}`)
