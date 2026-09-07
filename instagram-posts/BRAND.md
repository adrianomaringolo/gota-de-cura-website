# Instagram — Gota de Cura (@gotadecura_artesanais)

Regras de identidade visual e voz para posts do Instagram. A skill `instagram-post`
(genérica, mora em `~/Projects/claude-skills`) lê este arquivo como fonte de verdade — tudo que
é específico da Gota de Cura está aqui, não na skill.

Os posts espelham a identidade do site gotadecura.com.br: paleta lilás da marca com terracota,
serifa Petrona, voz artesanal e acolhedora. Não é um template genérico de "post de marca".

---

## Conta e marca

- Handle: **@gotadecura_artesanais**.
- Óleos essenciais e hidrolatos artesanais, destilados na chácara com plantas cultivadas sem
  agrotóxico e água de nascente. Laudos e cromatografias publicados como diferencial de confiança.
- **Toda a renda sustenta os trabalhos assistenciais da Morada Espírita Prof. Lairi Hans** —
  vale mencionar quando o post fala da marca como um todo, sem transformar em apelo.
- Referência de marca: `PRODUCT.md` na raiz do projeto.

---

## Tipos de post

1. **Educativo** (o que é hidrolato, como ler um laudo, para que serve cada planta) — um
   conceito por slide, linguagem de leigo.
2. **Produto / lançamento** (novo hidrolato no catálogo, lote da última destilação) — a planta é
   a protagonista: nome popular e científico em destaque, origem, uso.
3. **Bastidores da chácara** (manhã de destilação, colheita, visita guiada) — mais fotográfico e
   narrativo.
4. **Dado / confiança** (cromatografias, sem agrotóxico, água de nascente) — ciência a serviço
   da confiança, sem tecnicismo intimidador.

---

## Voz da marca

- **Natural, artesanal, acolhedora.** Voz calorosa e próxima, de quem conhece cada planta pelo
  nome e tem orgulho do que cultiva. Nunca corporativa.
- **A planta é a protagonista.** Nome popular e origem sempre em destaque. Nome científico em
  itálico como apoio.
- **Ciência sem intimidar.** Laudos e cromatografias explicados em linguagem de leigo, nunca
  como jargão.
- **Óleo essencial e hidrolato têm o mesmo peso.** Os dois são resultado da destilação: o óleo
  leva as substâncias lipossolúveis, o hidrolato leva as hidrossolúveis. **Nunca** descreva o
  hidrolato como "o que sobra", "a água que resta" ou "subproduto". É um produto, não uma sobra.
- **Sem "bem-estar performático".** Nada de promessa de cura, linguagem de MLM de óleos, ou tom
  de farmácia industrial. Não prometemos efeito terapêutico que não podemos comprovar.
- **Frases curtas e concretas.** Nada de abertura genérica tipo "No mundo agitado de hoje...".
  Comece pela planta, pelo processo ou por uma cena da chácara.

### Regras de linguagem inegociáveis

- **Nunca** posicionar o hidrolato como subproduto (ver acima).
- **Nunca** prometer efeito terapêutico não comprovável.
- **Sem emojis nos slides HTML** (só na legenda).

### Português do Brasil correto

- **Acentuação obrigatória**: não, você, já, é, está, óleo, hidrolato (sem acento), destilação,
  também, à, às, água, saúde etc.
- **Concordância verbal e nominal** revisada.
- **Travessão (—) com moderação.** Preferir dois-pontos, vírgula ou nova frase. **No máximo 1
  travessão por slide.**
- **Ponto final** em frases declarativas dentro de cards e callouts.
- Antes de exportar, revisar cada slide procurando palavra sem acento: `nao → não` ·
  `voce → você` · `ja → já` · `e → é` (verbo) · `oleo → óleo` · `destilacao → destilação` ·
  `agua → água` · `saude → saúde` · `essencia → essência`.

---

## Paleta

Espelha os tokens de `src/app/globals.css`. Cores em hex (os slides HTML são standalone, sem
acesso aos tokens OKLCH do site).

