/* global gsap, Cena */
// Reel dos 9 anos com a voz gravada. Uma timeline GSAP pausada; cada movimento começa
// na palavra da transcrição que fala dele (TIMELINE, gerado por scripts/build.mjs).

Cena.start(() => {
  const c = Cena(window.TIMELINE);
  const { tl, $, $$ } = c;
  const T = window.TIMELINE;
  const words = T.scenes[0].words;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  /** início da primeira palavra `needle` que começa depois de `after` segundos */
  const W = (needle, after = 0) => {
    const n = norm(needle);
    const hit = words.find((w) => w.start >= after - 0.01 && (n.length <= 3 ? norm(w.w) === n : norm(w.w).startsWith(n)));
    if (!hit) throw new Error(`palavra "${needle}" não aparece depois de ${after}s`);
    return hit.start;
  };

  const rise = (els, at, dur = 0.75) =>
    tl.fromTo(els, { yPercent: 115 }, { yPercent: 0, duration: dur, ease: 'power3.out', immediateRender: false }, at);
  const split = (el) => {
    const ws = el.textContent.trim().split(/\s+/);
    el.innerHTML = ws.map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
    const wis = $$('.wi', el);
    gsap.set(wis, { yPercent: 115 });
    return wis;
  };

  // ── abertura: o cartão dos 9 anos ─────────────────────────────────────────
  const cardEnd = 11.9;
  tl.fromTo('.card', { autoAlpha: 0, y: 120, scale: 0.9, rotation: -3 }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 1.3, ease: 'power3.out', immediateRender: false }, 0.1);
  tl.fromTo('.card img', { scale: 1.0 }, { scale: 1.08, duration: cardEnd, ease: 'none', immediateRender: false }, 0.1);
  tl.fromTo('.card-bg', { scale: 1.2 }, { scale: 1.35, duration: cardEnd, ease: 'none', immediateRender: false }, 0);

  // ── as fotos ──────────────────────────────────────────────────────────────
  // at = palavra que chama a foto; lines = [texto do título, palavra que o acende]
  const slides = [
    { img: 'lavanda', at: 'encantamento', kicker: 'Tudo começou com', lines: [['um encantamento', 'encantamento'], ['pelas plantas', 'plantas']], from: 11.5 },
    { img: 'canteiros', at: 'raizes', kicker: 'Foi crescendo', lines: [['criando raízes', 'raizes'], ['ganhando forma', 'forma']], from: 17 },
    { img: 'planta21', at: 'tantas', kicker: 'Chegando à vida de', lines: [['tantas pessoas', 'pessoas']], from: 21 },
    { img: 'destila21', at: 'preparacao', kicker: 'Em cada', lines: [['preparação', 'preparacao']], from: 24 },
    { img: 'gotas', at: 'gota', kicker: 'Em cada', lines: [['gota', 'gota'], ['colocamos…', 'colocamos']], from: 27, sm: true },
    { img: 'panela', at: 'confianca', kicker: 'O mais precioso', lines: [['a confiança', 'confianca'], ['de vocês', 'voces']], from: 38 },
    { img: 'nevoa2', at: 'floresce', kicker: 'Também floresce na', lines: [['solidariedade', 'solidariedade']], from: 41.3 },
    { img: 'maos2', at: 'transformando', kicker: 'O cuidado vira', lines: [['oportunidade', 'oportunidade']], from: 45 },
    { help: ['caridade2', 'caridade1', 'caridade3', 'caridade4'], at: 'ajudar', kicker: 'A oportunidade de', lines: [['ajudar', 'ajudar'], ['outras pessoas', 'outras']], from: 46, sm: true },
    { img: 'visita22', at: 'comemoracao', kicker: 'Essa comemoração é', lines: [['de todos', 'todos']], from: 51 },
    { img: 'maos3', at: 'prepara', kicker: '', lines: [], from: 55 },
    { img: 'cartoes', at: 'compartilha', kicker: '', lines: [], from: 61.5 },
    { img: 'portao', at: 'venham', kicker: 'Que venham outros tantos anos de', lines: [['encontros', 'encontros'], ['aprendizados', 'aprendizados']], from: 65.5, sm: true },
    { img: 'lagoa21', at: 'conexao', kicker: 'E de', lines: [['conexão com', 'conexao'], ['a natureza', 'natureza']], from: 69 },
    { img: 'nevoa1', at: 'obrigado', kicker: 'O nosso', lines: [['muito obrigado', 'obrigado']], from: 73 },
  ];
  const host = $('.s-slides');
  gsap.set('.s-card, .s-slides', { autoAlpha: 1 });
  const times = slides.map((s) => W(s.at, s.from));
  const LOGO = W('gota', 77.5);
  slides.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'slide' + (s.sm ? ' sm' : '') + (s.help ? ' help' : '');
    el.innerHTML = (s.help ? s.help.map((h, k) => `<div class="hc hc${[2, 1, 3, 4][k]}"><img src="build/fotos/${h}.jpg" alt="" /></div>`).join('')
      : `<img src="build/fotos/${s.img}.jpg" alt="" /><div class="scrim"></div>`) +
      `<div class="head">${s.kicker ? `<span class="kicker">${s.kicker}</span>` : ''}` +
      s.lines.map(([t], k) => `<span class="ttl${k ? ' acc' : ''}">${t}</span>`).join('') + '</div>';
    host.appendChild(el);
    const start = times[i] - 0.35;
    const end = (times[i + 1] ?? LOGO) - 0.35;
    gsap.set(el, { autoAlpha: 0 });
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, start);
    tl.to(el, { autoAlpha: 0, duration: 0.01, immediateRender: false }, end + 0.75);
    if (s.help) {
      // as fotos caem uma a uma, em ângulos diferentes, no ritmo da fala
      const at = [W('ajudar', s.from), W('outras', s.from), W('pessoas', s.from), W('pessoas', s.from) + 0.7];
      const rot = [-3, 2.5, -2, 3];
      $$('.hc', el).forEach((h, k) => {
        gsap.set(h, { autoAlpha: 0 });
        tl.fromTo(h, { autoAlpha: 0, y: 260, rotation: rot[k] * 3.5, scale: 0.8 }, { autoAlpha: 1, y: 0, rotation: rot[k], scale: 1, duration: 0.9, ease: 'back.out(1.4)', immediateRender: false }, at[k] - 0.2);
        tl.fromTo($('img', h), { scale: 1.18 }, { scale: 1.02, duration: end - at[k] + 1.2, ease: 'none', immediateRender: false }, at[k] - 0.2);
      });
    } else
    // Ken Burns, alternando o lado
    tl.fromTo($('img', el), { scale: 1.16, xPercent: i % 2 ? 2.5 : -2.5 }, { scale: 1.02, xPercent: 0, duration: end - start + 1.2, ease: 'none', immediateRender: false }, start);
    const kick = $('.kicker', el);
    if (kick) tl.fromTo(kick, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false }, start + 0.2);
    gsap.set(kick || [], { autoAlpha: 0 });
    $$('.ttl', el).forEach((t, k) => rise(split(t), W(s.lines[k][1], s.from) - 0.2, 0.75));
  });

  // ── chips: valores e quem faz parte ───────────────────────────────────────
  const chips = (host, list, cls, until) => {
    list.forEach(([text, needle, after, kind]) => {
      const p = document.createElement('span');
      p.className = `pill ${kind || ''}`;
      p.textContent = text;
      $(host).appendChild(p);
      gsap.set(p, { autoAlpha: 0 });
      tl.fromTo(p, { autoAlpha: 0, x: -70, scale: 0.9 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', immediateRender: false }, W(needle, after) - 0.2);
    });
    tl.to(`${host} .pill`, { autoAlpha: 0, y: -20, duration: 0.5, stagger: 0.05 }, until);
  };
  chips('.p-valores', [['estudo', 'estudo', 28, ''], ['dedicação', 'dedicacao', 28, 't'], ['carinho', 'carinho', 31, 'l']], '', W('que', 36) - 1.0);
  chips('.p-todos', [['quem prepara', 'prepara', 55, ''], ['quem apoia', 'apoia', 55, 't'], ['quem escolhe', 'escolhe', 55, 'l'], ['quem compartilha', 'compartilha', 61, '']], '', W('venham', 65) - 0.5);

  // ── o fecho: a marca ──────────────────────────────────────────────────────
  {
    gsap.set(['.s-logo', '.lp', '.rg', '.glow', '.nove', '.url'], { autoAlpha: 0 });
    const g0 = LOGO, gDe = W('de', LOGO), gCura = W('cura', LOGO), gAnos = W('nove', LOGO), gAmor = W('amor', LOGO);
    tl.fromTo('.s-logo', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, LOGO - 0.7);
    tl.fromTo('.glow', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2.4, ease: 'power2.out', immediateRender: false }, LOGO - 0.7);
    tl.fromTo('.lp-drop', { autoAlpha: 0, scale: 0, y: 50 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(2.2)', immediateRender: false }, LOGO - 0.55);
    tl.fromTo('.rg1', { autoAlpha: 0.85, scale: 0.3 }, { autoAlpha: 0, scale: 3.6, duration: 2.0, ease: 'power2.out', immediateRender: false }, LOGO - 0.05);
    [['.lp-w1', g0], ['.lp-w2', gDe], ['.lp-w3', gCura]].forEach(([sel, at]) => {
      tl.fromTo(sel, { autoAlpha: 0, y: 46, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', immediateRender: false }, at - 0.1);
    });
    tl.fromTo('.nove', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: false }, gAnos - 0.2);
    // a frase só existe a partir do início da escrita (largura zero ainda deixava um pingo visível)
    gsap.set('.lp-tag', { clipPath: 'inset(69% 66.6% 0% 33.4%)' });
    tl.fromTo('.lp-tag', { autoAlpha: 0, clipPath: 'inset(69% 66.6% 0% 33.4%)' }, { autoAlpha: 1, clipPath: 'inset(69% 0% 0% 33.4%)', duration: 1.5, ease: 'power1.inOut', immediateRender: false }, W('cuidando', LOGO) - 0.05);
    tl.fromTo('.rg2', { autoAlpha: 0.6, scale: 0.3 }, { autoAlpha: 0, scale: 3.6, duration: 2.0, ease: 'power2.out', immediateRender: false }, W('cuidando', LOGO) + 1.2);
    tl.fromTo('.url', { autoAlpha: 0, y: 50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)', immediateRender: false }, gAmor + 0.5);
    tl.fromTo('.lockup', { scale: 1 }, { scale: 1.035, duration: T.total - (gAmor + 1.5), ease: 'sine.inOut', immediateRender: false }, gAmor + 1.5);
  }
  // ── assinatura: Marcelo Mattar ────────────────────────────────────────────
  {
    const a = W('amor', LOGO) + 1.7;
    gsap.set(['.s-autor', '.foto', '.nome', '.papel'], { autoAlpha: 0 });
    tl.fromTo('.s-autor', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, a);
    tl.fromTo('.foto', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.0, ease: 'back.out(1.5)', immediateRender: false }, a + 0.3);
    tl.fromTo('.nome', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, a + 0.8);
    tl.fromTo('.papel', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, a + 1.2);
    tl.fromTo('.foto', { y: 0 }, { y: -12, duration: T.total - (a + 2.2), ease: 'sine.inOut', immediateRender: false }, a + 2.2);
  }
  // o cartão sai de cena quando as fotos entram por cima (z-order já cuida; só poupa o render)
  tl.to('.s-card', { autoAlpha: 0, duration: 0.01, immediateRender: false }, times[0] + 0.8);

  c.finish();
});
