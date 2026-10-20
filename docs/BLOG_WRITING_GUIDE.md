# Guia de escrita do blog da Gota de cura

Fonte de verdade para a skill `blog-post-writer`. Criado a partir dos posts publicados até 2026-10-04 e do banco de ideias em `ideias-blog-conaroma.md`.

## Voz

- Primeira pessoa do plural ("nós", "aqui na chácara"), calorosa e próxima, de quem conhece cada planta pelo nome. Nada corporativo, nada de "bem-estar performático".
- Linguagem de leigo, frases curtas, exemplos concretos do cotidiano. Abrir, de preferência, com uma cena real da chácara ou da destilaria.
- Prosa é o padrão. Bullets só para listas de uso, cuidados ou passos.
- Honestidade radical: separar uso tradicional e consagrado de alegação terapêutica. Nunca prometer cura ou tratamento.
- **Sem travessão (—) no texto.** Use vírgula, ponto ou dois-pontos. Verifique antes de fechar: `grep -c '—' src/content/blog/<pasta>/index*.md` deve dar 0.
- Sem aberturas e fechamentos genéricos ("Em um mundo cada vez mais...", "Em resumo", "espero que seja útil").

## Regra da marca: óleo essencial e hidrolato

- Nunca chamar o hidrolato de "sobra", "resíduo", "subproduto" ou "água que resta". No inglês: nada de "leftover", "by-product", "the water that remains".
- Os dois são resultados da mesma destilação: o óleo essencial leva as substâncias **lipossolúveis**, o hidrolato leva as **hidrossolúveis**.
- Rendimento de referência: ~60 kg de planta → ~500 ml de óleo essencial e ~8 L de hidrolato.

## Fecho obrigatório

Todo post termina com: consulte um profissional em caso de dúvida (principalmente gestantes, lactantes, crianças pequenas e doenças diagnosticadas) e, quando fizer sentido, link para `/cromatografias` (o que está no rótulo é o que tem no frasco).

## Links internos recorrentes

`/hidrolatos`, `/oleos-essenciais`, `/cromatografias`, `/diluicoes-oleos-essenciais`, `/visitas`, `/sobre`, `/videos`, e os posts anteriores em `/blog/<slug>`.

## Tipos de post

- **Prático / guia**: organizado por contexto de uso, com cuidados no final.
- **Perfil de planta**: origem, cromatografia, usos do óleo e do hidrolato, cuidados, fontes.
- **Conceito / educação**: explica um mecanismo (destilação, olfato) com honestidade sobre os limites.
- **Bastidor / marca**: história da destilação, transparência.

## Arquivos e frontmatter

Pasta: `src/content/blog/AAAA-MM-DD-slug/` com `index.md` (pt-BR, original) e `index.en.md` (en-US). Post sem tradução cai no pt-BR (ver README).

```yaml
---
title: ''
excerpt: ''
author: 'Equipe Gota de cura'   # en: 'The Gota de Cura team'
publishedAt: 'AAAA-MM-DD'
tags: []                         # no en-US, tags em inglês
featured: false
image: '/images/blog/<slug-sem-data>/hero.jpg'   # sempre raster
tldr:
  - ''                           # escrito por último, 4 a 6 itens
---
```

O en-US não é tradução literal: mesma estrutura, mesmos headings (traduzidos), mesmas imagens e ordem, frases naturais em inglês.

## Imagens

- Pasta: `public/images/blog/<slug-sem-data>/`.
- Fotos do Pexels via skill `pexels-search`: **hero 1200×500**, **inline 800×450**. Preferir fotos de frascos âmbar com spray, plantas, mãos e ambientes reais.
- `alt` descritivo da cena, nunca genérico. No en-US, alt em inglês.
- Referência no corpo: `![alt](/images/blog/<slug>/<arquivo>.jpg)`.
- Fotos de produto da Gota de cura (frascos de 10 ml e 120 ml) existem nas pastas dos posts anteriores e podem ser reaproveitadas.

## Segurança e cuidados (checklist)

- Óleo essencial: sempre diluído (regra de 1 gota / 5 ml, ~1%), nunca ingerir, cuidado com cítricos (fotossensibilidade), animais de estimação.
- Hidrolato: é água e estraga. Geladeira, frasco spray (não molhar o dedo), longe da luz, descartar se turvar ou mudar o cheiro.
- Uso interno de hidrolato: só com água de procedência conhecida e orientação profissional.
- Olhos, ouvidos e mucosas: evitar.

## Fecho do ciclo

Marcar o item no `ideias-blog-conaroma.md` e sugerir rodar o dev server para revisão visual das duas versões (`/blog/<slug>` e `/en/blog/<slug>`).
