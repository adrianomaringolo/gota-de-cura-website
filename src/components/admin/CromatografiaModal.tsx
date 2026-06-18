import React, { useEffect } from 'react'
import SweetAlert from 'react-bootstrap-sweetalert'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Cromatografia, CromatografiaType } from 'interfaces/cromatografias'
import { CromatografiasService } from 'services/CromatografiasService'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editing?: Cromatografia | null
}

type FormData = {
  name: string
  scientificName: string
  url: string
  type: CromatografiaType
}

const TYPE_LABELS: Record<CromatografiaType, string> = {
  'oleo-essencial': 'Óleo essencial',
  hidrolato: 'Hidrolato',
}

export const CromatografiaModal = ({ isOpen, onClose, onSaved, editing }: Props) => {
  const { register, handleSubmit, formState, reset } = useForm<FormData>()

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        scientificName: editing.scientificName,
        url: editing.url,
        type: editing.type,
      })
    } else {
      reset({ name: '', scientificName: '', url: '', type: 'oleo-essencial' })
    }
  }, [editing, isOpen])

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await CromatografiasService.update(editing.id, data)
        toast.success('Cromatografia atualizada!')
      } else {
        await CromatografiasService.save(data)
        toast.success('Cromatografia cadastrada!')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    }
  }

  return (
    <SweetAlert
      show={isOpen}
      showConfirm={false}
      showCancel={false}
      title={editing ? 'Editar Cromatografia' : 'Nova Cromatografia'}
      onConfirm={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 text-left">
          <div>
            <label className="label">Nome</label>
            <input
              type="text"
              placeholder="Ex: Lavanda - Óleo essencial"
              className="input"
              {...register('name', { required: true })}
            />
          </div>
          <div>
            <label className="label">Nome científico</label>
            <input
              type="text"
              placeholder="Ex: Lavandula angustifolia"
              className="input"
              {...register('scientificName', { required: true })}
            />
          </div>
          <div>
            <label className="label">URL do relatório (PDF)</label>
            <input
              type="url"
              placeholder="https://..."
              className="input"
              {...register('url', { required: true })}
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <div className="select is-fullwidth">
              <select {...register('type', { required: true })}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <button type="button" className="button is-light" onClick={onClose}>
            Fechar
          </button>
          <button
            type="submit"
            className="button is-primary"
            disabled={!formState.isValid || formState.isSubmitting}
          >
            {formState.isSubmitting ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </SweetAlert>
  )
}
