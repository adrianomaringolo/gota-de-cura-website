import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatCurrency, toAmount } from '@/lib/format'
import { isNewProduct } from '@/lib/products'
import { productTypes } from '@/lib/product-types'
import type { ProductItem, ProductType } from '@/lib/types'

/**
 * Vitrine for old tablets (iPad mini 3 and the like, stuck on iOS 12).
 *
 * `/vitrine` is a React 19 / Tailwind 4 page: its CSS needs `@layer`,
 * `color-mix()` and `@property`, and its JS bundle targets Safari 16.4+. None
 * of that runs on iOS 12. This route answers with one self-contained HTML
 * document instead — the catalogue is read here, on the server, and inlined as
 * JSON, and the page is plain ES5 + prefixed CSS with no framework and no
 * request of its own besides fonts and photos.
 *
 * Same views as the kiosk (linhas → prateleira → planta, plus the price list
 * with search) and the same 60s idle reset. Keep the two in step by hand when
 * the kiosk changes: there is no shared code on purpose, since sharing it
 * would pull the modern toolchain back in.
 *
 * After 5 minutes with no touch the page goes back to the start and plays the
 * institutional video (16:9, public/videos) full screen, muted and looping,
 * until the next touch. It is muted because iOS 12 only autoplays muted video;
 * the captions are burned into the picture for that reason. H.264 8-bit
 * yuv420p/tv range and a JPEG poster, since old Safari reads neither WebP nor
 * full-range yuvj420p reliably.
 */

export const dynamic = 'force-dynamic'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gotadecura.com.br'
).replace(/\/$/, '')

const plainText = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()

/**
 * Resized through wsrv.nl like the rest of the site (see image-loader.ts), but
 * as JPEG: iOS 12 Safari cannot decode WebP.
 */
const photo = (src: string, width: number) => {
  const absolute = /^https?:\/\//.test(src) ? src : `${SITE_URL}${src}`
  const params = new URLSearchParams({
    url: absolute,
    w: String(width),
    q: '75',
    output: 'jpg',
    we: '1',
    maxage: '1y',
  })
  return `https://wsrv.nl/?${params.toString()}`
}

const belongs = (item: ProductItem, type: ProductType) =>
  type.mode === 'category'
    ? item.type === type.type || Boolean(item.categories?.includes(type.type))
    : item.type === type.type

const readValues = (values: string[] | string) =>
  (typeof values === 'string' ? values.split(',') : values)
    .map((value) => value.trim())
    .filter(Boolean)

const toProduct = (item: ProductItem) => ({
  id: item.id,
  name: item.name,
  description: item.description || '',
  detailed: item.detailedDescription || '',
  thumb: item.image ? photo(item.image, 480) : '',
  large: item.image ? photo(item.image, 900) : '',
  available: Boolean(item.available),
  isNew: isNewProduct(item),
  price: formatCurrency(toAmount(item.price)),
  oldPrice: item.oldPrice ? formatCurrency(toAmount(item.oldPrice)) : '',
  options: (item.optionsSet ?? []).map((option) => ({
    name: option.name,
    values: readValues(option.values),
  })),
})

const buildShelves = (all: ProductItem[]) => {
  const visible = all.filter((item) => !item.hidden)

  return productTypes
    .map((type) => {
      const items = visible
        .filter((item) => belongs(item, type))
        .sort((a, b) => Number(Boolean(b.available)) - Number(Boolean(a.available)))
      return { type, items }
    })
    .filter((shelf) => shelf.items.length > 0)
    .map(({ type, items }) => ({
      id: type.id,
      label: plainText(type.typeLabel ?? type.type),
      description: plainText(type.description),
      image: photo(`/images/categories/${type.image}`, 480),
      featured: Boolean(type.featured),
      items: items.map(toProduct),
    }))
}

/** JSON that is safe inside a <script> element. */
const inlineJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

