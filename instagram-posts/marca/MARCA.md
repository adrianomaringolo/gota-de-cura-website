# Marca — Gota de Cura

> Versão 1 · 2026-10-20 · status: rascunho
> Caminho: **documentar**, sem briefing do cliente (tudo a partir do repositório). Base: `BRAND.md`, `PRODUCT.md`, tokens do site (`src/app/globals.css`, `src/lib/fonts`), posts 01 a 14. Ainda não há briefing, diagnóstico nem `ESTRATEGIA.md`.

## Levantamento

| Elemento | Estado | Evidência | O que fazer |
|---|---|---|---|
| Logotipo | firme, sem arquivo vetorial | Lockup `logo.png` (1641×535) usado de forma consistente no site e em 14 posts, em roxo e em branco por filtro | Vetorizar em SVG (principal, negativo, uma cor) fiel ao PNG; hoje só existe PNG |
| Símbolo (gota) | firme, sem arquivo vetorial | `mark.png` / `logo-icon.png` (415×601), usado nos slides internos e como ícone | Vetorizar em SVG; gerar avatar quadrado do perfil |
| Paleta | firme | Roxo `#5d3b97` (âncora), terracota `#a24112`/`#cd632d` (acento, do solo da chácara), lilás `#dacbf9`/`#f3ecff`, tinta `#211c2b`, fundo `#faf8fc`. Tokens em `globals.css` e espelhados no `BRAND.md` | Documentar com papéis e combinações aprovadas |
| Contraste | firme, com 3 combinações a proibir | Aprovadas: branco/`#503484` 9,7:1; `#5d3b97`/`#faf8fc` 7,8:1; `#a24112`/branco 6,4:1. Só texto grande: `#cd632d` em claro (3,7:1), `#a24112` em `#dacbf9` (4,2:1). Reprovadas: `#cd632d` sobre `#dacbf9` (2,6:1), `#cd632d` sobre roxos (2,1 a 2,5:1), `#5d3b97` sobre `#503484`/`#291945` | Entram em "Usos incorretos" |
| Tipografia | firme, 4 famílias | Petrona (títulos) e Archivo (corpo), Google Fonts. No site também **Amarillo** (manuscrita, `--font-script`) e **Ample Soft Pro** (`--font-wordmark`), arquivos próprios em `public/fonts/`. Nos templates de nível 3: Fraunces | Confirmar a licença de Amarillo e Ample Soft Pro e onde cada uma aparece no site (só no logo?) |
| Elementos gráficos | firme | Rule-mark (barra 44×2 px), gota no canto, círculo de marcador, cartões brancos com sombra violeta, gotas e arco nos templates novos | Documentar como "Padrões e elementos" |
| Fotografia | firme | Fotos da chácara (plantas, solo vermelho, alambique), recorte em duotone lilás/terracota em alguns posts | Documentar estilo e enquadramento |
| Ícones | firme | Lucide em traço, `stroke-width` 2, `currentColor` | Documentar |

### Já sabemos (não perguntar)
- Marca natural, artesanal e acolhedora; a planta é a protagonista; "ciência sem intimidar" (`PRODUCT.md`, `BRAND.md`).
- Anti-referências: farmácia industrial, e-commerce genérico, MLM de óleos, "bem-estar performático", minimalismo frio.
- Voz, temas e restrições já estão nas definições do `BRAND.md` (não prometer cura, hidrolato nunca como "sobra").
- Toda a renda sustenta a Morada Espírita Prof. Lairi Hans.
- Acessibilidade: WCAG AA, texto branco só sobre `#503484`/`#291945`.

### Falta saber (vai para o bloco Identidade visual)
- Existe o logo em vetor (Illustrator, Canva, CorelDRAW, PDF) com quem criou a marca? Decide se vetorizamos do PNG ou usamos o original.
- Quem fez o logo e as fontes Amarillo e Ample Soft Pro têm licença de uso comercial? Decide se entram no manual ou ficam só no logotipo.
- O cliente gosta do logo e quer mantê-lo como está? (Confirma o caminho documentar.)
- Há peças físicas com a identidade (rótulos, embalagem, fachada da chácara)? Decidem a página de aplicação e possíveis ajustes.
- Existe alguma cor ou estilo que nunca deve aparecer? (O `BRAND.md` só limita a terracota como fundo grande.)

## Essência
- Frase-assinatura: "Cuidando com amor." (slogan do logotipo).
- O que é, para quem, por quê: óleos essenciais e hidrolatos artesanais destilados na Chácara da Mãe Luzia, com plantas sem agrotóxico e água de nascente; laudos publicados como confiança; toda a renda vai para a Morada Espírita Prof. Lairi Hans. (`PRODUCT.md`, `BRAND.md`)
- Atributos: **Natural** (a planta é a protagonista), **Artesanal** (feito na chácara, com acabamento cuidado), **Acolhedora** (voz calorosa e próxima). Origem: `PRODUCT.md › Brand Personality`.

## Público
- **Principal**: quem valoriza a origem: clientes e curiosos de óleos essenciais e hidrolatos artesanais, que procuram conhecer o produto, ver o laudo e comprar com segurança. (`PRODUCT.md › Users`)
- **Secundário** **(a validar)**: aromaterapeutas e visitantes da chácara.
- Como a marca fala: frases curtas e concretas, laudo em linguagem de leigo, sem promessa de cura. (`definicao:voz`, `definicao:temas`)

