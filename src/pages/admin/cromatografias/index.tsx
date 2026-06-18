import AdminLayout from 'components/admin/AdminLayout'
import { CromatografiaModal } from 'components/admin/CromatografiaModal'
import { Cromatografia } from 'interfaces/cromatografias'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CromatografiasService } from 'services/CromatografiasService'

const TYPE_LABELS: Record<string, string> = {
  'oleo-essencial': 'Óleo essencial',
  hidrolato: 'Hidrolato',
}

const AdminCromatografias = () => {
  const [items, setItems] = useState<Cromatografia[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cromatografia | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadItems = async () => {
    const data = await CromatografiasService.getAll()
    setItems(data)
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleEdit = (item: Cromatografia) => {
    setEditing(item)
    setShowModal(true)
  }

  const handleNew = () => {
    setEditing(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão desta cromatografia?')) return
    setDeleting(id)
    try {
      await CromatografiasService.remove(id)
      toast.success('Cromatografia removida.')
      loadItems()
    } catch {
      toast.error('Erro ao remover.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mb-7 pb-4 border-b items-center">
        <h1 className="text-4xl font-semibold">Cromatografias</h1>
        <button className="button is-primary" onClick={handleNew}>
          + Nova cromatografia
        </button>
      </div>

      {items.length === 0 ? (
        <p className="has-text-grey">Nenhuma cromatografia cadastrada.</p>
      ) : (
        <table className="table is-bordered is-striped is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nome científico</th>
              <th>Tipo</th>
              <th>URL</th>
              <th className="has-text-centered">Visualizações</th>
              <th className="has-text-centered">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <i>{item.scientificName}</i>
                </td>
                <td>
                  <span
                    className={`tag ${
                      item.type === 'oleo-essencial' ? 'is-warning' : 'is-info'
                    }`}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                </td>
                <td>
                  <a href={item.url} target="_blank" rel="noreferrer" className="is-size-7">
                    Ver PDF
                  </a>
                </td>
                <td className="has-text-centered">
                  {item.viewCount ?? 0}
                </td>
                <td className="has-text-centered">
                  <div className="buttons is-centered">
                    <button
                      className="button is-small is-info is-light"
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className={`button is-small is-danger is-light ${
                        deleting === item.id ? 'is-loading' : ''
                      }`}
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CromatografiaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSaved={loadItems}
        editing={editing}
      />
    </AdminLayout>
  )
}

export default AdminCromatografias
