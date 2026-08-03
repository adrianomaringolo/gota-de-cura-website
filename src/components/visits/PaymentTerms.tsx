import { VISIT_PRICES } from '@/lib/constants'

export const paymentTerms = [
  {
    title: 'Antes do dia',
    items: [
      'A programação começa pontualmente às 8h e termina às 12h.',
      'O deslocamento é por conta de cada participante. Depois que o grupo fecha, enviamos as orientações de chegada.',
      `Valores: ${VISIT_PRICES.ADULT} acima de 15 anos, ${VISIT_PRICES.CHILD} de 8 a 14 anos, ${VISIT_PRICES.FREE} até 7 anos.`,
    ],
  },
  {
    title: 'Pagamento',
    items: [
      'O pagamento é combinado diretamente com a equipe Gota de Cura.',
      'A vaga só é garantida após a confirmação e o pagamento da taxa.',
    ],
  },
  {
    title: 'Desistência e reembolso',
    items: [
      'Até 14 dias antes: reembolso de 50% do valor por transferência bancária.',
      'Até 7 dias antes: reembolso de 50% em vale-presente para o site ou a loja (frete não incluso).',
      'Com menos de 7 dias: não há reembolso, reserva para datas futuras nem troca por produtos.',
    ],
  },
]

export function PaymentTerms() {
  return (
    <div className="space-y-6">
      {paymentTerms.map((block) => (
        <section key={block.title}>
          <h3 className="font-display text-lg font-semibold text-ink">{block.title}</h3>
          <ul className="mt-2 space-y-1.5">
            {block.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-base text-ink-soft">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-terra"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