### Claro (padrão)
| Papel | Hex |
|---|---|
| Fundo (canvas) | `#faf8fc` |
| Fundo afundado | `#f1eef6` |
| Card / superfície | `#ffffff` |
| Tinta (texto forte) | `#211c2b` |
| Tinta suave | `#54505f` |
| Tinta apagada | `#5f5b68` |
| Marca (lilás) | `#5d3b97` |
| Marca profunda | `#67449d` |
| Marca mais escura | `#503484` |
| Marca clara (realce) | `#8961c7` |
| Marca suave (fundo de selo) | `#dacbf9` |
| Marca tint (chip claro) | `#f3ecff` |
| Terracota (acento) | `#a24112` |
| Terracota clara | `#cd632d` |
| Linha / borda | `#dfdce6` |

### Escuro (slides de capa ou CTA)
| Papel | Hex |
|---|---|
| Fundo | `#503484` (ou `#291945` para mais grave) |
| Texto | `#ffffff` |
| Texto secundário | `rgba(255,255,255,0.75)` |
| Acento | `#cd632d` (terracota clara) ou `#dacbf9` (lilás suave) |

O roxo da marca é âncora, a terracota é o acento pontual (vem do solo vermelho das fotos da
chácara). **Não usar a terracota como cor de fundo grande.**

---

## Tipografia

Via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- **Títulos (headlines)**: `Petrona`, serifa, weight 600, `letter-spacing: -0.022em`, 64–84px.
  É a fonte de "monografia botânica" da marca.
- **Corpo**: `Archivo`, weight 400–500, `line-height: 1.6`, 30–38px.
- **Eyebrow / label**: `Archivo`, 15–17px, weight 700, `letter-spacing: 0.14em`,
  `text-transform: uppercase`, cor `#5f5b68`.
- **Nome científico**: `Petrona` itálico, cor `#54505f`.
- **Cards**: título 24–28px Petrona weight 600, corpo 19–22px Archivo weight 400.

---

## Elementos de marca

- **Logo** (obrigatório na capa e no slide final, e só nesses dois): o lockup completo
  `public/images/logos/logo.png` (gota + "gota de cura" + "Cuidando com amor", 1641×535). Copie
  para a pasta do post como `logo.png` e referencie relativo, do mesmo jeito que a foto de capa.
  - **Capa**: no topo, `width: 300px`, alinhado à esquerda. Substitui o eyebrow nesse slide.
  - **Slide final**: no topo ou acima do título, `width: 270px`. Substitui o eyebrow.
  - Sempre `height: auto`. Se o container for `display: flex`, ponha `align-self: flex-start`
    no logo, senão ele estica e distorce.
  - Capa e fecho são slides escuros: aplique `filter: brightness(0) invert(1)` para deixar o
    logo branco sólido. Em slide claro, use o logo sem filtro.
  - Nos slides de conteúdo **não** vai logo: a assinatura ali é o rule-mark + o handle no rodapé.
- **Rule-mark** (assinatura dos slides de conteúdo, uma vez por slide, acima do título): barra
  de `44px × 2px`, cor `currentColor` a `45%` de opacidade, `margin-bottom: 20px`. Espelha o
  `.rule-mark` do site.
- **Acento superior** (opcional, slides de capa): faixa de 5px no topo, `#5d3b97`.
- **Fundo**: violeta-off-white liso é o padrão. Para dar respiro, um blob suave:
  `radial-gradient(circle, rgba(93,59,151,0.10) 0%, transparent 70%)`. A fotografia da chácara é
  que carrega a cor quando houver foto. Margens largas, não encher o slide.
- **Handle**: `@gotadecura_artesanais`, `Archivo` 20px, `@` em `#5d3b97` (ou `#dacbf9` em slide
  escuro). Em todos os slides, no rodapé à direita — **exceto** quando um CTA em destaque ocupa
  o rodapé; nesse caso o handle vai ao lado do logo, no topo à direita.
