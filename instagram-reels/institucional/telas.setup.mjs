// Login e dados da captura. Opcional: apague se o app abre sem conta.
// Nenhum dado real nas imagens: conta fictícia, espaço de demonstração ou API interceptada.
// Receitas prontas (cookie de sessão, Supabase em memória, relógio no servidor):
// reference/telas.md da skill video-produto.

/** Chamado uma vez por aparelho ("m" celular, "d" computador), antes das telas. */
export async function preparar(context, page, { aparelho, base }) {
  // await context.addCookies([{ name: 'session', value: '…', url: base }]);
  // await page.route('https://api.exemplo.com/**', (route) => route.fulfill({ json: [] }));
}
