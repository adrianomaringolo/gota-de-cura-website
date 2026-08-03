import { formatCurrency, toAmount } from './format-check.mjs'

// The exact shapes found in Firestore: 5 products, 369 order line items,
// 6 coupons — plus the pt-BR hand-typed case and genuine junk.
const cases = [
  ['40', 'produto KIT-1 / cupom ALECRIM-40'],
  ['22', 'produto TIN-AGR'],
  ['26.5', 'item de pedido'],
  ['32.5', 'item de pedido'],
  [34, 'valor já numérico'],
  [0, 'zero legítimo'],
  ['39,90', 'digitado em pt-BR (não existe hoje, mas quebraria igual)'],
  ['', 'string vazia'],
  ['abacaxi', 'lixo'],
  [undefined, 'campo ausente'],
  [null, 'null'],
  [NaN, 'NaN'],
]

const oldGuard = (v) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0)

console.log('valor recebido      | antes        | agora        | toAmount | caso')
console.log('-'.repeat(96))
for (const [value, note] of cases) {
  const before = oldGuard(value)
  const after = formatCurrency(value)
  const flag = before !== after ? ' <= corrigido' : ''
  console.log(
    `${JSON.stringify(value).padEnd(19)} | ${before.padEnd(12)} | ${after.padEnd(12)} | ${String(toAmount(value)).padEnd(8)} | ${note}${flag}`,
  )
}

// Aritmética: a soma já coincidia por coerção, o que é o que escondeu o bug.
const line = { price: '26.5', amount: 3 }
console.log(
  `\nsubtotal de linha  "26.5" x 3 -> ${line.price * line.amount} (coerção já acertava)`,
)
console.log(`unitário exibido   antes ${oldGuard(line.price)}  agora ${formatCurrency(line.price)}`)
console.log(
  `desconto fixo "40" antes ${oldGuard('40')}  agora ${formatCurrency(toAmount('40'))}`,
)
process.exit(0)