- **CTA em destaque** (chamada para blog, catálogo ou visita): botão de pílula sólido,
  `background: #ffffff`, texto `#503484` weight 700 ~34–36px, `padding: 30px 46px`,
  `border-radius: 999px`, sombra `0 12px 38px rgba(41,25,69,0.48)`, com a seta `→`. O texto do
  botão é a URL (ex.: `gotadecura.com.br/blog`). É o elemento mais forte do slide depois do
  título.
- **Chamada para post do blog**: o título do slide é **o mesmo título do post** (campo `title`
  do frontmatter em `src/content/blog/.../index.md`), sem reescrever.
- **Marcador de slide** (carrossel): **círculos**, um por slide, `12px` de diâmetro
  (`border-radius: 50%`), `gap: 10px`. Inativos `#dfdce6`; ativo `#5d3b97`. Em slide escuro:
  inativos `rgba(255,255,255,0.3)`, ativo `#dacbf9`. Todos do mesmo tamanho. Post único não tem
  marcador.
- **Sombra**: violeta, nunca cinza neutro. `0 6px 20px rgba(41,25,69,0.10)`.

---

## Ícones

Apenas **SVG inline** em traço, estilo botânico e limpo (folha, gota, ramo, frasco, alambique).
`stroke` `#5d3b97` ou `#a24112`, `stroke-width` 1.6–2, `fill: none`. **Nunca emojis nos slides.**

---

## Fotos (quando houver)

- Enquadrar a planta ou a cena da chácara, `object-fit: cover`.
- Sobre foto escura, texto branco com scrim: `rgba(41,25,69,0.35)` por cima.
- `alt` sempre descritivo da cena real.

---

## Acessibilidade

WCAG AA. Contraste mínimo 4.5:1 em corpo de texto. Texto branco só sobre `#503484`/`#291945` ou
sobre foto com scrim. **Nada de lilás claro (`#8961c7` ou mais claro) atrás de texto branco.**

---

## Formato

Todo slide é **1080×1350** (`"format": "1080x1350"` no `meta.json`), único ou carrossel. É o
padrão do feed do Instagram — não misturar formatos entre posts. Carrossel: **3 a 7 slides**.

