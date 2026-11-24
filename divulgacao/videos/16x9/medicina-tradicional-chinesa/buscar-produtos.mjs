#!/usr/bin/env node
/**
 * Lê no Firestore os produtos da linha Medicina Tradicional Chinesa (a mesma consulta do site:
 * categories array-contains 'Medicina Tradicional Chinesa' OU type == 'Medicina Tradicional Chinesa'), grava produtos.json
 * (as fotos usadas no vídeo são os recortes do story-01). Só leitura.
 *   node divulgacao/videos/16x9/medicina-tradicional-chinesa/buscar-produtos.mjs
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
  or(where('categories', 'array-contains', 'Medicina Tradicional Chinesa'), where('type', '==', 'Medicina Tradicional Chinesa'))))
const products = snap.docs.map((d) => d.data())
fs.writeFileSync(path.join(HERE, 'produtos.json'), JSON.stringify(products, null, 2))

/* fotos: assets/ vem do instagram-reels/html/story-01/fotos (recortes) */
console.log(`${products.length} produtos`)
for (const p of products) console.log(`- ${p.name} | R$ ${p.price} | hidden=${p.hidden ?? false} available=${p.available ?? true} | ${(p.images?.length ?? 1)} foto(s)`)
process.exit(0)
