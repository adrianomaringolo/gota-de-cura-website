#!/usr/bin/env node
/** Lê no Firestore as visitas de 2027 (só leitura) e grava visitas.json e visitas.js (só as datas; o valor não entra no vídeo, para ele não perder a validade). Sem inscrições: só data e valor. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const db = getFirestore(initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCevSBZ4T8wX_pk_Ki2nIZgZqouzGJnN1Y',
  projectId: 'gota-de-luz', appId: '1:215101370709:web:faa188fe2172084037bfdc',
}))
const all = (await getDocs(query(collection(db, 'visits'), orderBy('date')))).docs.map((d) => d.data())
const visits = all.filter((v) => String(v.date).startsWith('2027')).map(({ date, value }) => ({ date, value }))
fs.writeFileSync(path.join(HERE, 'visitas.json'), JSON.stringify(visits, null, 2))
fs.writeFileSync(path.join(HERE, 'visitas.js'), `window.VISITAS = ${JSON.stringify(visits.map((v) => v.date))}\n`)
console.log(`${all.length} visitas no total, ${visits.length} em 2027`)
for (const v of visits) console.log(v.date, v.value)
process.exit(0)
