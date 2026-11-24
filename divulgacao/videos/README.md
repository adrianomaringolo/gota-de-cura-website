# Vídeos de divulgação

Organizados por formato e depois por vídeo. Aqui ficam os **renders finais**; o git não guarda os MP4 (são gerados).

| Pasta | Vídeo | Fonte (para renderizar de novo) |
|---|---|---|
| `16x9/tv-loja-linhas/` | Linhas de produtos, em loop na TV da loja | a própria pasta (`render.mjs`) |
| `16x9/gotinha-de-cura/` | Produtos da linha Gotinha de Cura (dados e fotos do Firebase) | a própria pasta (`buscar-produtos.mjs`, `render.mjs`) |
| `16x9/medicina-tradicional-chinesa/` | Produtos de Medicina Tradicional Chinesa (baseado no story-01) | a própria pasta (`render.mjs`) |
| `16x9/visitas-2027/` | Datas das visitas de 2027 (do Firebase, sem valores) | a própria pasta (`buscar-visitas.mjs`, `render.mjs`) |
| `16x9/institucional-9-anos/` | Institucional dos 9 anos, horizontal | `instagram-reels/institucional/` |
| `9x16/institucional-9-anos/` | Institucional dos 9 anos, vertical | `instagram-reels/institucional-vertical/` |
| `9x16/reel-9-anos/` | Reel dos 9 anos | `instagram-reels/reel-01/` |
| `9x16/reel-9-anos-depoimento/` | Reel dos 9 anos com depoimento | `instagram-reels/reel-02-9anos-audio/` |

Os reels e stories da galeria (`instagram-reels/output/reel-0X`, `story-0X`) ficam onde estão: a galeria do `/instagram-post` lê de lá.
Os fontes dos vídeos acima continuam em `instagram-reels/`: os scripts deles dependem do Playwright e da trilha dessa pasta.
