import { OrderDetail } from '@/components/admin/OrderDetail'

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetail orderId={id} />
}