### Estrutura HTML base

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1350px; overflow: hidden;
    background: #faf8fc;
    font-family: 'Archivo', sans-serif;
    color: #211c2b;
  }
  .slide { position: relative; width: 1080px; height: 1350px; padding: 96px 88px; overflow: hidden; }
  .blob { position: absolute; width: 640px; height: 640px; border-radius: 50%;
    background: radial-gradient(circle, rgba(93,59,151,0.10) 0%, transparent 70%);
    top: -160px; right: -140px; pointer-events: none; }
  .logo { width: 300px; height: auto; align-self: flex-start; filter: brightness(0) invert(1); }
  .rule-mark::before { content: ''; display: block; width: 44px; height: 2px;
    background: currentColor; opacity: 0.45; margin-bottom: 20px; }
  h1 { font-family: 'Petrona', serif; font-weight: 600; letter-spacing: -0.022em;
    font-size: 80px; line-height: 1.05; color: #503484; }
  .lead { font-size: 34px; line-height: 1.6; color: #54505f; margin-top: 28px; max-width: 20ch; }
  .eyebrow { font-size: 16px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #5f5b68; }
  .handle { position: absolute; right: 88px; bottom: 88px; font-size: 20px; color: #5f5b68; }
  .handle em { color: #5d3b97; font-style: normal; }
  .progress { position: absolute; left: 88px; bottom: 90px; display: flex; gap: 10px; }
  .progress span { width: 12px; height: 12px; border-radius: 50%; background: #dfdce6; }
  .progress span.active { background: #5d3b97; }
</style>
</head>
<body>
<div class="slide">
  <div class="blob"></div>
  <!-- Só na capa e no slide final: <img class="logo" src="logo.png" alt="Gota de Cura"> -->
  <div class="content"><!-- conteúdo do slide --></div>
  <div class="progress"><span class="active"></span><span></span><span></span></div>
  <div class="handle"><em>@</em>gotadecura_artesanais</div>
</div>
</body>
</html>
```

Numa capa ou fecho com fundo escuro, o `.progress` usa cores claras
(`background: rgba(255,255,255,0.3)`, ativo `#dacbf9`).

**Slide escuro precisa declarar a cor no `body`**, não só no `.slide` — senão o screenshot do
Puppeteer sai em branco.

### Tipos de post

| Formato | Diretriz |
|---|---|
| **Post único** (1 slide) | Tudo num slide. Frase de impacto, dado, dica curta, chamada para o blog. Leva o logo no topo (é capa e fecho ao mesmo tempo). Sem marcador de slide. |
| **Carrossel** (3–7 slides) | Slide 1 = capa/gancho, **logo no topo**, geralmente escuro (`#503484`), precisa parar o scroll. Slides 2 a N-1 = desenvolvimento, um conceito por slide, sem logo (rule-mark + handle). Slide N = fecho/CTA, **logo no topo**, `gotadecura.com.br` grande ou convite para a visita/catálogo. |

---

## meta.json

Lido por `instagram-posts/scripts/export.mjs` — o script é a autoridade sobre o formato.

```json
{
  "title": "Título do post",
  "date": "YYYY-MM-DD",
  "type": "carousel | single",
  "format": "1080x1350",
  "slides": [
    { "file": "slide-01.html", "title": "Nome do slide", "description": "O que contém" }
  ],
  "caption": "Legenda completa pronta para copiar...",
  "hashtags": ["oleosessenciais", "hidrolatos", "aromaterapia"]
}
```

---

## Legenda (caption)

- **Usar emojis** — enriquecem o engajamento e tornam o texto escaneável. (Emojis são
  exclusivos da legenda. **Nunca** nos slides HTML.)
- Começar com um emoji ou frase que prenda a atenção no feed, ancorada na planta ou no processo.
- Emojis como marcadores de lista (`🌿 item`) ou pontuação visual.
- Tom conversacional e caloroso, sem promessa terapêutica.
- Terminar com um CTA claro (`👇`, `💬`, link na bio).
- 8–12 hashtags relevantes ao final.

Emojis úteis por contexto:
| Contexto | Emojis |
|---|---|
| Planta / natureza | 🌿 🌱 🌸 🪻 🍃 |
| Destilação / processo | ⚗️ 💧 🔥 |
| Chácara / origem | 🏡 ☀️ 🐝 |
| Confiança / laudo | ✅ 🔬 📋 |
| Cuidado / acolhimento | 💜 🤲 |
| CTA / engajamento | 👇 💬 🔔 |

---

## Estrutura de arquivos

| O quê | Caminho |
|---|---|
| HTML dos slides | `instagram-posts/html/post-NN/` |
| PNGs exportados + `caption.md` | `instagram-posts/output/post-NN/` |
| Origem do logo | `public/images/logos/logo.png` (copiar para a pasta do post como `logo.png`) |
| Script de export | `node instagram-posts/scripts/export.mjs post-NN` (`--slides 1,3` para alguns) |
| Instalar deps (uma vez) | `cd instagram-posts && npm install` |
| Índice de posts | `instagram-posts/POSTS.md` (tabela + "Detalhes por post" + "Última atualização") |
| Template de referência | `instagram-posts/html/_template/` |

Se o Chrome/Chromium não for encontrado no export, definir `PUPPETEER_EXECUTABLE_PATH`
(macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).

O próximo ID (`post-NN`) sai de olhar `instagram-posts/html/`.

---

## Referências no repo

- `instagram-posts/html/_template/` — slide de referência com o sistema visual montado.
- Posts anteriores em `instagram-posts/html/` — referência de layout, tom e conteúdo.
- `PRODUCT.md` — marca, público, anti-referências, princípios de design.
- `src/app/globals.css` — tokens de cor e tipografia canônicos.
