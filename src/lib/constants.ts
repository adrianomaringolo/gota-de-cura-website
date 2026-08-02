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
  { value: ORDER_STATUS.SEPARADO, label: 'Separado/enviado' },
  { value: ORDER_STATUS.EM_FINALIZACAO, label: 'Em finalização' },
  { value: ORDER_STATUS.FINALIZADO, label: 'Finalizado' },
  { value: ORDER_STATUS.CANCELADO, label: 'Cancelado' },
]

export const CROMATOGRAFIA_LABELS: Record<string, string> = {
  'oleo-essencial': 'Óleos essenciais',
  hidrolato: 'Hidrolatos',
}