const STYLES = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%;margin:0}
body{font-family:Archivo,-apple-system,Helvetica,Arial,sans-serif;font-size:17px;line-height:1.55;color:#211c2b;background:#faf8fc;-webkit-text-size-adjust:100%;-webkit-user-select:none;user-select:none;overflow:hidden}
h1,h2,h3,p{margin:0}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;text-align:left;cursor:pointer;-webkit-appearance:none;appearance:none}
input{font:inherit;-webkit-appearance:none;appearance:none}
.display{font-family:Petrona,Georgia,'Times New Roman',serif}
#app{display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;height:100%}
#bar{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;background:#503484;color:#fff;padding:12px 20px 12px;padding-top:calc(12px + env(safe-area-inset-top));box-shadow:0 2px 4px rgba(41,25,69,.08),0 14px 40px rgba(41,25,69,.15);position:relative;z-index:10}
#bar img{height:42px;width:auto;margin-right:14px;-webkit-filter:brightness(0) invert(1);filter:brightness(0) invert(1)}
.pill{display:-webkit-inline-flex;display:inline-flex;-webkit-align-items:center;align-items:center;height:52px;border-radius:26px;padding:0 20px 0 16px;font-weight:500;margin-right:12px;-webkit-flex-shrink:0;flex-shrink:0}
.pill svg{width:20px;height:20px;margin-right:8px}
.pill.back{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1)}
.pill.home{background:#fff;color:#503484;font-weight:600;margin:0 0 0 12px}
.pill:active{-webkit-transform:scale(.97);transform:scale(.97)}
#crumbs{-webkit-flex:1;flex:1;min-width:0;color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:16px}
#crumbs b{color:#fff;font-weight:500}
#crumbs .sep{color:rgba(255,255,255,.35);margin:0 8px}
#crumbs button{color:inherit}
#scroll{-webkit-flex:1;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;-webkit-user-select:none}
.wrap{max-width:1472px;margin:0 auto;padding:28px 24px 32px}
.wrap.narrow{max-width:1280px}
h1.title{font-size:36px;line-height:1.12;font-weight:600}
.lead{margin-top:12px;max-width:44ch;font-size:18px;line-height:1.6;color:#54505f}
.muted{color:#5f5b68}
.seg{display:-webkit-inline-flex;display:inline-flex;border:1px solid #dfdce6;background:#fff;border-radius:30px;padding:4px;box-shadow:0 1px 2px rgba(41,25,69,.07),0 6px 20px rgba(41,25,69,.1)}
.seg button{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;height:48px;padding:0 20px;border-radius:24px;font-weight:500;color:#54505f}
.seg button svg{width:20px;height:20px;margin-right:8px}
.seg button.on{background:#5d3b97;color:#fff}
.grid{display:grid;grid-gap:14px;gap:14px;grid-template-columns:repeat(auto-fill,minmax(224px,1fr));margin-top:32px}
.tile{position:relative;overflow:hidden;border-radius:16px;background:#291945;display:block;width:100%;padding-top:100%;-webkit-transform:translateZ(0)}
.tile.featured{grid-column:span 2;padding-top:0;min-height:224px}
.tile img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
.tile .shade{position:absolute;top:0;left:0;right:0;bottom:0;background:-webkit-linear-gradient(bottom,rgba(41,25,69,.92),rgba(41,25,69,.35) 55%,rgba(41,25,69,0))}
.tile .cap{position:absolute;left:0;right:0;bottom:0;padding:18px 20px;display:-webkit-flex;display:flex;-webkit-align-items:flex-end;align-items:flex-end;-webkit-justify-content:space-between;justify-content:space-between;color:#fff}
.tile h3{font-size:22px;line-height:1.15;font-weight:600;text-shadow:0 1px 8px rgba(0,0,0,.45)}
.tile.featured h3{font-size:28px}
.tile .count{margin-top:4px;font-size:15px;color:rgba(255,255,255,.78)}
.tile .go{width:44px;height:44px;border:1px solid rgba(255,255,255,.4);border-radius:22px;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;-webkit-flex-shrink:0;flex-shrink:0;margin-left:12px}
.tile .go svg{width:20px;height:20px}
.tile:active{-webkit-transform:scale(.98);transform:scale(.98)}
.card{display:block;width:100%;overflow:hidden;border-radius:16px;border:1px solid #dfdce6;background:#fff}
.card:active{-webkit-transform:scale(.98);transform:scale(.98);border-color:rgba(93,59,151,.4)}
.ph{position:relative;width:100%;padding-top:100%;background:#f1eef6;overflow:hidden}
.ph img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
.ph .none{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;font-size:15px;color:#5f5b68}
.flag{position:absolute;top:12px;left:12px;background:#5d3b97;color:#fff;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.sold{position:absolute;left:0;right:0;bottom:0;background:rgba(33,28,43,.85);color:#fff;text-align:center;padding:8px 0;font-size:15px;font-weight:500}
.card .body{padding:16px}
.card h3{font-size:19px;line-height:1.3;font-weight:600}
.card .desc{margin-top:6px;font-size:15px;line-height:1.55;color:#54505f;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.price{margin-top:12px;font-size:21px;font-weight:600;font-variant-numeric:tabular-nums}
.price s{font-family:Archivo,-apple-system,Helvetica,Arial,sans-serif;font-size:15px;font-weight:400;color:#5f5b68;margin-right:8px}
.price.sale{color:#a24112}
.badge{display:inline-block;margin-top:12px;border-radius:20px;background:#f1eef6;color:#54505f;padding:3px 12px;font-size:14px;font-weight:500}
.search{position:-webkit-sticky;position:sticky;top:0;z-index:20;background:#faf8fc;padding:20px 0 12px}
.search input{display:block;width:100%;height:56px;border:1px solid #dfdce6;border-radius:28px;background:#fff;padding:0 56px 0 48px;font-size:17px;color:#211c2b;outline:0;box-shadow:0 1px 2px rgba(41,25,69,.07),0 6px 20px rgba(41,25,69,.1);-webkit-user-select:text;user-select:text}
.search input:focus{border-color:rgba(93,59,151,.5)}
.search .ico{position:absolute;left:16px;top:50%;margin-top:-4px;width:20px;height:20px;color:#5f5b68;pointer-events:none}
.search .clear{position:absolute;right:10px;top:50%;margin-top:-4px;width:40px;height:40px;border-radius:20px;color:#5f5b68;display:none;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}
.search .clear.show{display:-webkit-flex;display:flex}
.search .clear svg{width:20px;height:20px}
.search .field{position:relative}
.group h2{position:-webkit-sticky;position:sticky;top:88px;z-index:10;background:#faf8fc;border-bottom:2px solid rgba(93,59,151,.25);padding:8px 0;font-size:25px;font-weight:600;color:#5d3b97}
.group h2 small{font-family:Archivo,-apple-system,Helvetica,Arial,sans-serif;font-size:15px;font-weight:400;color:#5f5b68;margin-left:12px}
.group{margin-top:36px}
.row{display:-webkit-flex;display:flex;-webkit-align-items:flex-end;align-items:flex-end;width:100%;padding:14px 0;border-bottom:1px solid #dfdce6}
.row:active{background:#f3ecff}
.row .n{font-size:19px;line-height:1.3;font-weight:500}
.row .dots{-webkit-flex:1;flex:1;border-bottom:1px dotted #bfbbc9;margin:0 8px 7px}
.row .v{font-size:19px;line-height:1.3;font-weight:600;white-space:nowrap;-webkit-flex-shrink:0;flex-shrink:0;font-variant-numeric:tabular-nums}
.row.off .n,.row.off .v{color:#5f5b68}
.empty{margin-top:48px;border:1px dashed #bfbbc9;border-radius:16px;background:#fff;padding:48px 24px;text-align:center}
.empty p:first-child{font-size:19px;font-weight:600}
.empty p+p{margin-top:8px;color:#54505f;font-size:15px}
.planta{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}
.planta .pic{width:416px;max-width:100%;margin-right:48px;margin-bottom:28px;-webkit-flex-shrink:0;flex-shrink:0}
.planta .pic .ph{border-radius:16px}
.planta .info{-webkit-flex:1;flex:1;min-width:300px}
.planta h1{display:inline;font-size:36px;line-height:1.12;font-weight:600}
.planta .flag{position:static;display:inline-block;margin-left:12px;vertical-align:middle}
.planta .short{margin-top:16px;max-width:62ch;font-size:19px;line-height:1.6;color:#54505f}
.planta .cost{margin-top:28px;border-top:1px solid #dfdce6;border-bottom:1px solid #dfdce6;padding:20px 0}
.planta .cost .price{margin:0;font-size:38px}
.planta .cost .price s{font-size:19px}
.planta .cost p.off{font-size:19px;font-weight:500;color:#54505f}
.opt{margin-top:20px}
.opt b{font-size:15px;font-weight:600;display:block}
.opt span{display:inline-block;margin:8px 8px 0 0;border-radius:20px;background:#f3ecff;color:#5d3b97;padding:6px 14px;font-size:15px;font-weight:500}
.rich{margin-top:28px;font-size:17px;line-height:1.65;color:#54505f}
.rich p{margin:0 0 1em}
.rich ul,.rich ol{margin:0 0 1em;padding-left:1.4em}
.rich h2,.rich h3,.rich h4{font-family:Petrona,Georgia,serif;color:#211c2b;margin:1.2em 0 .5em}
.rich img{max-width:100%;height:auto}
.rich a{color:#5d3b97}
.fade{-webkit-animation:rise .4s cubic-bezier(.25,1,.5,1) both;animation:rise .4s cubic-bezier(.25,1,.5,1) both}
@-webkit-keyframes rise{from{opacity:0;-webkit-transform:translateY(20px)}to{opacity:1;-webkit-transform:none}}
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.state{max-width:640px;margin:0 auto;padding:96px 24px;text-align:center}
.state p:first-child{font-size:26px;font-weight:600}
.state p+p{margin-top:12px;color:#54505f}
.state button{margin-top:28px;display:inline-block;background:#5d3b97;color:#fff;border-radius:28px;padding:16px 32px;font-weight:600}
@media (max-width:640px){.wrap{padding:24px 20px 28px}.grid{grid-template-columns:repeat(2,1fr)}.tile.featured{grid-column:span 2}h1.title,.planta h1{font-size:30px}}
#attract{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;background:#000;-webkit-user-select:none;user-select:none}
#attract.on{display:block;opacity:1}
#attract.off{display:block;opacity:0;-webkit-transition:opacity .3s;transition:opacity .3s}
#attract video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000}
#attractHint{position:absolute;left:0;right:0;bottom:28px;text-align:center;pointer-events:none}
#attractHint span{display:inline-block;background:rgba(255,255,255,.92);color:#503484;font-weight:600;font-size:20px;line-height:1;padding:16px 30px;border-radius:32px;box-shadow:0 8px 30px rgba(0,0,0,.35);-webkit-animation:breathe 2.4s ease-in-out infinite;animation:breathe 2.4s ease-in-out infinite}
@-webkit-keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
`

const SCRIPT = `
(function () {
  var DATA = window.__VITRINE__;
  var IDLE_MS = 60000;
  var ATTRACT_MS = 300000;
  var ATTRACT_PRELOAD_MS = 240000;
  var view = { name: 'home' };
  var query = '';
  var app = document.getElementById('app');
  var crumbsEl = document.getElementById('crumbs');
  var backEl = document.getElementById('back');
  var homeEl = document.getElementById('home');
  var scrollEl = document.getElementById('scroll');
  var content = document.getElementById('content');
  var idleTimer = null;
  var attractEl = document.getElementById('attract');
  var attractVideo = document.getElementById('attractVideo');
  var attractOn = false;
  var attractTimer = null;
  var attractPreloadTimer = null;

  var ICONS = {
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fold(s) {
    return String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/^\\s+|\\s+$/g, '');
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function shelfById(id) {
    for (var i = 0; i < DATA.shelves.length; i++) if (DATA.shelves[i].id === id) return DATA.shelves[i];
  }
  function itemOf(shelf, id) {
    for (var i = 0; i < shelf.items.length; i++) if (shelf.items[i].id === id) return shelf.items[i];
  }

  function toggle(active) {
    return '<div class="seg">' +
      '<button type="button" data-act="home" class="' + (active === 'grid' ? 'on' : '') + '">' + ICONS.grid + 'Linhas</button>' +
      '<button type="button" data-act="list" class="' + (active === 'list' ? 'on' : '') + '">' + ICONS.list + 'Lista de preços</button>' +
      '</div>';
  }

  function priceHtml(item, big) {
    if (!item.available) return big ? '<p class="off">Esgotado no momento — volte em breve.</p>' : '<span class="badge">Indisponível</span>';
    var sale = !!item.oldPrice;
    return '<p class="price display' + (sale ? ' sale' : '') + '">' + (sale ? '<s>' + esc(item.oldPrice) + '</s>' : '') + esc(item.price) + '</p>';
  }

  function renderHome() {
    var tiles = '';
    for (var i = 0; i < DATA.shelves.length; i++) {
      var s = DATA.shelves[i];
      tiles += '<button type="button" class="tile' + (s.featured ? ' featured' : '') + '" data-act="shelf" data-id="' + esc(s.id) + '">' +
        '<img src="' + esc(s.image) + '" alt="">' +
        '<div class="shade"></div>' +
        '<div class="cap"><div><h3 class="display">' + esc(s.label) + '</h3><p class="count">' + plural(s.items.length, 'produto', 'produtos') + '</p></div>' +
        '<span class="go">' + ICONS.right + '</span></div></button>';
    }
    return '<div class="wrap">' + toggle('grid') +
      '<h1 class="title display" style="margin-top:24px">Nossas linhas</h1>' +
      '<p class="lead">Toque para conhecer cada planta, ver os preços e o que temos disponível hoje.</p>' +
      '<div class="grid">' + tiles + '</div></div>';
  }

  function renderShelf(shelf) {
    var soldOut = 0, cards = '';
    for (var i = 0; i < shelf.items.length; i++) {
      var it = shelf.items[i];
      if (!it.available) soldOut++;
      cards += '<button type="button" class="card" data-act="item" data-shelf="' + esc(shelf.id) + '" data-id="' + esc(it.id) + '" data-from="shelf">' +
        '<div class="ph">' + (it.thumb ? '<img src="' + esc(it.thumb) + '" alt="' + esc(it.name) + '">' : '<div class="none">sem foto</div>') +
        (it.isNew ? '<span class="flag">Novo</span>' : '') +
        (!it.available ? '<span class="sold">Esgotado hoje</span>' : '') + '</div>' +
        '<div class="body"><h3 class="display">' + esc(it.name) + '</h3>' +
        (it.description ? '<p class="desc">' + esc(stripTags(it.description)) + '</p>' : '') +
        priceHtml(it, false) + '</div></button>';
    }
    return '<div class="wrap">' +
      '<h1 class="title display">' + esc(shelf.label) + '</h1>' +
      (shelf.description ? '<p class="lead" style="max-width:68ch">' + esc(shelf.description) + '</p>' : '') +
      '<p class="muted" style="margin-top:12px;font-size:15px">' + plural(shelf.items.length, 'produto', 'produtos') + (soldOut ? ' · ' + soldOut + ' esgotado(s) hoje' : '') + '</p>' +
      '<div class="grid" style="margin-top:28px">' + cards + '</div></div>';
  }

  function stripTags(s) { return String(s).replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').replace(/^\\s+|\\s+$/g, ''); }

  function renderPlanta(item) {
    var opts = '';
    for (var i = 0; i < item.options.length; i++) {
      var o = item.options[i], vals = '';
      for (var j = 0; j < o.values.length; j++) vals += '<span>' + esc(o.values[j]) + '</span>';
      opts += '<div class="opt"><b>' + esc(o.name) + '</b>' + vals + '</div>';
    }
    return '<div class="wrap narrow"><div class="planta">' +
      '<div class="pic"><div class="ph">' + (item.large ? '<img src="' + esc(item.large) + '" alt="' + esc(item.name) + '">' : '<div class="none">sem foto</div>') +
      (!item.available ? '<span class="sold">Esgotado no momento</span>' : '') + '</div></div>' +
      '<div class="info"><div><h1 class="display">' + esc(item.name) + '</h1>' + (item.isNew ? '<span class="flag">Novo</span>' : '') + '</div>' +
      (item.description ? '<div class="short">' + item.description + '</div>' : '') +
      '<div class="cost">' + priceHtml(item, true) + '</div>' + opts +
      (item.detailed ? '<div class="rich">' + item.detailed + '</div>' : '') +
      '</div></div></div>';
  }

  function listResults() {
    var q = fold(query), out = [];
    for (var i = 0; i < DATA.shelves.length; i++) {
      var s = DATA.shelves[i], items = s.items;
      if (q && fold(s.label).indexOf(q) === -1) {
        items = [];
        for (var j = 0; j < s.items.length; j++) if (fold(s.items[j].name).indexOf(q) !== -1) items.push(s.items[j]);
      }
      if (items.length) {
        items = items.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'pt'); });
        out.push({ shelf: s, items: items });
      }
    }
    return out;
  }

  function listBody() {
    var res = listResults(), total = 0, html = '';
    for (var i = 0; i < res.length; i++) {
      total += res[i].items.length;
      html += '<section class="group"><h2 class="display">' + esc(res[i].shelf.label) + '<small>' + res[i].items.length + '</small></h2>';
      for (var j = 0; j < res[i].items.length; j++) {
        var it = res[i].items[j];
        html += '<button type="button" class="row' + (it.available ? '' : ' off') + '" data-act="item" data-shelf="' + esc(res[i].shelf.id) + '" data-id="' + esc(it.id) + '" data-from="list">' +
          '<span class="n display">' + esc(it.name) + '</span><span class="dots"></span>' +
          '<span class="v display">' + (it.available ? esc(it.price) : 'Indisponível') + '</span></button>';
      }
      html += '</section>';
    }
    var info = query ? (total === 1 ? '1 item encontrado' : total + ' itens encontrados') : 'Todo o catálogo por categoria. Toque em um item para ver a descrição e a foto.';
    if (!res.length) {
      html = '<div class="empty"><p class="display">Nada encontrado para “' + esc(query.replace(/^\\s+|\\s+$/g, '')) + '”</p><p>Tente outro termo, ou toque no X para ver a lista completa.</p></div>';
    }
    return { info: info, html: html };
  }

  function renderList() {
    var body = listBody();
    return '<div class="wrap narrow">' + toggle('list') +
      '<h1 class="title display" style="margin-top:24px">Lista de preços</h1>' +
      '<div class="search"><div class="field">' + ICONS.search +
      '<input id="q" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Buscar por nome ou categoria…" aria-label="Buscar na lista de preços" value="' + esc(query) + '">' +
      '<button type="button" id="clear" class="clear' + (query ? ' show' : '') + '" data-act="clear" aria-label="Limpar busca">' + ICONS.x + '</button></div></div>' +
      '<p class="muted" id="info" style="font-size:15px;padding:0 4px">' + esc(body.info) + '</p>' +
      '<div id="results" style="margin-top:8px">' + body.html + '</div></div>';
  }

  function crumbs() {
    if (view.name === 'home') return '<span>Toque em uma linha para começar</span>';
    if (view.name === 'list') return '<b>Lista de preços</b>';
    var shelf = shelfById(view.shelf);
    if (view.name === 'category') return '<b>' + esc(shelf.label) + '</b>';
    var item = itemOf(shelf, view.id);
    var first = view.from === 'list'
      ? '<button type="button" data-act="list">Lista de preços</button>'
      : '<button type="button" data-act="shelf" data-id="' + esc(shelf.id) + '">' + esc(shelf.label) + '</button>';
    return first + '<span class="sep">/</span><b>' + esc(item.name) + '</b>';
  }

  function render() {
    var html;
    if (view.name === 'home') html = renderHome();
    else if (view.name === 'list') html = renderList();
    else if (view.name === 'category') html = renderShelf(shelfById(view.shelf));
    else html = renderPlanta(itemOf(shelfById(view.shelf), view.id));
    content.innerHTML = '<div class="fade">' + html + '</div>';
    crumbsEl.innerHTML = crumbs();
    var atHome = view.name === 'home';
    backEl.style.display = atHome ? 'none' : '';
    homeEl.style.display = atHome ? 'none' : '';
    scrollEl.scrollTop = 0;
    armIdle();
  }

  function go(next) { view = next; render(); }
  function goHome() { query = ''; go({ name: 'home' }); }
  function goBack() {
    if (view.name === 'product') go(view.from === 'list' ? { name: 'list' } : { name: 'category', shelf: view.shelf });
    else goHome();
  }

  function armIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = view.name === 'home' ? null : setTimeout(goHome, IDLE_MS);
  }

  // Attract loop: only a real touch, click or key (see onActivity) pushes the
  // video back by another ATTRACT_MS. The 60s reset above must not count, or
  // render() would restart this clock and the video would show up a minute
  // late. The file is only fetched one minute before it is needed, so a tablet
  // that is being used never downloads it.
  function armAttract() {
    if (attractTimer) clearTimeout(attractTimer);
    if (attractPreloadTimer) clearTimeout(attractPreloadTimer);
    attractTimer = attractPreloadTimer = null;
    if (!attractVideo || attractOn) return;
    attractPreloadTimer = setTimeout(preloadAttract, ATTRACT_PRELOAD_MS);
    attractTimer = setTimeout(showAttract, ATTRACT_MS);
  }

  function preloadAttract() {
    attractVideo.preload = 'auto';
    try { attractVideo.load(); } catch (err) {}
  }

  function showAttract() {
    if (attractOn) return;
    goHome();
    if (attractTimer) clearTimeout(attractTimer);
    if (attractPreloadTimer) clearTimeout(attractPreloadTimer);
    attractTimer = attractPreloadTimer = null;
    attractOn = true;
    attractEl.className = 'on';
    attractVideo.muted = true;
    try { attractVideo.currentTime = 0; } catch (err) {}
    var started = attractVideo.play();
    // Autoplay refused or the file is missing: drop the black screen and try
    // again in another ATTRACT_MS instead of leaving the kiosk blank.
    if (started && started.then) started.then(null, function () { hideAttract(false); });
  }

  function hideAttract(reset) {
    if (!attractOn) return;
    attractOn = false;
    try { attractVideo.pause(); } catch (err) {}
    // Stays in the DOM for a moment, transparent: it swallows the click that
    // iOS fires after the touch, so waking the kiosk never opens a product.
    attractEl.className = 'off';
    setTimeout(function () { if (!attractOn) attractEl.className = ''; }, 450);
    if (reset) goHome();
    armAttract();
  }

  function wakeFromAttract(e) {
    e.preventDefault();
    e.stopPropagation();
    if (attractOn) hideAttract(true);
  }

  function refreshList() {
    var body = listBody();
    document.getElementById('info').textContent = body.info;
    document.getElementById('results').innerHTML = body.html;
    document.getElementById('clear').className = 'clear' + (query ? ' show' : '');
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document && !(el.getAttribute && el.getAttribute('data-act'))) el = el.parentNode;
    if (!el || el === document) return;
    var act = el.getAttribute('data-act');
    if (act === 'home') goHome();
    else if (act === 'back') goBack();
    else if (act === 'list') go({ name: 'list' });
    else if (act === 'shelf') go({ name: 'category', shelf: el.getAttribute('data-id') });
    else if (act === 'item') go({ name: 'product', shelf: el.getAttribute('data-shelf'), id: el.getAttribute('data-id'), from: el.getAttribute('data-from') === 'list' ? 'list' : 'category' });
    else if (act === 'clear') { query = ''; var input = document.getElementById('q'); input.value = ''; refreshList(); input.focus(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'q') { query = e.target.value; refreshList(); }
  });
  function onActivity() { armIdle(); armAttract(); }
  ['touchstart', 'click', 'keydown'].forEach(function (name) { document.addEventListener(name, onActivity, true); });
  scrollEl.addEventListener('scroll', armIdle);
  if (attractEl && attractVideo) {
    attractEl.addEventListener('touchstart', wakeFromAttract, false);
    attractEl.addEventListener('mousedown', wakeFromAttract, false);
    attractEl.addEventListener('click', wakeFromAttract, false);
    document.addEventListener('keydown', function () { if (attractOn) hideAttract(true); }, true);
    attractVideo.addEventListener('error', function () { if (attractOn) hideAttract(false); }, false);
    attractVideo.addEventListener('ended', function () {
      if (!attractOn) return;
      try { attractVideo.currentTime = 0; attractVideo.play(); } catch (err) {}
    }, false);
  }

  if (!DATA.shelves.length) {
    content.innerHTML = '<div class="state"><p class="display">Catálogo vazio no momento</p><p>Chame a equipe no balcão.</p></div>';
  } else {
    render();
  }
  armAttract();
})();
`

const page = (shelves: ReturnType<typeof buildShelves>) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#503484">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Vitrine da loja</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Petrona:wght@500;600;700&display=swap">
<style>${STYLES}</style>
</head>
<body>
<div id="app">
  <header id="bar">
    <img src="/images/logos/logo-icon.png" alt="Gota de Cura">
    <button type="button" id="back" class="pill back" data-act="back" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>Voltar</button>
    <nav id="crumbs" aria-label="Trilha"></nav>
    <button type="button" id="home" class="pill home" data-act="home" aria-label="Voltar ao início" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>Início</button>
  </header>
  <div id="scroll"><div id="content"></div></div>
</div>
<div id="attract" aria-hidden="true">
  <video id="attractVideo" src="/videos/gotadecura-institucional-vitrine.mp4" poster="/videos/gotadecura-institucional-vitrine-poster.jpg" muted loop playsinline webkit-playsinline preload="none"></video>
  <div id="attractHint"><span>Toque na tela para ver o catálogo</span></div>
</div>
<script>window.__VITRINE__ = ${inlineJson({ shelves })};</script>
<script>${SCRIPT}</script>
</body>
</html>`

const errorPage = () => `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vitrine da loja</title>
<style>body{font-family:Georgia,serif;background:#faf8fc;color:#211c2b;text-align:center;padding:96px 24px}p{font-family:-apple-system,Helvetica,sans-serif;color:#54505f}button{margin-top:24px;background:#5d3b97;color:#fff;border:0;border-radius:28px;padding:16px 32px;font-size:17px;font-weight:600}</style>
</head><body><h1>Não consegui carregar a vitrine agora</h1><p>Pode ser a conexão da loja. Toque para tentar de novo — se continuar, chame a equipe.</p>
<button onclick="location.reload()">Tentar de novo</button></body></html>`

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'products'))
    const all = snapshot.docs.map((entry) => entry.data() as ProductItem)
    return new Response(page(buildShelves(all)), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Short edge cache: price and availability changes reach the tablet
        // within a minute, and a reload never waits on Firestore.
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return new Response(errorPage(), {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
}
