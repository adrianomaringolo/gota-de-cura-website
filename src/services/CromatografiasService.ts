import { Cromatografia } from 'interfaces/cromatografias'
import firebase, { db } from 'utils/firebase'

const cromatografiasRef = db.collection('cromatografias')

const getAll = async (): Promise<Cromatografia[]> => {
  const snapshot = await cromatografiasRef.orderBy('name').get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Cromatografia))
}

const save = async (cromatografia: Omit<Cromatografia, 'id'>): Promise<void> => {
  await cromatografiasRef.add({ ...cromatografia, createdAt: new Date().toISOString() })
}

const update = async (id: string, cromatografia: Omit<Cromatografia, 'id'>): Promise<void> => {
  await cromatografiasRef.doc(id).update({ ...cromatografia })
}

const remove = async (id: string): Promise<void> => {
  await cromatografiasRef.doc(id).delete()
}

const incrementViewCount = async (id: string): Promise<void> => {
  await cromatografiasRef.doc(id).update({
    viewCount: firebase.firestore.FieldValue.increment(1),
  })
}

export const CromatografiasService = {
  getAll,
  save,
  update,
  remove,
  incrementViewCount,
}
