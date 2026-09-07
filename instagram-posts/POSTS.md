# Posts do Instagram — @gotadecura_artesanais

> Índice de todos os posts criados. **Atualize este arquivo sempre que criar, publicar ou arquivar um post.**
>
> Última atualização: 2026-09-06

Legenda de status: 🟢 publicado · 🟡 pronto para publicar · 🔵 em produção / revisão · ⚪️ rascunho

| ID | Título | Data | Tipo | Slides | Status | Tema |
|---|---|---|---|---|---|---|
| post-01 | Óleo essencial ou hidrolato: qual a diferença | 2026-08-30 | Carrossel | 6 | 🔵 | Educativo — adaptação do 2º post do blog: mesma destilação, dois resultados, usos e segurança |
| post-02 | Óleo essencial ou hidrolato: qual a diferença (e quando usar cada um) | 2026-08-30 | Único | 1 | 🟢 | Chamada para o post do blog, com o título do próprio post e CTA em destaque para gotadecura.com.br/blog |
| post-03 | O que tem dentro do frasco, por escrito — as cromatografias | 2026-09-06 | Único | 1 | 🟢 | Dado / confiança — o que é cromatografia e por que publicamos o laudo inteiro de cada planta, com CTA em destaque para gotadecura.com.br/cromatografias |
| post-04 | Hidrolato para bebês, gestantes e idosos: quando ele é a escolha mais segura | 2026-09-06 | Único | 1 | 🔵 | Chamada para o post do blog, com o título do próprio post e CTA em destaque para gotadecura.com.br/blog |
| post-05 | Hidrolato para bebês, gestantes e idosos: quando ele é a escolha mais segura | 2026-09-06 | Carrossel | 6 | 🔵 | Educativo — adaptação do 3º post do blog: por que o óleo essencial pede cautela em cada grupo, onde o hidrolato muda a conta, caso a caso, cuidados de conservação e fecho com CTA |

> Todos os posts usam **1080×1350** (formato padrão do feed).

---

## Detalhes por post

### post-01 — Óleo essencial ou hidrolato: qual a diferença

- **Fonte:** post do blog `src/content/blog/2026-08-19-oleos-essenciais-e-hidrolatos-diferencas`.
- **Slides:**
  1. Capa — foto do funil de separação com a faixa dourada de óleo essencial sobre o hidrolato (`cover.jpg`), "Óleo essencial ou hidrolato?"
  2. Diagrama — os dois nascem juntos na destilação; óleo leva as substâncias lipossolúveis, hidrolato as hidrossolúveis
  3. Dois resultados — 60 kg de planta rendem ~500 ml de óleo e ~8 litros de hidrolato
  4. Quando usar cada um — duas colunas de formas de uso
  5. Segurança — óleo puro não vai na pele; hidrolato é água e estraga
  6. Fecho — conhecer o básico antes de usar óleo essencial e hidrolato, CTA para `gotadecura.com.br/blog` e Morada (slide escuro)
- **Legenda e hashtags:** em `meta.json` e no `output/post-01/caption.md` gerado.
- **Status:** 🔵 aguardando revisão antes de publicar.

### post-02 — Chamada para o post do blog

- **Fonte:** mesmo post do blog (`2026-08-19-oleos-essenciais-e-hidrolatos-diferencas`).
- **Slide único** 1080×1350: foto do funil de separação sobre a lavanda, selo "Novo no blog", **título igual ao do post do blog**, botão de CTA em destaque para `gotadecura.com.br/blog`. Handle no topo (o CTA ocupa o rodapé).
- **Legenda e hashtags:** em `meta.json` e no `output/post-02/caption.md`.
- **Status:** 🟢 publicado em 2026-09-06.

### post-03 — As cromatografias

- **Fonte:** página `/cromatografias` do site e a faixa `LaudosBand` da home.
- **Slide único** 1080×1350, fundo lilás escuro (`#503484`) com faixa de foto de um amostrador de cromatógrafo gasoso (`cover.jpg`, foto do Pexels de Yuri Shkoda) ocupando ~30% da largura à direita, tratada em **duotone lilás/terracota** (blend `lighten`/`darken`) com fade para o roxo. Texto no restante: logo grande no topo (sem handle), ícone de frasco em traço, título "O que tem dentro do frasco, *por escrito*" — "por escrito" em Petrona itálico com sublinhado terracota. Explicação em linguagem de leigo do que é cromatografia e de que publicamos o laudo inteiro de cada óleo essencial e hidrolato. CTA em destaque para `gotadecura.com.br/cromatografias`.
- **Legenda e hashtags:** em `meta.json` e no `output/post-03/caption.md`.
- **Status:** 🟢 publicado em 2026-09-06.

### post-04 — Chamada para o post do blog (hidrolato para bebês, gestantes e idosos)

- **Fonte:** post do blog `src/content/blog/2026-09-06-hidrolato-para-bebes-gestantes-e-idosos`.
- **Slide único** 1080×1350: foto de alguém borrifando hidrolato no ambiente na luz da manhã (`cover.jpg`), selo "Novo no blog", **título igual ao do post do blog** (com a segunda parte em Petrona itálico), botão de CTA em destaque para `gotadecura.com.br/blog`.
- **Legenda e hashtags:** em `meta.json` e no `output/post-04/caption.md`.
- **Status:** 🔵 aguardando revisão antes de publicar.

### post-05 — Hidrolato para bebês, gestantes e idosos (carrossel)

- **Fonte:** mesmo post do blog (`2026-09-06-hidrolato-para-bebes-gestantes-e-idosos`).
- **Slides:**
  1. Capa — foto (duotone lilás/terracota) de alguém borrifando hidrolato no ambiente, "quando o óleo essencial pede recuo"
  2. Por que o óleo essencial pede cautela — bebês e crianças, gestantes e lactantes, idosos, pele sensível
  3. Onde o hidrolato muda a conta — mesma destilação, fração que se dissolve em água: mais diluído, pH próximo ao da pele, pode usar sem diluir
  4. Caso a caso — grade 2×2 de usos por grupo
  5. Cuidados que continuam valendo — geladeira e frasco spray, um produto de cada vez, longe de olhos e mucosas; hidrolato não é remédio
  6. Fecho — "a conversa com quem cuida do caso vem antes", `gotadecura.com.br/blog`, cromatografias e Morada (slide escuro)
- **Legenda e hashtags:** em `meta.json` e no `output/post-05/caption.md`.
- **Status:** 🔵 aguardando revisão antes de publicar.

---

## Como funciona

- Slides HTML versionados em `html/post-NN/` com um `meta.json`.
- `_template/` tem um slide de referência com o sistema visual da marca.
- Nos **carrosseis**, os slides intermediários levam só a marca (a gota, `mark.png`) num canto; capa e fecho levam o lockup completo.
- Exportar: `node scripts/export.mjs post-NN` (PNGs + `caption.md` em `output/`, que é gitignore).
- A skill `/instagram-post` cuida de todo o fluxo. Ver `.claude/skills/instagram-post/SKILL.md`.
