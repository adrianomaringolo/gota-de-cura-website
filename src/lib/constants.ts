export const VISIT_PRICES = {
  ADULT: 'R$ 140,00',
  CHILD: 'R$ 50,00',
  FREE: 'isento',
} as const

export const VISIT_PRICES_NUMERIC = {
  ADULT: 140,
  CHILD: 50,
  FREE: 0,
} as const

export const ORDER_STATUS = {
  EM_ESPERA: 'em-espera',
  EM_ANDAMENTO: 'em-andamento',
  APROVADO: 'aprovado',
  PAGO: 'pago',
  PREPARADO: 'preparado',
  SEPARADO: 'separado-enviado',
  EM_FINALIZACAO: 'em-finalizacao',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: ORDER_STATUS.EM_ESPERA, label: 'Em espera' },
  { value: ORDER_STATUS.EM_ANDAMENTO, label: 'Em andamento' },
  { value: ORDER_STATUS.APROVADO, label: 'Aprovado' },
  { value: ORDER_STATUS.PAGO, label: 'Pago' },
  { value: ORDER_STATUS.PREPARADO, label: 'Preparado' },
  { value: ORDER_STATUS.SEPARADO, label: 'Separado/enviado' },
  { value: ORDER_STATUS.EM_FINALIZACAO, label: 'Em finalização' },
  { value: ORDER_STATUS.FINALIZADO, label: 'Finalizado' },
  { value: ORDER_STATUS.CANCELADO, label: 'Cancelado' },
]

/** What each status means for the team, shown under the status picker. */
export const ORDER_STATUS_DESCRIPTIONS: Record<string, string> = {
  [ORDER_STATUS.EM_ESPERA]:
    'Pedido recebido pelo site. Ainda ninguém falou com o cliente.',
  [ORDER_STATUS.EM_ANDAMENTO]:
    'Um voluntário já entrou em contato e está combinando os detalhes com o cliente.',
  [ORDER_STATUS.APROVADO]:
    'Disponibilidade dos produtos, entrega e valores confirmados com o cliente. Falta o pagamento.',
  [ORDER_STATUS.PAGO]: 'Pagamento recebido. O pedido já pode ser separado.',
  [ORDER_STATUS.PREPARADO]:
    'Pacote pronto para envio: produtos conferidos e embalados, só falta despachar ou entregar ao cliente.',
  [ORDER_STATUS.SEPARADO]:
    'Produtos separados e embalados, prontos para retirada ou já enviados ao cliente.',
  [ORDER_STATUS.EM_FINALIZACAO]:
    'Entrega feita ou retirada combinada; só falta confirmar que o cliente recebeu tudo certo.',
  [ORDER_STATUS.FINALIZADO]:
    'Pedido concluído. Cliente atendido e nada pendente. Para finalizar, a entrega precisa estar confirmada.',
  [ORDER_STATUS.CANCELADO]:
    'Pedido encerrado sem ser atendido (desistência, falta de produto ou sem retorno do cliente).',
}

/** What a customer who ordered in English reads for each status. */
export const ORDER_STATUS_LABELS_EN: Record<string, string> = {
  [ORDER_STATUS.EM_ESPERA]: 'Waiting',
  [ORDER_STATUS.EM_ANDAMENTO]: 'In progress',
  [ORDER_STATUS.APROVADO]: 'Approved',
  [ORDER_STATUS.PAGO]: 'Paid',
  [ORDER_STATUS.PREPARADO]: 'Ready to ship',
  [ORDER_STATUS.SEPARADO]: 'Packed/shipped',
  [ORDER_STATUS.EM_FINALIZACAO]: 'Being finalized',
  [ORDER_STATUS.FINALIZADO]: 'Completed',
  [ORDER_STATUS.CANCELADO]: 'Canceled',
}

/** A status label in `locale`, falling back to the raw value for unknown ones. */
export const orderStatusLabel = (status: string, locale = 'pt-BR'): string =>
  (locale === 'en'
    ? ORDER_STATUS_LABELS_EN[status]
    : ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label) ?? status

export const CROMATOGRAFIA_LABELS: Record<string, string> = {
  'oleo-essencial': 'Óleos essenciais',
  hidrolato: 'Hidrolatos',
}
