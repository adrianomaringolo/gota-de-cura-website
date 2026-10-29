/* global gsap, Cena */
// Vídeo institucional da Gota de Cura (9:16, Reel). Uma timeline GSAP pausada; cada movimento começa
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
  /** acende um chip na palavra dita */
  const lit = (el, at, to = { backgroundColor: '#5d3b97', color: '#ffffff', borderColor: '#5d3b97' }) => {
    tl.to(el, { ...to, duration: 0.3 }, at);
    tl.fromTo(el, { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, at);
  };

  // seções: a próxima funde por cima da anterior (catálogo é uma seção só para duas cenas)
  const SEC = [['abertura', '.s1'], ['missao', '.s2'], ['visao', '.s3'], ['valores', '.s4'], ['produtos', '.s5'],
    ['site', '.ssite'], ['loja', '.s7'], ['chacara', '.s8'], ['renda', '.s9'], ['logo', '.s10']];
  gsap.set('.sc', { autoAlpha: 0 });
  SEC.forEach(([id, sel], i) => {
    if (i === 0) tl.set(sel, { autoAlpha: 1 }, 0);
    else {
      tl.fromTo(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power1.inOut', immediateRender: false }, S(id) - 0.4);
      tl.set(SEC[i - 1][1], { autoAlpha: 0 }, S(id) + 0.2);
    }
  });

  // ── 1 · abertura ─────────────────────────────────────────────────────────
  {
    const lines = $$('.h1 .l').map(split);
    gsap.set(['.k1', '.since'], { autoAlpha: 0 });
    drift('.ph1', 0, E('abertura') + 0.8, 1.12, 1.0, 2);
    fade('.k1', S('abertura') + 0.1, { y: 20 }, { y: 0 });
    rise(lines[0], W('abertura', 'produtos') - 0.15);
    rise(lines[1], W('abertura', 'artesanais') - 0.1);
    rise(lines[2], W('abertura', 'proposito') - 0.35, 0.9);
    // 2017 conta de 2000 até o ano, junto da fala
    const yr = $('#yr');
    const a = W('abertura', 'dois');
    const b = W('abertura', 'dezessete');
    const k = { v: 2000 };
    yr.textContent = '2000';
    fade('.since', a - 0.3, { y: 30 }, { y: 0 }, 0.6);
    tl.fromTo(k, { v: 2000 }, { v: 2017, duration: b - a + 0.5, ease: 'power2.out', immediateRender: false, onUpdate: () => { yr.textContent = String(Math.round(k.v)); } }, a);
  }

  // ── 2 · missão ───────────────────────────────────────────────────────────
  {
    const lines = $$('.h2 .l').map(split);
    gsap.set(['.k2', '.sub2', '.lbl2', '.s2 .chip'], { autoAlpha: 0 });
    fade('.k2', S('missao') + 0.1, { y: 20 }, { y: 0 });
    rise(lines[0], W('missao', 'bemestar') - 0.2);
    rise(lines[1], W('missao', 'qualidade') - 0.2);
    fade('.sub2', W('missao', 'atraves') - 0.15, { y: 20 }, { y: 0 });
    drift('.a2 img', S('missao') - 0.4, E('missao') - S('missao') + 1.4, 1.18, 1.0);
    fade('.lbl2', W('missao', 'equilibrio') - 0.25, { y: 16 }, { y: 0 }, 0.5);
    $$('.s2 .chip').forEach((el) => {
      const at = W('missao', el.dataset.k);
      fade(el, at - 0.3, { y: 20 }, { y: 0 }, 0.5);
      lit(el, at - 0.05, { backgroundColor: '#ffffff', color: '#503484', borderColor: '#ffffff' });
    });
  }

  // ── 3 · visão ────────────────────────────────────────────────────────────
  {
    const lines = $$('.h3 .l').map(split);
    gsap.set(['.k3', '.s3 .chip', '.a3'], { autoAlpha: 0 });
    fade('.k3', S('visao') + 0.1, { y: 20 }, { y: 0 });
    rise(lines[0], W('visao', 'referencia') - 0.3, 0.85);
    rise(lines[1], W('visao', 'qualidade') - 0.25, 0.85);
    tl.fromTo('.a3', { autoAlpha: 0, y: 120, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', immediateRender: false }, S('visao') + 0.2);
    drift('.a3 img', S('visao') + 0.2, E('visao') - S('visao') + 0.8, 1.2, 1.02);
    const at = { sustentabilidade: W('visao', 'sustentabilidade'), natureza: W('visao', 'natureza'), proximo: W('visao', 'proximo') };
    const start = { sustentabilidade: at.sustentabilidade - 0.3, natureza: W('visao', 'respeito') - 0.3, proximo: at.proximo - 0.7 };
    $$('.s3 .chip').forEach((el) => {
      const k = el.dataset.k;
      fade(el, start[k], { x: -30 }, { x: 0 }, 0.6);
      lit(el, at[k] - 0.05, { backgroundColor: '#ffffff', color: '#503484', borderColor: '#ffffff' });
    });
  }

  // ── 4 · valores ──────────────────────────────────────────────────────────
  {
    const vals = $$('.val');
    gsap.set(['.k4', ...vals], { autoAlpha: 0 });
    fade('.k4', S('valores') + 0.1, { y: 20 }, { y: 0 });
    const names = ['responsabilidade', 'sustentabilidade', 'qualidade', 'transparencia', 'inovacao'];
    vals.forEach((el, i) => {
      tl.fromTo(el, { autoAlpha: 0, x: -260 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, W('valores', names[i]) - 0.35);
    });
  }

  // ── 5 e 6 · catálogo ─────────────────────────────────────────────────────
  {
    const tiles = $$('.tile:not(.more)');
    gsap.set([...tiles, '.tile.more'], { autoAlpha: 0 });
    const l1 = split($('.h5 .l1'));
    const l2 = split($('.h5 .l2'));
    rise(l1, W('produtos', 'catalogo') - 0.25);
    const names = ['hidrolatos', 'oleos', 'sprays', 'sabonetes', 'pomadas', 'tinturas', 'colonias', 'sais', 'gotinha'];
    tiles.forEach((el, i) => {
      const at = W('produtos', names[i]) - 0.25;
      tl.fromTo(el, { autoAlpha: 0, scale: 0.6, rotation: i % 2 ? 4 : -4 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.5)', immediateRender: false }, at);
      drift($('img', el), at, E('variedade') - at + 0.8, 1.12, 1.0);
    });
    rise(l2, W('variedade', 'sempre') - 0.2, 0.8);
    tl.fromTo('.tile.more', { autoAlpha: 0, scale: 0.5, rotation: -6 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.6)', immediateRender: false }, W('variedade', 'variedade') - 0.35);
    tl.to('.tile.more b', { rotation: 90, duration: 0.9, ease: 'power2.inOut' }, W('variedade', 'variedade') - 0.2);
  }

  // ── site ─────────────────────────────────────────────────────────────────
  {
    const lines = $$('.h-site .l').map(split);
    gsap.set(['.k-site', '.pill-site', '.browser', '.ring-site'], { autoAlpha: 0 });
    fade('.k-site', S('site') + 0.1, { y: 20 }, { y: 0 });
    rise(lines[0], W('site', 'pedido') - 0.45, 0.8);
    rise(lines[1], W('site', 'qualquer') - 0.3, 0.8);
    rise(lines[2], W('site', 'brasil') - 0.3, 0.9);
    tl.fromTo('.browser', { autoAlpha: 0, y: -160, rotation: -2 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.0, ease: 'power3.out', immediateRender: false }, S('site') + 0.1);
    drift('.shot', S('site') + 0.1, E('site') - S('site') + 0.8, 1.0, 1.12);
    tl.fromTo('.ring-site', { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }, W('site', 'pedido') - 0.2);
    tl.to('.ring-site', { scale: 1.12, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, W('site', 'pedido') + 0.35);
    tl.fromTo('.pill-site', { autoAlpha: 0, y: 40, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)', immediateRender: false }, W('site', 'brasil') - 0.1);
  }

  // ── 7 · loja ─────────────────────────────────────────────────────────────
  {
    const lines = $$('.h7 .l').map(split);
    gsap.set(['.k7', '.pc', '.s7 .lst li', '.addr'], { autoAlpha: 0 });
    tl.fromTo('.pc-a', { autoAlpha: 0, y: 140, rotation: -2 }, { autoAlpha: 1, y: 0, rotation: -1, duration: 1.0, ease: 'power3.out', immediateRender: false }, S('loja') + 0.05);
    drift('.pc-a img', S('loja') + 0.05, E('loja') - S('loja') + 0.8, 1.15, 1.0);
    tl.fromTo('.pc-b', { autoAlpha: 0, y: 160, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: 3, duration: 0.9, ease: 'back.out(1.3)', immediateRender: false }, W('loja', 'campinas') - 0.2);
    fade('.k7', S('loja') + 0.1, { y: 20 }, { y: 0 });
    rise(lines[0], W('loja', 'loja') - 0.2);
    rise(lines[1], W('loja', 'campinas') - 0.1);
    const t = [W('loja', 'abre'), W('loja', 'sente'), W('loja', 'conversa')];
    $$('.s7 .lst li').forEach((el, i) => fade(el, t[i] - 0.25, { x: -30 }, { x: 0 }, 0.6));
    fade('.addr', W('loja', 'campinas') + 0.3, { y: 16 }, { y: 0 }, 0.6);
  }

  // ── 8 · chácara e visitas ────────────────────────────────────────────────
  {
    const w8 = split($('.h8 .l'));
    gsap.set(['.k8', '.s8 .lst li', '.s8 .frame'], { autoAlpha: 0 });
    gsap.set('.frame .ph', { autoAlpha: 0 });
    tl.fromTo('.frame', { autoAlpha: 0, y: -120 }, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out', immediateRender: false }, S('chacara') + 0.05);
    const E8 = E('chacara');
    const seq = [['portao', S('chacara') + 0.05], ['horta', W('chacara', 'plantamos') - 0.35], ['alambique', W('chacara', 'destilamos') - 0.35],
      ['explicacao', W('chacara', 'visita') - 0.35], ['cafe', W('chacara', 'guiada') + 0.35], ['destilador', W('chacara', 'destilacao') - 0.1], ['lago', W('chacara', 'manha', 1) - 0.35]];
    seq.forEach(([k, at], i) => {
      const img = $(`.frame .ph[data-p="${k}"]`);
      const end = i + 1 < seq.length ? seq[i + 1][1] : E8;
      if (i > 0) tl.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, at);
      else tl.set(img, { autoAlpha: 1 }, at);
      drift(img, at, end - at + 1.0, 1.16, 1.02);
    });
    fade('.k8', S('chacara') + 0.1, { y: 20 }, { y: 0 });
    rise(w8[0], W('chacara', 'visita') - 0.3, 0.85);
    rise(w8[1], W('chacara', 'guiada') - 0.2, 0.85);
    const t = [W('chacara', 'cafe'), W('chacara', 'destilacao'), W('chacara', 'manha', 1)];
    $$('.s8 .lst li').forEach((el, i) => fade(el, t[i] - 0.3, { x: -30 }, { x: 0 }, 0.6));
  }

  // ── 9 · renda ────────────────────────────────────────────────────────────
  {
    const a = split($('.h9 .a'));
    const b = split($('.h9 .b'));
    gsap.set(['.ln9', '.pill9', '.pc9'], { autoAlpha: 0 });
    drift('.bg9', S('renda'), E('renda') - S('renda') + 1.2, 1.0, 1.15);
    rise(a, W('renda', 'dono') - 0.3, 0.8);
    rise(b, W('renda', 'socios') - 0.3, 0.8);
    fade('.ln9', W('renda', 'renda') - 0.3, { y: 24 }, { y: 0 }, 0.7);
    tl.fromTo('.pill9', { autoAlpha: 0, y: 40, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)', immediateRender: false }, W('renda', 'morada') - 0.3);
    tl.fromTo('.pc9', { autoAlpha: 0, y: 200, rotation: -9 }, { autoAlpha: 1, y: 0, rotation: -3, duration: 1.0, ease: 'back.out(1.2)', immediateRender: false }, W('renda', 'assistenciais') - 0.2);
  }

  // ── 10 · logo ────────────────────────────────────────────────────────────
  {
    gsap.set(['.logo10', '.rg', '.glow', '.url10'], { autoAlpha: 0 });
    const g0 = W('logo', 'gota');
    tl.fromTo('.glow', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2.4, ease: 'power2.out', immediateRender: false }, S('logo') - 0.2);
    tl.fromTo('.logo10', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)', immediateRender: false }, g0 - 0.3);
    tl.fromTo('.rg1', { autoAlpha: 0.85, scale: 0.3 }, { autoAlpha: 0, scale: 3.4, duration: 2.0, ease: 'power2.out', immediateRender: false }, g0);
    tl.fromTo('.rg2', { autoAlpha: 0.6, scale: 0.3 }, { autoAlpha: 0, scale: 3.4, duration: 2.0, ease: 'power2.out', immediateRender: false }, g0 + 0.45);
    tl.fromTo('.rg3', { autoAlpha: 0.5, scale: 0.3 }, { autoAlpha: 0, scale: 3.4, duration: 2.0, ease: 'power2.out', immediateRender: false }, W('logo', 'cuidando') + 0.2);
    tl.fromTo('.url10', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, W('logo', 'amor') + 0.2);
    tl.fromTo('.logo10', { scale: 1 }, { scale: 1.03, duration: E('logo') + 3.4 - (g0 + 1.2), ease: 'sine.inOut', immediateRender: false }, g0 + 1.2);
  }

  c.finish();
});
