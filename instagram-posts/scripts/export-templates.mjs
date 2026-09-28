#!/usr/bin/env node
/**
 * Exporta os previews dos templates de post para PNG, ao lado de cada HTML.
 *
 * Uso:
 *   node scripts/export-templates.mjs                  # todos os templates
 *   node scripts/export-templates.mjs ficha-da-planta  # só um
 *
 * Os PNGs saem em 1× (1080×1350) para ficarem leves no git.
 * Chrome/Chromium: mesmo esquema do export.mjs (PUPPETEER_EXECUTABLE_PATH).
 */

import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PREVIEWS = path.join(__dirname, '..', 'templates', 'previews')
const width = 1080
const height = 1350

const only = process.argv[2]
const ids = fs
  .readdirSync(PREVIEWS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .filter((id) => !only || id === only)

if (only && ids.length === 0) {
  console.error(`Template não encontrado: templates/previews/${only}`)
  process.exit(1)
}

const launchOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files'],
}
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
}

const browser = await puppeteer.launch(launchOptions)

for (const id of ids) {
  const dir = path.join(PREVIEWS, id)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort()
  console.log(`\n🧩  ${id}`)

  for (const file of files) {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: 1 })
    await page.goto(`file://${path.join(dir, file)}`, { waitUntil: 'networkidle0', timeout: 20000 })
    await page.waitForFunction(() => document.fonts.ready)
    await new Promise((r) => setTimeout(r, 1500))
    const png = file.replace('.html', '.png')
    await page.screenshot({ path: path.join(dir, png), type: 'png', clip: { x: 0, y: 0, width, height } })
    await page.close()
    console.log(`  ✅  ${png}`)
  }
}

await browser.close()
console.log(`\n🎉  Previews em templates/previews/\n`)