## Voz
Regras em `BRAND.md › definicao:voz` e `definicao:temas`. Trechos reais no manual: caption do post-14 (hidrolato e óleo, mesma destilação) e o texto do blog sobre a destilaria.

## Logotipo
- Principal: `assets/logos/logo.svg` (gota em degradê `#8f6fe9` → `#5c23b1`, nome `#4c3b82`, slogan `#664eb4`). Negativo: `logo-negativo.svg`. Uma cor: `logo-mono.svg`. Símbolo: `simbolo.svg`. Avatar: `avatar.svg` (símbolo branco sobre `#503484`).
- **Origem dos SVGs:** vetorizados por contorno a partir do `logo.png` original (1641×535), sem o arquivo vetorial do autor. O degradê interno da gota foi simplificado (sombras e brilho do raster viram um degradê linear). Os PNGs `logo.png` e `mark.png` originais ficam como estavam, usados pelos posts já feitos.
- Fontes do logotipo (aparentemente Ample Soft Pro no nome e Amarillo no slogan, arquivos em `public/fonts/`): só como desenho. **(a validar licença)**
- Área de proteção: x = altura do "o" de "gota" (≈ 20% da altura do logotipo). Tamanho mínimo: logotipo 45 mm / 200 px; símbolo 8 mm / 24 px; avatar testado a 32 px. Impressão **(a confirmar com a gráfica)**.

## Combinações aprovadas
| Logo | Fundo | Contraste | Quando usar |
|---|---|---|---|
| Colorido | `#faf8fc` / branco | 8,8 : 1 (slogan 6,0 : 1) | Principal, peças claras |
| Negativo | `#503484` | 9,7 : 1 (slogan 6,4 : 1) | Capas e fechos |
| Negativo | `#291945` | 15,9 : 1 (slogan 10,5 : 1) | Fundo grave, chamadas |

## Usos incorretos
Distorcer; terracota clara sobre lilás (2,6 : 1); roxo sobre Noite (1,9 : 1); cores fora da paleta. Também: sombra, contorno, girar, redesenhar o nome, trocar a fonte do slogan, aplicar sobre foto sem camada sólida.

## Paleta principal
| Nome | Hex | RGB | Papel |
|---|---|---|---|
| Roxo Gota | `#5d3b97` | 93, 59, 151 | A cor da marca: eyebrows, ícones, destaques |
| Roxo Profundo | `#503484` | 80, 52, 132 | Títulos, capas, fundos escuros |
| Noite | `#291945` | 41, 25, 69 | Fundo mais grave |
| Lilás Névoa | `#dacbf9` | 218, 203, 249 | Realce sobre escuro, fundos suaves |
| Terracota | `#a24112` | 162, 65, 18 | Acento pontual em texto e selos |
| Terracota Clara | `#cd632d` | 205, 99, 45 | Acento sobre escuro, detalhes (nunca fundo grande) |

## Cores de apoio
| Nome | Hex | Uso |
|---|---|---|
| Roxo Claro | `#8961c7` | Realce, nunca atrás de texto branco |
| Lilás Claro | `#f3ecff` | Chips e fundos suaves |
| Papel | `#faf8fc` | Fundo das peças claras |
| Papel Fundo | `#f1eef6` | Fundo afundado |
| Tinta | `#211c2b` | Texto principal |
| Tinta Suave | `#54505f` | Texto de apoio |
| Tinta Apagada | `#5f5b68` | Eyebrows e rótulos |
| Linha | `#dfdce6` | Filetes e bordas |

## Tipografia
| Papel | Família | Pesos | Onde usar |
|---|---|---|---|
| Títulos | Petrona | 500–700, itálico | Títulos, nome científico |
| Texto | Archivo | 400–700 | Corpo, rótulos, botões |
| Exceção (templates de nível 3) | Fraunces | 800 | Só frases, números e percentuais de destaque |

`<link>` no `BRAND.md › Tipografia`.

## Padrões gráficos
Não há padrão repetido. Há elementos gráficos (rule-mark, gota no canto, marcador de círculos, cartão branco com sombra violeta, selo terracota, gota-foto), documentados no manual.

## Fotografia
Fotos da chácara (plantas, solo vermelho, alambique), frasco âmbar sobre superfícies naturais, luz do dia, com respiro. Scrim `rgba(41,25,69,.35)` sob texto. **(a validar com o cliente)**

## Ícones
Lucide, traço 2, `currentColor` em Roxo Gota ou Terracota.

## Aplicações
Posts do Instagram (post-12, post-13 e post-14). Sem peças físicas conhecidas **(a validar)**.

## Páginas do manual
14 páginas: Capa, Essência, Público, Tom de voz, Logotipo, Combinações aprovadas, Espaço e tamanho, Usos incorretos, Paleta principal, Cores de apoio, Tipografia, Elementos gráficos, Fotografia, Aplicação.
- **Elementos gráficos** entrou no lugar de "Padrões": a marca não tem padrão repetido, mas tem sinais que se repetem nos posts.
- **Fotografia** entrou: a chácara e o frasco são a imagem da marca.
- **Ícones** foram incluídos na página de Elementos gráficos.
- Ficaram de fora: Redes sociais (o avatar está em `assets/logos/`), Materiais impressos (sem peças físicas conhecidas), Valores e missão, Concorrência.

## Histórico
- v1 · 2026-10-20 · primeira versão, montada só com o que o repositório tem (sem briefing do cliente). Logo vetorizado do PNG.
