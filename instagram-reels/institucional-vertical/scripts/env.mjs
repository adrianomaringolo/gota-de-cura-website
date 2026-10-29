// Coisas comuns aos scripts do vídeo: raiz, narracao.json, chave do ElevenLabs, ffprobe.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = path.join(ROOT, '..');
export const BUILD = path.join(ROOT, 'build');
export const OUT = path.join(ROOT, 'output');
export const VOZ = path.join(ROOT, 'voz');

export const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'narracao.json'), 'utf8'));
export const NOME = cfg.nome || path.basename(REPO);
export const [LARGURA, ALTURA] = cfg.formato === '9:16' ? [1080, 1920] : [1920, 1080];

export const cena = (i) => `cena-${String(i + 1).padStart(2, '0')}`;
export const resolve = (p) => path.resolve(ROOT, p.replace(/^~(?=\/)/, os.homedir()));

export const args = process.argv.slice(2);
export const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
export const flag = (name) => args.includes(name);

export const probe = (f) => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());

/** ELEVENLABS_API_KEY do ambiente, de video/.env ou de ~/.env_secrets (só precisa de text_to_speech). */
export function apiKey() {
  for (const envPath of [path.join(ROOT, '.env'), path.join(os.homedir(), '.env_secrets'),
    path.join(os.homedir(), 'Projects/personal/adrianomaringolo.dev/instagram-reels/.env')]) {
    if (process.env.ELEVENLABS_API_KEY || !fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.*)\s*$/);
      if (m) process.env.ELEVENLABS_API_KEY = m[1].replace(/^["']|["']$/g, '');
    }
  }
  if (!process.env.ELEVENLABS_API_KEY) { console.error('ELEVENLABS_API_KEY não definida.'); process.exit(1); }
  return process.env.ELEVENLABS_API_KEY;
}

/** Envelope de volume (dB RMS) em janelas de 50 ms. */
export function envelope(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-af',
    'asetnsamples=2205,astats=metadata=1:reset=1,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-',
    '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.stdout.split('\n').filter((l) => l.includes('RMS_level')).map((l) => {
    const v = parseFloat(l.split('=').pop());
    return Number.isFinite(v) ? v : -120;
  });
}

/**
 * Chamada ao ElevenLabs com fila (o plano limita a 3 requisições ao mesmo tempo)
 * e nova tentativa quando a API responde 429.
 */
const LIMITE = 3;
let ativos = 0;
const fila = [];
export async function elevenlabs(url, body) {
  // a vaga passa direto para quem está na fila, sem voltar ao contador
  if (ativos >= LIMITE) await new Promise((ok) => fila.push(ok));
  else ativos++;
  try {
    for (let tentativa = 0; ; tentativa++) {
      const res = await fetch(url, { method: 'POST', headers: { 'xi-api-key': apiKey(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.status !== 429 || tentativa >= 5) return res;
      await new Promise((ok) => setTimeout(ok, 1500 * (tentativa + 1)));
    }
  } finally {
    const proximo = fila.shift();
    if (proximo) proximo();
    else ativos--;
  }
}
