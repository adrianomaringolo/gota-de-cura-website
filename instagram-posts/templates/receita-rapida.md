# Template `receita-rapida`

> **Nível de criatividade:** 2 · Expressivo. Mesmas fontes da marca; cartão de papel inclinado com fita, chips de ingredientes e passos numerados.

Slide único que mostra um uso do hidrolato como **receita de cozinha**: um cartão branco levemente girado, preso por uma fita terracota, sobre lilás suave.

## Preview

| Único |
|---|
| ![](previews/receita-rapida/slide-01.png) |

HTML em `previews/receita-rapida/`.

## Quando usar

- Um uso prático com poucos ingredientes e até 3 passos: cubos de gelo para o rosto, spray de ambiente, escalda-pés, compressa para os olhos (veja o guia de usos do hidrolato).
- Conteúdo de salvar e voltar depois.

**Não use quando** há mais de 3 passos ou muita explicação: é `carrossel-educativo`. **Não use** para uso na boca ou na comida sem hidrolato próprio para isso. **Não use** para lista de usos sem ordem: é `lista-ilustrada`.

## Estrutura de slides

| Slide | Tema | Papel |
|---|---|---|
| 1 | Lilás suave `#dacbf9` com cartão branco | Logo, cartão com eyebrow, título, chips de ingredientes, 3 passos e uma nota de cuidado. |

## Capa

```css
.paper { background: #fff; border-radius: 26px; transform: rotate(-1.6deg); box-shadow: 0 24px 60px rgba(41,25,69,0.30); }
.tape  { width: 210px; height: 54px; background: rgba(205,99,45,0.78); transform: rotate(3deg); }  /* fita no topo */
.chips span { background: #f3ecff; color: #503484; border-radius: 999px; padding: 12px 24px; }
.step b { width: 52px; height: 52px; border-radius: 50%; background: #5d3b97; color: #fff; }
```

## Slides internos

Não tem.

## Fecho

Não tem. A nota de cuidado ou conservação no pé do cartão faz o papel de fecho; o CTA vai na legenda.

## Imagens

Não usa foto. Logo de `assets/logos/logo.png` sem filtro (fundo claro).

## Escala tipográfica

| Elemento | Tamanho |
|---|---|
| Título | 82px Petrona 600, trecho em itálico `#a24112` |
| Chips | 27px Archivo 600 |
| Passos | 32px Archivo 400, uma ação por passo |
| Nota | 22px |

## Variações permitidas

- Inclinação do cartão entre -3° e 3° (sempre alguma).
- Fita terracota, lilás `#8961c7` ou ausente.
- 2 ou 3 passos; 2 a 5 ingredientes.
- Fundo `#dacbf9` ou `#f1eef6`.
- Eyebrow: "Receita rápida", "Uso do dia", "Passo a passo".
- Tempo no eyebrow ("5 minutos") ou sem tempo.

## Travas

- **Cartão branco com sombra violeta e rotação leve.** Sem rotação ele vira o `destaque-faixa`.
- **No máximo 3 passos, cada um com uma ação no imperativo.** Mais que isso é carrossel.
- **Sempre uma nota de cuidado ou conservação** (geladeira, teste na pele, quando descartar). Sem promessa terapêutica.
- **Ingredientes reais e simples**, de casa. Nada de receita que exija conservante ou mistura de hidrolato com óleo.
- Herdadas do `BRAND.md`: handle no rodapé direito, sem marcador de carrossel, nada de emoji, no máximo 1 travessão.

## Posts de referência

Nenhum ainda. Fonte de ideias: `src/content/blog/2026-10-15-guia-de-usos-do-hidrolato`.
