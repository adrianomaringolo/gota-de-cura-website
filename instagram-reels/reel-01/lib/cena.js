/* global gsap */
// Peças de animação comuns aos vídeos de produto. Script clássico (o vídeo abre
// por file://, onde módulos ES não carregam): expõe window.Cena.
//
//   const c = Cena(window.TIMELINE);        // timeline GSAP pausada + helpers
//   c.tl.to(...)                             // a timeline em si
//   c.W('lancar', 'valor')                   // início da palavra dita (a n-ésima: W(id, 'o', 1))
//   c.S('lancar')                            // início da cena
//   c.showScreen(phone, el, t)               // troca a tela de um aparelho, com fusão curta
//   c.scrollTo(el, y, t)                     // rola a .page de uma tela até y (px CSS da captura)
//   c.ring(el, [x, y, w, h], t)              // contorno de destaque; desliza para o próximo retângulo
//   c.ringOff(el, t)
//   c.tap(x, y, t)                           // toque no celular (coordenadas da tela)
//   c.copyIn(id, t) / c.item(copy, i, t)     // texto lateral: título entra, itens acendem nas palavras
//   c.out(els, t)                            // sai subindo
//   c.finish()                               // legenda karaokê + window.__seek / __total; chame por último
//
// Coordenadas das telas: px CSS da captura (celular 390 de largura, computador
// 1440), tiradas de build/telas/caixas.json.

window.Cena = function Cena(T, opts = {}) {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  if (params.get('captions') === '0') document.documentElement.classList.add('no-captions');

  const scene = (id) => {
    const s = T.scenes.find((x) => x.id === id);
    if (!s) throw new Error(`cena "${id}" não existe no narracao.json`);
    return s;
  };
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  /** início da palavra `needle` (a n-ésima) dentro da cena; palavra curta (≤ 3 letras) só casa inteira */
  function W(id, needle, nth = 0) {
    const n = norm(needle);
    const hits = scene(id).words.filter((w) => (n.length <= 3 ? norm(w.w) === n : norm(w.w).startsWith(n)));
    if (!hits[nth]) throw new Error(`palavra "${needle}" (${nth}) não está na cena ${id}`);
    return hits[nth].start;
  }
  const S = (id) => scene(id).start;
  const E = (id) => scene(id).start + scene(id).dur;

  gsap.defaults({ ease: 'power2.out', duration: 0.8 });
  const tl = gsap.timeline({ paused: true });

  const current = new Map();
  function showScreen(box, el, at, dur = 0.4) {
    const prev = current.get(box);
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'power1.inOut', immediateRender: false }, at);
    if (prev && prev !== el) tl.set(prev, { autoAlpha: 0 }, at + dur);
    current.set(box, el);
  }
  function scrollTo(el, y, at, dur = 1.3) {
    tl.to($('.page', el), { y: -y, duration: dur, ease: 'power2.inOut' }, at);
  }
  const ringOn = new Set();
  function ring(el, [x, y, w, h], at, dur = 0.6) {
    const r = $('.ring', el);
    const pad = r.classList.contains('ring--d') ? 8 : 5;
    const box = { left: x - pad, top: y - pad, width: w + 2 * pad, height: h + 2 * pad };
    if (!ringOn.has(r)) {
      tl.set(r, box, at);
      tl.fromTo(r, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.45, immediateRender: false }, at);
      ringOn.add(r);
    } else tl.to(r, { ...box, duration: dur, ease: 'power2.inOut' }, at);
  }
  function ringOff(el, at) {
    tl.to($('.ring', el), { autoAlpha: 0, duration: 0.3 }, at);
    ringOn.delete($('.ring', el));
  }
  function tap(x, y, at, sel = '.tap') {
    tl.set(sel, { left: x, top: y }, at);
    tl.fromTo(sel, { autoAlpha: 0.95, scale: 0.35 }, { autoAlpha: 0, scale: 1.5, duration: 0.6, ease: 'power1.out', immediateRender: false }, at);
  }
  function copyIn(id, at) {
    const c = $(`.copy[data-c="${id}"]`);
    tl.fromTo(c, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, immediateRender: false }, at);
    return c;
  }
  function item(c, i, at) {
    tl.fromTo($$('li', c)[i], { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.55, immediateRender: false }, at);
  }
  function out(els, at, dy = -16) { tl.to(els, { autoAlpha: 0, y: `+=${dy}`, duration: 0.5, ease: 'power1.in' }, at); }

  /** legenda karaokê (o bloco aparece inteiro, cada palavra acende quando é dita) e o controle do render */
  function finish() {
    const cap = $('.cap');
    gsap.set('.captions', { autoAlpha: 0 });
    let shown = -1;
    function renderCap(i) {
      if (i === shown) return;
      shown = i;
      cap.innerHTML = i < 0 ? '' : T.cues[i].words.map((w) => `<span class="cw">${w.w}</span>`).join(' ');
    }
    // derivada do tempo: recalculada a cada quadro, para frente ou para trás
    function updateCaptions(t) {
      const i = T.cues.findIndex((q) => t >= q.start && t < q.end);
      gsap.set('.captions', { autoAlpha: i < 0 ? 0 : 1 });
      renderCap(i);
      if (i < 0) return;
      T.cues[i].words.forEach((w, j) => {
        const k = gsap.utils.clamp(0, 1, (t - w.start + 0.04) / 0.22);
        cap.children[j].style.opacity = String(0.45 + 0.55 * k);
      });
    }
    tl.to({}, { duration: 0.001 }, T.total - 0.001);
    window.__total = T.total;
    window.__seek = (t) => { tl.time(t, false); updateCaptions(t); };
  }

  /** o crédito discreto no pé, depois que a última legenda sai */
  const lastCueEnd = () => T.cues[T.cues.length - 1].end;

  return { tl, $, $$, W, S, E, showScreen, scrollTo, ring, ringOff, tap, copyIn, item, out, finish, lastCueEnd, params };
};

/** Espera fontes e imagens, monta (build) e posiciona: ?t=12.5 parado, ?play toca com o áudio. */
window.Cena.start = function start(build) {
  const imgs = [...document.querySelectorAll('img')].map((i) => i.decode().catch(() => {}));
  window.__ready = Promise.all([document.fonts.ready, ...imgs]).then(() => { build(); return true; });
  window.__ready.then(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('play')) {
      const audio = new Audio('build/audio.m4a');
      const t0 = parseFloat(params.get('t') || '0');
      audio.currentTime = t0;
      audio.play().catch(() => {});
      const begin = performance.now() - t0 * 1000;
      gsap.ticker.add(() => window.__seek(Math.min(window.__total, (performance.now() - begin) / 1000)));
    } else {
      window.__seek(parseFloat(params.get('t') || '0'));
    }
  });
};
