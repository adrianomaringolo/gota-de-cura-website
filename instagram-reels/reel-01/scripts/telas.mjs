#!/usr/bin/env node
/**
 * Captura as telas reais do app (celular e computador) para a composição,
 * a partir do video/telas.json. Também mede onde ficam os elementos que o
 * vídeo aponta (contornos, toques), em px CSS da página: build/telas/caixas.json.
 *
 *   node video/scripts/telas.mjs              # todas
 *   node video/scripts/telas.mjs inicio agenda   # só essas
 *
 * Dados e login ficam no video/telas.setup.mjs (opcional), que exporta
 *   export async function preparar(context, page, { aparelho, base }) { ... }
 * para pôr cookie de sessão, interceptar a API com uma conta fictícia, etc.
 * Ver reference/telas.md da skill. Nenhum dado real deve aparecer nas imagens.
 *
 * Saída: build/telas/<m|d>-<nome>.png (+ <m|d>-<nome>-<barra>.png das barras fixas)
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { pathToFileURL } from 'url';
import { ROOT, BUILD, args } from './env.mjs';

const { chromium, devices } = await import('playwright').catch(() => import('@playwright/test'));

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'telas.json'), 'utf8'));
const DIR = path.join(BUILD, 'telas');
fs.mkdirSync(DIR, { recursive: true });
const BASE = cfg.base || 'http://localhost:3000';
const so = args.filter((a) => !a.startsWith('--'));
const setupFile = path.join(ROOT, 'telas.setup.mjs');
const setup = fs.existsSync(setupFile) ? await import(pathToFileURL(setupFile).href) : {};

const APARELHOS = {
  m: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  d: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  ...cfg.aparelhos,
};
const ESCONDER = ['nextjs-portal', '.tsqd-parent-container', '#__next-build-watcher', ...(cfg.esconder || [])];

const CAIXAS = path.join(DIR, 'caixas.json');
const caixas = fs.existsSync(CAIXAS) ? JSON.parse(fs.readFileSync(CAIXAS, 'utf8')) : {};
const loc = (page, sel) => page.locator(sel).first();

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
let falhou = false;
for (const [ap, opts] of Object.entries(APARELHOS)) {
  const telas = cfg.telas.filter((t) => (!t.so || t.so === ap) && (!so.length || so.includes(t.nome)));
  if (!telas.length) continue;
  const context = await browser.newContext({ ...opts, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', reducedMotion: 'reduce', serviceWorkers: 'block' });
  // relógio fixo: o app acha que é o dia da demonstração (Proxy, não subclasse: Date() sem new continua texto)
  if (cfg.relogio) {
    await context.addInitScript((alvo) => {
      const delta = alvo - Date.now(); const R = Date;
      globalThis.Date = new Proxy(R, {
        construct: (t, a) => (a.length ? new R(...a) : new R(R.now() + delta)),
        apply: () => new R(R.now() + delta).toString(),
        get: (t, p) => (p === 'now' ? () => R.now() + delta : Reflect.get(t, p)),
      });
    }, Date.parse(cfg.relogio));
  }
  // sem cursor piscando nem overlays de desenvolvimento
  await context.addInitScript((sels) => {
    const css = () => {
      const s = document.createElement('style');
      s.textContent = `${sels.join(',')} { display: none !important; } * { caret-color: transparent !important; }`;
      document.head.appendChild(s);
    };
    if (document.head) css(); else document.addEventListener('DOMContentLoaded', css);
  }, ESCONDER);
  const page = await context.newPage();
  page.setDefaultTimeout(cfg.timeout || 60000);
  await setup.preparar?.(context, page, { aparelho: ap, base: BASE });

  for (const t of telas) {
    const id = `${ap}-${t.nome}`;
    try {
      if (t.url) {
        await page.goto(new URL(t.url, BASE).toString(), { waitUntil: 'domcontentloaded' });
        // o networkidle nunca chega no dev server do Next (HMR): espera fixa
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(t.carregar ?? 1200);
      }
      for (const p of t.passos || []) {
        if (p.esperarPor) await loc(page, p.esperarPor).waitFor();
        if (p.clicar) await loc(page, p.clicar).click();
        if (p.preencher) await loc(page, p.preencher[0]).fill(p.preencher[1]);
        if (p.digitar) await page.keyboard.type(p.digitar, { delay: 30 });
        if (p.tecla) await page.keyboard.press(p.tecla);
        if (p.rolar) await loc(page, p.rolar).evaluate((el, off) => scrollTo({ top: el.getBoundingClientRect().top + scrollY - off }), p.offset ?? 80);
        if (p.desfocar) await page.evaluate(() => document.activeElement?.blur());
        await page.waitForTimeout(p.esperar ?? 300);
      }
      await page.waitForTimeout(500); // deixa as animações assentarem

      // onde estão os elementos que o vídeo aponta: [x, y, largura, altura], a partir do topo da página
      for (const [nome, sel] of Object.entries(t.medir || {})) {
        const b = await loc(page, sel).evaluate((el) => {
          const r = el.getBoundingClientRect();
          return [r.left, r.top + scrollY, r.width, r.height].map(Math.round);
        }, null, { timeout: 3000 }).catch(() => null);
        if (b) (caixas[id] ??= {})[nome] = b;
        else console.warn(`  ⚠️  ${id}: "${nome}" (${sel}) não encontrado`);
      }

      // página inteira: as barras fixas saem à parte (ficam paradas enquanto a página rola no vídeo)
      const barras = t.inteira ? Object.entries(cfg.barras || {}).filter(([k]) => !cfg.barrasSo?.[k] || cfg.barrasSo[k] === ap) : [];
      for (const [nome, sel] of barras) {
        const el = loc(page, sel);
        if (!(await el.count()) || !(await el.isVisible())) continue;
        await el.screenshot({ path: path.join(DIR, `${id}-${nome}.png`), animations: 'disabled' });
        await el.evaluate((n) => n.style.setProperty('visibility', 'hidden', 'important'));
      }
      await page.screenshot({ path: path.join(DIR, `${id}.png`), fullPage: !!t.inteira, animations: 'disabled' });
      for (const [, sel] of barras) await loc(page, sel).evaluate((n) => n.style.removeProperty('visibility')).catch(() => {});
      console.log(`  ✓ ${id}${t.inteira ? ' (inteira)' : ''}`);
    } catch (err) {
      falhou = true;
      console.error(`  ✗ ${id}: ${err.message.split('\n')[0]}`);
      await page.screenshot({ path: path.join(DIR, `_erro-${id}.png`) }).catch(() => {});
    }
  }
  await context.close();
}
await browser.close();
fs.writeFileSync(CAIXAS, JSON.stringify(caixas, null, 2));

// folha de contato para conferir: celular numa fileira, computador na outra (só o topo de cada tela)
const barrasNomes = Object.keys(cfg.barras || {});
const fileira = (ap, w, h) => cfg.telas.filter((t) => (!t.so || t.so === ap)).map((t) => path.join(DIR, `${ap}-${t.nome}.png`)).filter((f) => fs.existsSync(f))
  .map((f) => ({ f, w, h })).filter(({ f }) => !barrasNomes.some((b) => f.endsWith(`-${b}.png`)));
const linhas = [fileira('m', 300, 650), fileira('d', 640, 400)].filter((l) => l.length);
if (linhas.length) {
  const todas = linhas.flat();
  const filtros = todas.map(({ w, h }, i) => `[${i}:v]scale=${w}:-2,crop=${w}:min(ih\\,${h}):0:0,pad=${w}:${h}:0:0:white[v${i}]`);
  let k = 0;
  const rows = linhas.map((l, r) => { const ins = l.map(() => `[v${k++}]`).join(''); return l.length > 1 ? `${ins}hstack=${l.length}[r${r}]` : `${ins}null[r${r}]`; });
  const larg = Math.max(...linhas.map((l) => l.reduce((a, x) => a + x.w, 0)));
  const pads = linhas.map((_, r) => `[r${r}]pad=${larg}:ih:0:0:white[p${r}]`);
  const fim = linhas.length > 1 ? `${linhas.map((_, r) => `[p${r}]`).join('')}vstack=${linhas.length}` : '[p0]null';
  spawnSync('ffmpeg', ['-y', '-v', 'error', ...todas.flatMap(({ f }) => ['-i', f]), '-filter_complex', [...filtros, ...rows, ...pads, fim].join(';'), '-frames:v', '1', path.join(BUILD, 'folha.png')]);
  console.log(`\n  📋 folha de contato: ${path.join(BUILD, 'folha.png')}`);
}
console.log(`\n  ${DIR}\n`);
process.exit(falhou ? 1 : 0);
