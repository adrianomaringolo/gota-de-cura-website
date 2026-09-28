# Template `destaque-faixa`

Slide único, lilás escuro liso, com uma faixa vertical de foto em duotone à direita. O
texto domina: ícone, afirmação com trecho sublinhado em terracota, explicação e botão para
uma página do site.

## Preview

| Único |
|---|
| ![](previews/destaque-faixa/slide-01.png) |

HTML em `previews/destaque-faixa/`.

## Quando usar

- Pilar **Dado / confiança**: cromatografias, cultivo sem agrotóxico, água de nascente,
  destilação artesanal.
- Levar para uma página fixa do site (`/cromatografias`, `/visitas`, `/sobre`).
- Quando a foto é **apoio**, não protagonista (laboratório, detalhe de equipamento, textura).

**Não use quando** o destino é um post do blog: é `chamada-blog`. **Não use** quando a foto
é boa o bastante para ocupar o slide inteiro; aí a foto merece `chamada-blog` ou a capa de
um carrossel.

## Estrutura de slides

| Slide | Tema | Papel |
|---|---|---|
| 1 | Escuro liso `#503484` + faixa de foto | Logo, ícone, título, explicação, nota, botão. |

## Capa

Coluna de texto com 750px à esquerda; faixa de foto com 330px à direita, com fade de 96px
fundindo no roxo.

```css
.photo { position: absolute; top: 0; right: 0; width: 330px; height: 100%;
  object-fit: cover; filter: grayscale(1) contrast(1.04) brightness(1.02); }
.photo-duo-shadow { /* mesmo box */ background: #2a1a48; mix-blend-mode: lighten; }
.photo-duo-light  { /* mesmo box */ background: #f1cebb; mix-blend-mode: darken; }
.photo-fade { position: absolute; top: 0; right: 330px; width: 96px; height: 100%;
  background: linear-gradient(90deg, #503484 0%, rgba(80,52,132,0) 100%); }
.content { position: absolute; top: 0; left: 0; width: 750px; height: 100%;
  padding: 96px 60px 96px 88px; display: flex; flex-direction: column; }
.icon { width: 72px; height: 72px; margin-top: 76px; color: #dacbf9; }
h1 .accent { font-style: italic; font-weight: 500;
  background: linear-gradient(#cd632d, #cd632d) left 92% / 100% 5px no-repeat; padding-bottom: 4px; }
.cta { margin-top: auto; /* pílula branca, 24–26px, cabe URLs longas */ }
```

Ícone: um único Lucide (`flask-conical`, `sprout`, `droplets`, `map-pin`…), `stroke-width="2"`.

## Slides internos

Não tem.

## Fecho

Não tem: o botão é o fecho.

## Imagens

- **Exige** foto vertical: `cover.jpg`, mínimo 660×1350 útil (a faixa exibe 330px de largura).
- Sempre em duotone. Enquadre com `object-position` para o detalhe cair no meio da faixa.
- Foto de banco (Pexels) é aceitável aqui; registre o crédito em `POSTS.md`.

## Escala tipográfica

| Elemento | Tamanho |
|---|---|
| Logo | 300–320px |
| Título | 62–66px, coluna de 750px |
| Lead | 28–29px, `max-width: 30ch`, 1 palavra em `<strong>` |
| Nota | 24–25px `#dacbf9` |
| Botão | 24–26px (URL longa) |

## Variações permitidas

- Lado da faixa: direita (padrão) ou esquerda, invertendo coluna e fade.
- Largura da faixa: 280 a 380px.
- Ícone: qualquer Lucide que represente o argumento, ou nenhum (aí o título sobe).
- Nota abaixo do lead: presente ou ausente.
- Handle abaixo do logo (post-03 omitiu): presente ou ausente.
- Fundo `#503484` (padrão) ou `#291945` para assunto mais grave.

## Travas

- **Foto só na faixa, nunca em tela cheia.** O texto é o protagonista; se a foto cresce,
  vira outro template.
- **Faixa sempre em duotone lilás/terracota.** Cor natural numa faixa estreita parece
  recorte colado.
- **Um trecho do título com sublinhado terracota.** É a assinatura visual do template e o
  lugar onde mora o argumento.
- **Botão com URL de página do site, nunca do blog.**
- Herdadas do `BRAND.md`: `background` no `body`, sem marcador de carrossel, ícone de lib
  real (nunca desenhado à mão), nada de emoji.

## Posts de referência

- `post-03`: O que tem dentro do frasco, por escrito (cromatografias). O ícone de frasco
  desse post foi desenhado à mão; nos próximos, use o `flask-conical` do Lucide.
