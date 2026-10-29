#!/usr/bin/env node
/**
 * Amostras de voz para escolher a narração: a mesma frase em várias vozes.
 *
 *   node video/scripts/vozes.mjs masculina            # vozes pt-BR masculinas já testadas
 *   node video/scripts/vozes.mjs feminina
 *   node video/scripts/vozes.mjs Nome:voiceId,Outro:id # quaisquer vozes
 *   node video/scripts/vozes.mjs feminina --texto "..." --sotaque "[Brazilian Portuguese accent]"
 *
 * Sem --texto, lê a primeira fala do narracao.json. Saída: video/build/vozes/<nome>.mp3
 * (e abre a pasta no Finder). IDs novos: json2video.com/ai-voices/elevenlabs/languages/portuguese/
 * (a chave só precisa de text_to_speech; sem voices_read não dá para listar pela API).
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { BUILD, cfg, args, opt, apiKey, elevenlabs } from './env.mjs';

const VOZES = {
  feminina: {
    adeline: '5l5f8iK3YPeGga21rQIX', // precisa do sotaque "[Brazilian Portuguese accent]"
    ana: 'vibfi5nlk3hs8Mtvf9Oy',
    gabby: 'QJd9SLe6MVCdF6DR0EAu',
    marianne: 'iScHbNW8K33gNo3lGgbo',
    evelin: 'x3mAOLD9WzlmrFCwA1S3',
  },
  masculina: {
    rafael: 'dX7gRq1dIvLTgUaWpEFn',
    leonardo: 'UaeEQHfiDI8l58WWXiwS',
    matheus: 'xWdpADtEio43ew1zGxUQ',
    borges: '9pDzHy2OpOgeXM8SeL0t',
    guilherme: 'CbNfj17erd366KLOAufd',
  },
};

apiKey();
const pedido = args[0] || 'feminina';
const vozes = VOZES[pedido] || Object.fromEntries(pedido.split(',').map((p) => p.split(':')));
const texto = opt('--texto') || cfg.cenas?.[0]?.text || '[warmly] Olá! Esta é uma amostra da minha voz. [pause]';
const sotaque = opt('--sotaque') ?? '';
const dir = path.join(BUILD, 'vozes');
fs.mkdirSync(dir, { recursive: true });

await Promise.all(Object.entries(vozes).map(async ([nome, id]) => {
  // a Adeline sai com sotaque de Portugal sem a tag
  const tag = sotaque || (nome === 'adeline' ? '[Brazilian Portuguese accent]' : '');
  const r = await elevenlabs(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`,
    { text: `${tag} ${texto}`.trim(), model_id: 'eleven_v3', language_code: 'pt',
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true } });
  if (!r.ok) return console.log(`  ❌  ${nome}: ${r.status} ${(await r.text()).slice(0, 160)}`);
  fs.writeFileSync(path.join(dir, `${nome}.mp3`), Buffer.from(await r.arrayBuffer()));
  console.log(`  ✅  ${nome}  ${id}`);
}));
console.log(`\n  ${dir}\n`);
if (process.platform === 'darwin') spawnSync('open', [dir]);
