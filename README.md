# Gota de Cura

Catálogo virtual da Gota de Cura — óleos essenciais, hidrolatos e produtos
artesanais destilados na Chácara da Mãe Luzia. Toda a renda sustenta os
trabalhos assistenciais da Morada Espírita Prof. Lairi Hans.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Firebase
(Firestore) · deploy na Vercel.

## Rodando localmente

```bash
pnpm install
pnpm dev           # http://localhost:3000
pnpm build         # build de produção
pnpm type-check    # tsc --noEmit
```

Node 20.9+ e pnpm são necessários. A versão do pnpm está fixada no campo
`packageManager` do `package.json` — com o Corepack habilitado
(`corepack enable`), o pnpm certo é usado automaticamente.

As variáveis de ambiente são todas opcionais — veja `.env.example`. Sem elas o
projeto usa os mesmos valores do ambiente de produção atual.

## Como o projeto está organizado

```
src/
  app/
    (site)/        páginas públicas (home, catálogo, carrinho, visitas, …)
    admin/         painel da equipe, protegido no cliente
    globals.css    tokens de design (@theme) e estilos base
  components/
    site/          casca do site: cabeçalho, rodapé, seções
    home/          faixas da página inicial
    products/      catálogo, cartões e diálogos de produto
    cart/          fluxo de pedido em três passos
    visits/        visitação: datas, galeria, inscrição
    cromatografias/ listagem de laudos
    admin/         casca e componentes do painel
    ui/            primitivos (Button, Field, Dialog, Feedback)
  lib/             tokens de domínio, tipos, formatação, hooks, carrinho
  services/        acesso ao Firestore e envio de e-mails
```

### Dados

Os **tipos de produto** (as prateleiras do catálogo) são estáticos em
`src/lib/product-types.ts`. Os **produtos**, **pedidos**, **visitas**,
**cupons**, **cromatografias**, **depoimentos** e **usuários** vêm do Firestore.

O **carrinho** vive no `localStorage` (chave `cart`) e é exposto pelo
`CartProvider` em `src/lib/cart-context.tsx`. Os preços são revalidados contra o
Firestore a cada carregamento.

### Design

O sistema visual está inteiro em `src/app/globals.css`, em OKLCH. A estratégia
de cor é *committed*: o violeta da marca é tinta — ele preenche o topo, a faixa
de laudos, a faixa da Morada e o rodapé — e o acento terracota vem da terra
vermelha das fotos da chácara. Tipografia: Petrona (títulos), Archivo (texto e
interface), Ample Soft Pro (assinatura) e Amarillo (o "Cuidando com amor" da
marca).

Fundamentos e princípios do produto estão em `PRODUCT.md`.

### SEO

`robots.txt`, `sitemap.xml` e o web manifest são rotas geradas em
`src/app/robots.ts`, `src/app/sitemap.ts` e `src/app/manifest.ts`. Os ícones
(favicon multi-tamanho, ícones do manifest e o ícone da Apple) são derivados de
`public/images/logos/logo-icon.png`; a imagem de compartilhamento padrão é
`public/images/og-default.jpg` (1200×630).

Os dados estruturados ficam em `src/lib/seo.ts` e são emitidos pelo componente
`JsonLd`. `Organization` e `WebSite` vêm do layout de `(site)`, então toda página
os carrega e as referências por `@id` resolvem; cada página acrescenta os seus
nós (`Store` na home, `Blog`, `BlogPosting`, `BreadcrumbList`).

Cada página pública declara seu próprio `alternates.canonical`. O `metadata` raiz
**não** declara canonical de propósito: metadata é herdado, e um canonical
definido lá faria toda página se declarar como a home.

**Limitação conhecida:** as páginas de produto (`/[type]/[productId]`) buscam o
produto no Firestore pelo cliente, então um crawler recebe o corpo vazio. O
`<head>` é montado a partir da prateleira e do slug da URL, o que dá título,
descrição e canonical reais — mas indexar preço, estoque e schema `Product`
depende de mover essa busca para o servidor.

## Painel da equipe

`/admin` — pedidos, disponibilidade de produtos, gerenciamento do catálogo,
visitas, cupons, cromatografias e relatórios. A autenticação é feita contra a
coleção `users` do Firestore e guardada no `localStorage`.

## Rotinas agendadas

### Pedidos parados

`scripts/notify-stale-orders.ts` varre os pedidos abertos e avisa por e-mail
quando um deles fica **2 dias ou mais sem mudança de status** (olhando o
`statusLogs`). O aviso vai para quem mexeu no status por último — buscando o
e-mail na coleção `users` pelo nome — ou, se não der para identificar, para a
lista da equipe (`orderMailList`). Enquanto o pedido seguir parado, reavisa a
cada novo bloco de 2 dias; a marcação fica no campo `staleNotify` do próprio
pedido e zera quando o status muda.

Roda no GitHub Actions (`.github/workflows/pedidos-parados.yml`) todo dia às
09h (São Paulo). Para funcionar, defina os secrets do repositório:

- `EMAILJS_PRIVATE_KEY` — **obrigatório**. Account → API keys no EmailJS.
  Habilite também "Allow EmailJS API for non-browser applications".
- Firebase / EmailJS: só se o projeto usar outra conta que não os padrões do
  código (veja `.env.example`).

Rodar na mão:

```bash
DRY_RUN=1 pnpm notify:pedidos-parados   # só lista, não envia
pnpm notify:pedidos-parados             # envia (precisa de EMAILJS_PRIVATE_KEY)
```
