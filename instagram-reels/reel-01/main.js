/* global gsap, Cena */
// Reel dos 9 anos da Gota de Cura. Uma timeline GSAP pausada; cada movimento começa
// na palavra da narração que fala dele (TIMELINE, gerado por scripts/build.mjs).
// Trocar a voz ou o texto e rodar o build de novo ressincroniza tudo.

Cena.start(() => {
  const c = Cena(window.TIMELINE);
  const { tl, $, $$, W, S, E } = c;

  // ── helpers ──────────────────────────────────────────────────────────────
  /** quebra o texto em palavras com máscara (a palavra sobe de dentro dela); devolve os .wi */
  const split = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
    const wis = $$('.wi', el);
    gsap.set(wis, { yPercent: 115 });
    return wis;
  };
  const rise = (els, at, dur = 0.75) =>
    tl.fromTo(els, { yPercent: 115 }, { yPercent: 0, duration: dur, ease: 'power3.out', immediateRender: false }, at);
  const fade = (els, at, from = {}, to = {}, dur = 0.7) =>
    tl.fromTo(els, { autoAlpha: 0, ...from }, { autoAlpha: 1, duration: dur, immediateRender: false, ...to }, at);
  /** Ken Burns: zoom lento e contínuo numa foto */
  const drift = (el, at, dur, from = 1.14, to = 1.0, x = 0) =>
    tl.fromTo(el, { scale: from, xPercent: x }, { scale: to, xPercent: 0, duration: dur, ease: 'none', immediateRender: false }, at);

  const SC = { abertura: '.s1', sabonete: '.s2', chacara: '.s3', voluntarios: '.s4', produtos: '.s5', fecho: '.s6', logo: '.s7' };
  const ids = Object.keys(SC);
  gsap.set('.sc', { autoAlpha: 0 });

  // as seções se sobrepõem em ordem: a próxima funde por cima da anterior
  ids.forEach((id, i) => {
    if (i === 0) tl.set(SC[id], { autoAlpha: 1 }, 0);
    else {
      tl.fromTo(SC[id], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power1.inOut', immediateRender: false }, S(id) - 0.4);
      tl.set(SC[ids[i - 1]], { autoAlpha: 0 }, S(id) + 0.2);
    }
  });

  // ── 1 · abertura: o número 9 ─────────────────────────────────────────────
  {
    gsap.set('.nine', { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 58%' });
    gsap.set('.ripple', { autoAlpha: 0 });
    const anos = split($('.anos'));
    const deGota = split($('.de-gota'));
    const t = W('abertura', 'Nove');
    drift('.s1 .fx', 0, E('abertura') + 0.6, 1.25, 1.05);
    tl.fromTo('.nine', { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.5)', immediateRender: false }, t - 0.2);
    tl.fromTo('.r1', { scale: 0.3, autoAlpha: 0.9 }, { scale: 1.9, autoAlpha: 0, duration: 1.8, ease: 'power2.out', immediateRender: false }, t);
    tl.fromTo('.r2', { scale: 0.3, autoAlpha: 0.7 }, { scale: 1.9, autoAlpha: 0, duration: 1.8, ease: 'power2.out', immediateRender: false }, t + 0.4);
    // o 9 respira enquanto o resto entra
    tl.to('.nine', { scale: 1.04, duration: 2.6, ease: 'sine.inOut' }, t + 1.2);
    rise(anos, W('abertura', 'anos') - 0.1);
    const times = [W('abertura', 'de', 0), W('abertura', 'gota'), W('abertura', 'de', 1), W('abertura', 'cura')];
    deGota.forEach((el, i) => rise(el, times[i] - 0.1));
  }

  // ── 2 · sabonete, 2017 ───────────────────────────────────────────────────
  {
    const tt = split($('.t2'));
    gsap.set(['.k2', '.year', '.card', '.badge', '.p-hid'], { autoAlpha: 0 });
    const yr = $('#yr');
    yr.textContent = '2000';
    fade('.k2', S('sabonete') + 0.1, { y: 20 }, { y: 0 });
    const a = W('sabonete', 'dois');
    const b = W('sabonete', 'dezessete');
    const counter = { v: 2000 };
    fade('.year', a - 0.25, { y: 40 }, { y: 0 }, 0.6);
    tl.fromTo(counter, { v: 2000 }, { v: 2017, duration: b - a + 0.5, ease: 'power2.out', immediateRender: false, onUpdate: () => { yr.textContent = String(Math.round(counter.v)); } }, a);
    const ts = [W('sabonete', 'um'), W('sabonete', 'sabonete'), W('sabonete', 'artesanal')];
    tt.forEach((el, i) => rise(el, ts[i] - 0.15));
    const cardAt = W('sabonete', 'sabonete') - 0.25;
    tl.fromTo('.c-sab', { autoAlpha: 0, y: 180, rotation: -7 }, { autoAlpha: 1, y: 0, rotation: -2, duration: 1.0, ease: 'power3.out', immediateRender: false }, cardAt);
    drift('.c-sab img', cardAt, E('sabonete') - cardAt + 0.6, 1.2, 1.02);
    const h = W('sabonete', 'hidrolato');
    tl.fromTo('.badge', { autoAlpha: 0, scale: 0.3, rotation: -25 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.8)', immediateRender: false }, h - 0.15);
    tl.fromTo('.p-hid', { autoAlpha: 0, x: -70 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', immediateRender: false }, W('sabonete', 'melaleuca') - 0.35);
  }

  // ── 3 · a chácara ────────────────────────────────────────────────────────
  {
    const big = split($('.big3'));
    gsap.set(['.chip', '.arch', '.p-mae'], { autoAlpha: 0 });
    gsap.set('.arch .ph', { autoAlpha: 0 });
    gsap.set('.arch .ph[data-p="portao"]', { autoAlpha: 1 });
    const t0 = W('chacara', 'chacara');
    rise(big, t0 - 0.2, 0.8);
    tl.fromTo('.arch', { autoAlpha: 0, y: 120, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', immediateRender: false }, S('chacara') + 0.05);
    const photo = (k, at, dur) => {
      const img = $(`.arch .ph[data-p="${k}"]`);
      if (k !== 'portao') tl.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, at);
      drift(img, at, dur, 1.16, 1.02);
    };
    photo('portao', S('chacara') + 0.05, W('chacara', 'plantar') - S('chacara') + 0.5);
    photo('canteiros', W('chacara', 'plantar') - 0.3, W('chacara', 'colher') - W('chacara', 'plantar') + 0.8);
    photo('lavanda', W('chacara', 'colher') - 0.3, W('chacara', 'destilar') - W('chacara', 'colher') + 0.8);
    photo('panela', W('chacara', 'destilar') - 0.3, W('chacara', 'mae') - W('chacara', 'destilar') + 0.8);
    photo('placa', W('chacara', 'mae') - 0.3, E('chacara') - W('chacara', 'mae') + 1.2);
    // verbos acendem na palavra dita e ficam acesos
    const chips = $$('.chip');
    fade(chips, W('chacara', 'aprendeu') - 0.1, { y: 24 }, { y: 0, stagger: 0.12 }, 0.6);
    chips.forEach((el) => {
      const at = W('chacara', el.dataset.k) - 0.05;
      tl.to(el, { backgroundColor: '#5d3b97', color: '#ffffff', duration: 0.3 }, at);
      tl.fromTo(el, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, at);
    });
    tl.fromTo('.p-mae', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, W('chacara', 'mae') - 0.1);
  }

  // ── 4 · muitas mãos voluntárias ──────────────────────────────────────────
  {
    gsap.set(['.k4', '.pc'], { autoAlpha: 0 });
    const lines = $$('.big4 .l').map(split);
    fade('.k4', W('voluntarios', 'etapa') - 0.25, { y: 20 }, { y: 0 });
    tl.fromTo('.pc0', { autoAlpha: 0, y: 140, rotation: 0 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, ease: 'power3.out', immediateRender: false }, S('voluntarios') + 0.1);
    drift('.pc0 img', S('voluntarios') + 0.1, W('voluntarios', 'ganhou') - S('voluntarios') + 0.5, 1.12, 1.0);
    const g = W('voluntarios', 'ganhou');
    tl.to('.pc0', { rotation: -3.5, x: -22, y: -10, duration: 0.8, ease: 'power2.inOut' }, g - 0.1);
    const m = W('voluntarios', 'muitas');
    const mo = W('voluntarios', 'maos');
    tl.fromTo('.pc1', { autoAlpha: 0, y: 260, rotation: 9 }, { autoAlpha: 1, y: 30, rotation: 2.5, duration: 0.9, ease: 'back.out(1.3)', immediateRender: false }, g + 0.05);
    tl.fromTo('.pc2', { autoAlpha: 0, y: 260, rotation: -9 }, { autoAlpha: 1, y: 60, rotation: -2, duration: 0.9, ease: 'back.out(1.3)', immediateRender: false }, m);
    tl.fromTo('.pc3', { autoAlpha: 0, y: 260, rotation: 9 }, { autoAlpha: 1, y: 90, rotation: 3, duration: 0.9, ease: 'back.out(1.3)', immediateRender: false }, mo);
    rise(lines[0], m - 0.15);
    rise(lines[1], W('voluntarios', 'voluntarias') - 0.15, 0.9);
  }

  // ── 5 · o catálogo cresce ────────────────────────────────────────────────
  {
    const tiles = $$('.tile');
    gsap.set(tiles, { autoAlpha: 0 });
    const l1 = split($('.h5 .l1'));
    const l2 = split($('.h5 .l2'));
    rise(l1, W('produtos', 'catalogo') - 0.2);
    rise(l2, W('produtos', 'crescendo') - 0.25, 0.8);
    const names = ['sprays', 'hidrolatos', 'oleos', 'tinturas', 'pomadas', 'gotinha'];
    tiles.forEach((el, i) => {
      const at = W('produtos', names[i]) - 0.2;
      tl.fromTo(el, { autoAlpha: 0, scale: 0.55, rotation: i % 2 ? 5 : -5 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.6)', immediateRender: false }, at);
      drift($('img', el), at, E('produtos') - at + 0.8, 1.12, 1.0);
    });
  }

  // ── 6 · a renda vira pão e agasalho ──────────────────────────────────────
  {
    gsap.set('.pill-top', { autoAlpha: 0 });
    gsap.set('.u', { '--u': 0 });
    drift('.s6 .bgph', S('fecho'), E('fecho') - S('fecho') + 1.2, 1.0, 1.2);
    const a = split($('.ln.a .u'));
    const b = split($('.ln.b .u'));
    const cc = split($('.ln.c'));
    tl.fromTo('.pill-top', { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, W('fecho', 'renda') - 0.35);
    const ta = [W('fecho', 'fatia'), W('fecho', 'fatia'), W('fecho', 'de'), W('fecho', 'pao')];
    a.forEach((el, i) => rise(el, ta[i] - 0.2 + (i === 1 ? 0.06 : 0)));
    const tb = [W('fecho', 'e'), W('fecho', 'no'), W('fecho', 'agasalho')];
    b.forEach((el, i) => rise(el, tb[i] - 0.15));
    tl.fromTo($('.ln.a .u'), { '--u': 0 }, { '--u': 1, duration: 0.7, ease: 'power2.out', immediateRender: false }, W('fecho', 'pao') + 0.15);
    tl.fromTo($('.ln.b .u'), { '--u': 0 }, { '--u': 1, duration: 0.7, ease: 'power2.out', immediateRender: false }, W('fecho', 'agasalho') + 0.2);
    const tc = [W('fecho', 'aos'), W('fecho', 'que'), W('fecho', 'tanto'), W('fecho', 'necessitam')];
    cc.forEach((el, i) => rise(el, tc[i] - 0.1, 0.6));
  }

  // ── 7 · logo ─────────────────────────────────────────────────────────────
  {
    gsap.set(['.lp', '.rg', '.glow', '.url'], { autoAlpha: 0 });
    const g0 = W('logo', 'gota');
    const gDe = W('logo', 'de');
    const gCura = W('logo', 'cura');
    const gTag = W('logo', 'cuidando');
    const drop = Math.max(S('logo') + 0.05, g0 - 0.55);
    tl.fromTo('.glow', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2.4, ease: 'power2.out', immediateRender: false }, S('logo') - 0.2);
    // a gota se forma, com quique, e solta ondas
    tl.fromTo('.lp-drop', { autoAlpha: 0, scale: 0, y: 50 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(2.2)', immediateRender: false }, drop);
    tl.fromTo('.rg1', { autoAlpha: 0.85, scale: 0.3 }, { autoAlpha: 0, scale: 3.6, duration: 2.0, ease: 'power2.out', immediateRender: false }, drop + 0.5);
    tl.fromTo('.rg2', { autoAlpha: 0.6, scale: 0.3 }, { autoAlpha: 0, scale: 3.6, duration: 2.0, ease: 'power2.out', immediateRender: false }, drop + 0.95);
    // o nome entra palavra por palavra, no tempo da fala
    [['.lp-w1', g0], ['.lp-w2', gDe], ['.lp-w3', gCura]].forEach(([sel, at]) => {
      tl.fromTo(sel, { autoAlpha: 0, y: 46, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', immediateRender: false }, at - 0.1);
    });
    // "Cuidando com amor" é escrita da esquerda para a direita
    tl.set('.lp-tag', { autoAlpha: 1, clipPath: 'inset(69% 100% 0% 33.4%)' }, 0);
    tl.fromTo('.lp-tag', { clipPath: 'inset(69% 100% 0% 33.4%)' }, { clipPath: 'inset(69% 0% 0% 33.4%)', duration: 1.5, ease: 'power1.inOut', immediateRender: false }, gTag - 0.05);
    tl.fromTo('.rg3', { autoAlpha: 0.6, scale: 0.3 }, { autoAlpha: 0, scale: 3.6, duration: 2.0, ease: 'power2.out', immediateRender: false }, gTag + 1.2);
    tl.fromTo('.url', { autoAlpha: 0, y: 50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)', immediateRender: false }, W('logo', 'amor') + 0.5);
    // fica respirando até o fim
    tl.fromTo('.lockup', { scale: 1 }, { scale: 1.035, duration: E('logo') + 3.4 - (gTag + 1.6), ease: 'sine.inOut', immediateRender: false }, gTag + 1.6);
  }

  c.finish();
});
