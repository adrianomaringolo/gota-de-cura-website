# Assets compartilhados dos posts

Arquivos reutilizáveis entre posts. Os slides apontam para eles por path relativo
(`../../assets/...` a partir de `html/post-NN/`; `../../../assets/...` a partir de
`templates/previews/<id>/`). Não copie para a pasta do post.

Posts anteriores ao `post-13` guardam cópias próprias de `logo.png` e `mark.png`, e os
previews antigos usam `templates/previews/_assets/`. Eles continuam funcionando e não foram
migrados.

| Arquivo | O que é | Quando usar | Notas de uso |
|---|---|---|---|
| `logos/logo.png` | Lockup completo (gota + "gota de cura" + "Cuidando com amor", 1641×535) | Capa, fecho e post único | Fixe só a largura (300px na capa). Em fundo escuro: `filter: brightness(0) invert(1)` |
| `logos/mark.png` | Só a gota | Canto dos slides de conteúdo do carrossel | 52px de largura. Sobre foto escura: `filter: brightness(0) invert(1)` |
| `images/flag-br.svg` | Bandeira do Brasil simplificada (proporção 20×14, sem faixa e estrelas) | Português / Brasil, em posts sobre idioma | Cores reais fixas: vai por `<img>`. Cantos arredondados no container |
| `images/flag-us.svg` | Bandeira dos EUA simplificada (proporção 19×10, sem estrelas) | Inglês, em posts sobre idioma (o site usa inglês americano) | Cores reais fixas: vai por `<img>`. Cantos arredondados no container |
