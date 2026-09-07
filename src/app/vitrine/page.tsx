import { Vitrine } from '@/components/vitrine/Vitrine'

/*
  DIRECTION CONTRACT — Vitrine da loja (in-store tablet display)

  THESIS: A shop-counter display, not a shrunken website. One screen, three
  depths — linhas, prateleira, planta — and a thumb always one big tap from
  "Início". It refuses the responsive-website-in-a-frame and the app grid of
  identical tiles.

  OWN-WORLD: Inherits the Gota de Cura system unchanged — brand lilac drenched
  chrome bar, terracotta accents, Petrona display over Archivo, violet-cast
  shadows, rounded-2xl cards, the chácara's own photography carrying the warmth.
  Kiosk register: everything scaled up, 56px+ targets, generous air.

  STORY: A visitor standing at the counter taps a linha, scans the prateleira,
  opens a planta to read its story, see the price and whether it is available
  today — then chama a equipe no balcão. No cart, no checkout, no exit to the
  web.

  FIRST VIEWPORT: Slim lilac chrome bar with the droplet mark and a warm line;
  below it the linhas fill the screen as large image tiles (name + contagem),
  the two linhas especiais spanning wide. Scrolls if it overflows.

  FORM: Client-side view machine (home → category → product), no routes, no
  links. 60s idle returns to Início. Adapts to portrait and landscape via
  auto-fill grids. Seed key: n/a (established world, precisely specified surface).

  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying its
  provenance.
*/
export default function VitrinePage() {
  return <Vitrine />
}
