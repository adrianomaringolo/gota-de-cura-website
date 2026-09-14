/**
 * Rotina de pedidos parados.
 *
 * Varre a coleção `orders`, encontra os pedidos abertos que estão há
 * STALE_AFTER_DAYS dias (ou mais) sem mudança de status — olhando o
 * `statusLogs` — e avisa por e-mail quem mexeu no status por último (ou a
 * lista da equipe, se não der para identificar). Reavisa a cada novo bloco de
 * STALE_AFTER_DAYS dias enquanto o pedido continuar parado; a mudança de
 * status zera a contagem.
 *
 * Roda no GitHub Actions (.github/workflows/pedidos-parados.yml) uma vez por
 * dia. Localmente:
 *
 *   pnpm notify:pedidos-parados            # envia de verdade (precisa da private key)
 *   DRY_RUN=1 pnpm notify:pedidos-parados  # só imprime o que faria
 */
import {
  buildStaleOrderEmail,
  collectStaleOrders,
  loadTeamDirectory,
  markNotified,
  pickRecipients,
} from '@/services/stale-orders'
import { orderMailList } from '@/services/maillist'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

/** Trata "" (secret não definido no GitHub Actions) como ausente. */
const env = (name: string, fallback = ''): string => process.env[name]?.trim() || fallback

// Mesmos padrões do site (src/services/email.ts) — só precisam ser
// sobrescritos para trocar de conta EmailJS.
const EMAILJS_SERVICE_ID = env('EMAILJS_SERVICE_ID', 'service_nbvmzkk')
const EMAILJS_TEMPLATE_ID = env('EMAILJS_TEMPLATE_ID', 'gota-de-cura-email')
const EMAILJS_PUBLIC_KEY = env('EMAILJS_PUBLIC_KEY', 'nkdbOud2NdTKI7vBK')
const EMAILJS_PRIVATE_KEY = env('EMAILJS_PRIVATE_KEY')

const dryRun = ['1', 'true'].includes(env('DRY_RUN'))

async function sendEmail(to: string[], title: string, html: string): Promise<void> {
  if (dryRun) {
    console.log(`  [dry-run] enviaria para ${to.join(', ')}`)
    return
  }
  if (!EMAILJS_PRIVATE_KEY) {
    throw new Error(
      'EMAILJS_PRIVATE_KEY não definido — obrigatório para o EmailJS aceitar chamadas fora do browser.',
    )
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { title, html_message: html, mail_list: to.join(',') },
    }),
  })

  if (!response.ok) {
    throw new Error(`EmailJS respondeu ${response.status}: ${await response.text()}`)
  }
}

async function main(): Promise<void> {
  const now = new Date()
  const stale = await collectStaleOrders(now)

  if (stale.length === 0) {
    console.log('Nenhum pedido parado. 🎉')
    return
  }

  console.log(`${stale.length} pedido(s) parado(s):`)
  const directory = await loadTeamDirectory()

  let sent = 0
  let failed = 0

  for (const entry of stale) {
    const { to, usedFallback } = pickRecipients(
      entry.responsibleName,
      directory,
      orderMailList,
    )
    const { title, html } = buildStaleOrderEmail(entry)

    console.log(
      `- #${entry.order.orderId} · ${entry.statusLabel} · ${entry.daysStale}d parado` +
        ` · ${usedFallback ? 'equipe' : entry.responsibleName}`,
    )

    try {
      await sendEmail(to, title, html)
      if (!dryRun) await markNotified(entry, now)
      sent += 1
    } catch (error) {
      failed += 1
      console.error(`  falha ao avisar #${entry.order.orderId}:`, error)
    }
  }

  console.log(`\n${sent} aviso(s) enviado(s)${failed ? `, ${failed} com falha` : ''}.`)
  if (failed > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  // O SDK do Firestore mantém conexões abertas e seguraria o processo.
  .finally(() => process.exit(process.exitCode ?? 0))
