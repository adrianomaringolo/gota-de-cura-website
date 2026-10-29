#!/usr/bin/env node
/**
 * Narração com o ElevenLabs, com o tempo de cada palavra.
 *
 *   node video/scripts/voice.mjs                     # todas as cenas → video/voz/
 *   node video/scripts/voice.mjs --only 2,5          # só essas cenas
 *   node video/scripts/voice.mjs --out <dir>         # noutra pasta (takes, testes)
 *   node video/scripts/voice.mjs --voice-id <id>     # outra voz (sobrescreve narracao.json)
 *
 * Usa o endpoint /with-timestamps: além do mp3, grava cena-NN.json com o
 * início e o fim de cada palavra. É isso que faz a legenda e a animação baterem
 * com a fala sem adivinhar por silêncio. Depois rode o falas.mjs.
 */

import fs from 'fs';
import path from 'path';
import { cfg, VOZ, opt, cena, apiKey, elevenlabs } from './env.mjs';

apiKey();
const voiceId = opt('--voice-id') || cfg.voice_id;
const model = cfg.model || 'eleven_v3';
const only = opt('--only')?.split(',').map(Number);
const sotaque = cfg.sotaque ?? '';
const outDir = opt('--out') ? path.resolve(opt('--out')) : VOZ;
fs.mkdirSync(outDir, { recursive: true });

// Caracteres com tempo → palavras com tempo (a pontuação fica grudada na palavra).
function words(alignment) {
  const { characters: ch, character_start_times_seconds: st, character_end_times_seconds: en } = alignment;
  const out = [];
  let cur = null;
  ch.forEach((c, i) => {
    if (/\s/.test(c)) { if (cur) out.push(cur); cur = null; return; }
    if (!cur) cur = { w: '', start: st[i], end: en[i] };
    cur.w += c;
    cur.end = en[i];
  });
  if (cur) out.push(cur);
  // tags de direção do eleven_v3 ([warmly]) e reticências são para a voz, não para a legenda
  // (uma tag pode ter várias palavras: [Brazilian Portuguese accent])
  let dentro = false;
  return out
    .filter((w) => {
      const era = dentro || w.w.startsWith('[');
      dentro = era && !w.w.endsWith(']');
      return !era;
    })
    .map((w) => ({ ...w, w: w.w.replace(/\.\.\.|…/g, '') }))
    .filter((w) => w.w)
    .map((w) => ({ ...w, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
}

console.log(`\n🎙️  voz ${voiceId} · ${model}\n`);
await Promise.all(cfg.cenas.map(async (c, i) => {
  if (only && !only.includes(i + 1)) return;
  const name = cena(i);
  // só o eleven_v3 entende as tags de direção; os outros modelos as leriam em voz alta
  const text = model === 'eleven_v3' ? `${sotaque} ${c.text}`.trim() : c.text.replace(/\[[^\]]*\]\s*/g, '');
  const res = await elevenlabs(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    { text, model_id: model, language_code: cfg.idioma || 'pt', voice_settings: cfg.voice_settings });
  if (!res.ok) { console.error(`  ❌  ${name}: ${res.status} ${await res.text()}`); process.exitCode = 1; return; }
  const data = await res.json();
  fs.writeFileSync(path.join(outDir, `${name}.mp3`), Buffer.from(data.audio_base64, 'base64'));
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify({ text: c.text.replace(/\[[^\]]*\]\s*/g, ''), words: words(data.alignment) }, null, 2));
  console.log(`  ✅  ${name}  ${c.text}`);
}));
console.log(`\n  Saída: ${outDir}\n`);
