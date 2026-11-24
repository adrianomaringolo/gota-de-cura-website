#!/usr/bin/env node
/**
 * Lê no Firestore os produtos da linha Gotinha de Cura (a mesma consulta do site:
 * categories array-contains 'Gotinha de Cura' OU type == 'Gotinha de Cura'), grava produtos.json
 * e baixa a foto principal de cada um para assets/produtos/. Só leitura.
 *   node divulgacao/videos/16x9/gotinha-de-cura/buscar-produtos.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore, or, query, where } from 'firebase/firestore'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCevSBZ4T8wX_pk_Ki2nIZgZqouzGJnN1Y',
  authDomain: 'gota-de-luz.firebaseapp.com',
  projectId: 'gota-de-luz',
  storageBucket: 'gota-de-luz.appspot.com',
  appId: '1:215101370709:web:faa188fe2172084037bfdc',
})
const db = getFirestore(app)
const snap = await getDocs(query(collection(db, 'products'),
  or(where('categories', 'array-contains', 'Gotinha de Cura'), where('type', '==', 'Gotinha de Cura'))))
const products = snap.docs.map((d) => d.data())
fs.writeFileSync(path.join(HERE, 'produtos.json'), JSON.stringify(products, null, 2))

fs.mkdirSync(path.join(HERE, 'assets/produtos'), { recursive: true })
for (const p of products) {
  const url = p.images?.[0] ?? p.image
  if (!url) { console.log('sem foto:', p.name); continue }
  const res = await fetch(url)
  const ext = (res.headers.get('content-type') || '').split('/')[1]?.split(';')[0] || 'jpg'
  fs.writeFileSync(path.join(HERE, 'assets/produtos', `${p.id}.${ext}`), Buffer.from(await res.arrayBuffer()))
}
console.log(`${products.length} produtos`)
for (const p of products) console.log(`- ${p.name} | R$ ${p.price} | hidden=${p.hidden ?? false} available=${p.available ?? true} | ${(p.images?.length ?? 1)} foto(s)`)
process.exit(0)
