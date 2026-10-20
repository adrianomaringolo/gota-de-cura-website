# Template `frase-gigante`

> **Nível de criatividade:** 3 · Ousado. Fonte de exibição própria (Fraunces) e efeito de texto (linha em contorno, palavra preenchida pela foto).

Slide único em que a frase é a imagem: quatro linhas enormes em Fraunces, uma só em contorno e uma palavra em itálico preenchida pela foto, sobre lilás profundo.

## Preview

| Único |
|---|
| ![](previews/frase-gigante/slide-01.png) |

HTML em `previews/frase-gigante/`.

## Quando usar

- Uma frase curta que merece ser lida de longe: afirmação da marca, lema da chácara, um dado que cabe em quatro linhas ("Sem agrotóxico. Em nenhum canteiro.").
- Pausa ousada entre posts mais explicativos do feed.

**Não use quando** a frase leva dado ou explicação: é `destaque-faixa` ou `carrossel-educativo`. **Não use** para divulgar blog: é `chamada-blog`. Se a ideia é uma planta, é `recorte-botanico`.

## Estrutura de slides

| Slide | Tema | Papel |
|---|---|---|
| 1 | Escuro `#291945` | Logo e handle no topo, frase gigante no centro, apoio e selo opcional no rodapé. |

## Capa

```css
.phrase { margin: auto 0; font-size: 190–214px; line-height: 0.88; }
.phrase .outline { color: transparent; -webkit-text-stroke: 3px #dacbf9; }
.phrase .photo { font-style: italic; font-weight: 700;
  background: url('palavra.jpg') center / cover; -webkit-background-clip: text; background-clip: text; color: transparent; }
```

Quatro linhas no máximo, 3 a 8 letras por palavra em destaque. Uma linha em contorno, **uma** palavra com foto (ou gradiente terracota quando não há foto).

## Slides internos

Não tem.

## Fecho

Não tem: o rodapé com apoio e selo é o fecho. O CTA, quando houver, vai na legenda.

## Imagens

- Foto **opcional**: preenche uma palavra via `background-clip: text`. Escolha foto de textura forte (folhas, solo vermelho, vapor), `palavra.jpg` com pelo menos 1080px de largura. Sem foto, use `repeating-linear-gradient` terracota.
- Logo de `assets/logos/logo.png`, branco por filtro.

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
| Frase | 190–214px Fraunces 800, `line-height: 0.88` |
| Palavra em foto | mesmo tamanho, itálico 700 |
| Apoio | 26–28px, até 2 linhas |
| Selo | 19px, caixa alta |

## Variações permitidas

- Qual linha fica em contorno (uma só) e qual palavra recebe a foto.
- Fundo `#291945` ou `#503484`.
- Cor do contorno: `#dacbf9` ou `#f0c8ae`.
- Foto na palavra, gradiente terracota ou nenhum destaque (só contorno).
- Selo no canto inferior direito: presente ou ausente.
- Blob de luz atrás da frase: à esquerda ou à direita.

## Travas

- **Frase de no máximo 4 linhas e 12 palavras.** Fonte de 200px só se mantém legível no celular com texto curto.
- **Fraunces só na frase.** Apoio, selo e handle ficam em Archivo; a fonte nova não vira texto corrido.
- **Só uma linha em contorno e só uma palavra com foto.** Dois efeitos disputam o olhar.
- **Contraste AA:** contorno `#dacbf9` e texto branco só sobre `#291945`/`#503484`.
- **Sem promessa terapêutica** na frase (regra do `BRAND.md`).
- Herdadas do `BRAND.md`: `background` no `body`, logo branco no topo, sem marcador de carrossel, nada de emoji.

## Posts de referência

Nenhum ainda.
