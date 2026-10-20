# Template `recorte-botanico`

> **Nível de criatividade:** 3 · Ousado. Fonte de exibição própria (Fraunces) e efeito de imagem (planta recortada na frente do título) com selo circular girado.

Slide único para apresentar uma planta: o nome em Fraunces enorme fica **atrás** do recorte da planta, que o atravessa, sobre um disco lilás claro. Selo terracota com texto em anel e nome científico no rodapé.

## Preview

| Único |
|---|
| ![](previews/recorte-botanico/slide-01.png) |

HTML em `previews/recorte-botanico/`.

## Quando usar

- Lançamento ou destaque de **uma planta** que tem foto boa para recortar (lavanda, alecrim, melaleuca, capim-limão).
- Quer um post de planta mais chamativo que a `ficha-da-planta`.

**Não use quando** o post precisa de ficha, laudo ou "como usar": é `ficha-da-planta` (carrossel). **Não use** sem recorte em fundo transparente: sem ele o efeito de profundidade não funciona. Para produto pronto, é `ficha-do-produto`.

## Estrutura de slides

| Slide | Tema | Papel |
|---|---|---|
| 1 | Lilás suave `#dacbf9` | Nome gigante, planta recortada na frente, selo, nome científico e botão. |

## Capa

```css
.sun   { width: 860px; height: 860px; border-radius: 50%; background: #f3ecff; top: 250px; left: 110px; }
.title { z-index: 1; font-size: 330px; color: #503484; top: 215px; }   /* atrás */
.cut   { z-index: 2; left: 190px; top: 330px; width: 700px; height: 800px; } /* a planta: <img src="planta.png"> */
.seal  { z-index: 3; right: 70px; top: 520px; width: 230px; transform: rotate(14deg); }
```

O topo da planta deve **invadir o nome** (por volta da metade da altura das letras). Selo em SVG com `<textPath>` em anel, `textLength` fixo para o texto fechar o círculo, e uma palavra curta em Fraunces itálico no meio ("novo", "lote", "safra").

## Slides internos

Não tem.

## Fecho

Não tem: o botão com a URL no rodapé é o fecho (pílula lilás `#503484` com texto branco).

## Imagens

- **Exige** `planta.png`: recorte em PNG com fundo transparente, 700px de largura no mínimo, planta inteira ou ramo com bom contorno. Dê preferência à planta da própria chácara.
- Logo de `assets/logos/logo.png` **sem filtro** (slide claro), 280px.

## Tipografia própria

Exceção ao `BRAND.md`: os títulos de destaque deste template usam **Fraunces** (Google Fonts), em vez do Petrona. O resto (apoio, rótulos, nome científico, URL do fecho) segue o `BRAND.md`.

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=Petrona:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
.display { font-family: 'Fraunces', serif; font-variation-settings: 'SOFT' 100, 'WONK' 1, 'opsz' 144;
  font-weight: 800; letter-spacing: -0.04em; line-height: 0.94; }
```

## Escala tipográfica

| Elemento | Tamanho |
|---|---|
| Nome da planta | 280–340px Fraunces 800, uma palavra só |
| Nome científico | 40px Petrona itálico (segue o `BRAND.md`) |
| Apoio | 24px |
| Selo | anel 16px caixa alta; miolo 44px Fraunces itálico |
| Botão | 28px, weight 700 |

## Variações permitidas

- Nome de uma palavra (ou duas curtas, com redução do tamanho).
- Cor do disco: `#f3ecff` (padrão), `#faf8fc` ou `#fff`; fundo `#dacbf9` ou `#f1eef6`.
- Posição do selo: direita, esquerda ou sobre o recorte.
- Texto do selo: "Novo na prateleira", "Safra 2026", "Lote novo".
- Recorte levemente girado (até 6°).
- Botão para `gotadecura.com.br/hidrolatos`, `/oleos-essenciais` ou o produto.

## Travas

- **Nome sempre atrás, recorte sempre na frente.** É o efeito que dá identidade ao template.
- **Recorte de fundo transparente, sem moldura ou sombra dura.** Foto retangular não serve.
- **Nome da planta em uma palavra legível:** se o nome estoura a largura, reduza até 280px; abaixo disso, outro template.
- **Nome científico em itálico no rodapé** (regra de marca: a planta é a protagonista).
- **Fraunces só no nome e no miolo do selo.**
- Terracota `#a24112` só no selo, nunca como fundo grande.
- Herdadas do `BRAND.md`: sem marcador de carrossel, ícone Lucide `arrow-right` no botão, nada de emoji.

## Posts de referência

Nenhum ainda.
