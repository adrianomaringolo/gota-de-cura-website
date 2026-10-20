# Template `novidade-do-site`

Slide único, lilás escuro liso, que anuncia uma novidade do site. No lugar de foto, uma
ilustração em **cartões brancos inclinados** mostra a novidade de forma concreta (as duas
bandeiras do site bilíngue, por exemplo). Embaixo, selo terracota, título com um trecho
sublinhado, apoio e botão para a página.

## Preview

| Único |
|---|
| ![](previews/novidade-do-site/slide-01.png) |

HTML em `previews/novidade-do-site/`.

## Quando usar

- Uma mudança no próprio site que o público pode usar: idioma novo, página nova, função
  nova (acompanhar pedido, inscrição online, catálogo novo).
- Quando a novidade se explica melhor com 1 a 3 elementos gráficos (bandeiras, ícones,
  pedaços de interface) do que com foto.

**Não use quando** a novidade é um post do blog: é `chamada-blog`. **Não use** quando o
assunto é confiança ou procedência com uma foto de apoio (laudo, laboratório): é
`destaque-faixa`. **Não use** para produto novo no catálogo: é `ficha-do-produto` ou
`ficha-da-planta`.

## Estrutura de slides

| Slide | Tema | Papel |
|---|---|---|
| 1 | Escuro liso `#503484` | Logo e handle no topo, cartões ilustrados, selo, título, apoio, botão. |

## Capa

Topo com logo e handle (como no `chamada-blog`). Os cartões ocupam a faixa do meio; o texto
se apoia no rodapé com `margin-top: auto`.

```css
.cards { position: relative; height: 480px; margin-top: 40px; }
.card { position: absolute; top: 14px; width: 420px; padding: 22px 22px 24px;
  background: #ffffff; border-radius: 30px; box-shadow: 0 22px 54px rgba(25,14,44,0.45); }
.card.pt { left: 10px; transform: rotate(-6deg); }
.card.en { left: 450px; top: 34px; transform: rotate(5deg); }
.flag { display: block; border-radius: 16px; overflow: hidden; }
.flag img { display: block; width: 100%; height: 262px; object-fit: cover; }
.label { display: flex; align-items: baseline; gap: 16px; margin-top: 16px; padding: 0 6px; }
.code { font-family: 'Petrona', serif; font-weight: 600; font-size: 64px; color: #503484; }
.name { font-size: 25px; font-weight: 500; color: #54505f; }
.tag { /* selo terracota "Novidade no site", igual ao do chamada-blog */ }
h1 em { font-style: italic; font-weight: 500;
  background: linear-gradient(#cd632d, #cd632d) left 92% / 100% 5px no-repeat; padding-bottom: 4px; }
```

Cada cartão: ilustração em cima (asset de `assets/images/` ou ícone Lucide grande) e
rótulo embaixo (código curto em Petrona + nome em Archivo). Os cartões ficam `aria-hidden`:
o título e o apoio carregam a informação.

## Slides internos

Não tem.

## Fecho

Não tem: o botão é o fecho.

## Imagens

- **Não usa foto.** A ilustração vem de `assets/images/` (bandeiras, selos) ou de ícones
  Lucide colados inline em `#503484`, em tamanho grande (120–160px) dentro do cartão.
- Elemento gráfico novo e reaproveitável (outra bandeira, um pedaço de interface) vai para
  `assets/images/` e para o `ASSETS.md`.
- Elementos com cor própria (bandeiras) mantêm as cores reais, simplificadas: forma
  reconhecível, sem detalhe miúdo que some no celular.

## Escala tipográfica

| Elemento | Tamanho |
|---|---|
| Logo | 300px |
| Código do cartão | 56–64px Petrona 600 |
| Nome do cartão | 22–26px Archivo 500 |
| Selo | 19px, caixa alta, `letter-spacing: 0.16em` |
| Título | 84–92px, `max-width: 16ch`, em 2 linhas |
| Apoio | 28–30px, largura total da coluna, até 2 linhas (sem palavra sozinha na última) |
| Botão | 34–36px |

## Variações permitidas

- Número de cartões: 1, 2 (padrão, 420px cada) ou 3. Com 3, largura de 290–310px e rotações menores.
- Inclinação dos cartões: entre -8° e 8°, sempre um para cada lado quando há dois.
- Conteúdo do cartão: asset gráfico (bandeira, selo) ou ícone Lucide grande.
- Texto do selo: "Novidade no site" (padrão), "Novo no site", "Agora no site".
- Fundo `#503484` (padrão) ou `#291945`.
- Blob claro atrás dos cartões: presente (padrão) ou ausente.

## Travas

- **Sem foto.** Se a novidade pede foto, é outro template (`destaque-faixa` ou
  `chamada-blog`); o cartão é o que dá identidade a este.
- **Cartões sempre brancos, com sombra violeta.** É o contraste que faz a ilustração ler
  como "peça do site" sobre o lilás.
- **Um trecho do título sublinhado em terracota.** É onde mora a novidade, e mantém o
  parentesco visual com o `destaque-faixa`.
- **Botão com a URL exata da novidade** (`gotadecura.com.br/en`, `/visitas/inscricao`),
  nunca só o domínio: quem lê precisa saber onde clicar.
- Herdadas do `BRAND.md`: `background` no `body`, logo branco no topo, sem marcador de
  carrossel, ícones de lib real, nada de emoji no slide.

## Posts de referência

- `post-13`: Agora o site também fala inglês (bandeiras do Brasil e dos EUA).
