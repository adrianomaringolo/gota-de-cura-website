/**
 * Primeira tradução dos produtos para o inglês.
 *
 * Gera um rascunho de `translations.en` (nome, descrição curta e descrição
 * detalhada) para cada produto do Firestore com a API do Claude. Funciona em
 * duas etapas, para que ninguém publique tradução sem revisar:
 *
 *   pnpm translate:produtos
 *     Lê os produtos que ainda não têm nome em inglês, traduz e grava tudo em
 *     scripts/out/products-en.json. Não escreve nada no Firestore.
 *     Opções: --all (retraduz todos), --only id1,id2 (só esses).
 *
 *   pnpm translate:produtos --apply scripts/out/products-en.json
 *     Depois de revisar e corrigir o arquivo, grava as traduções em
 *     `translations.en` de cada produto. Só esse campo é alterado.
 *
 * Precisa de credencial da API da Anthropic (ANTHROPIC_API_KEY, ou um perfil
 * do `ant auth login`). A revisão continua pelo painel, na aba "Inglês".
 */
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { doc, updateDoc } from 'firebase/firestore'
import { z } from 'zod'
import { db } from '@/lib/firebase'
import type { ProductItem, ProductTranslation } from '@/lib/types'
import { ProductsService } from '@/services/products'

const OUT_FILE = path.join(process.cwd(), 'scripts/out/products-en.json')
const MODEL = 'claude-opus-5-5'

type Draft = { id: string; type?: string; pt: ProductTranslation; en: ProductTranslation }

const Translation = z.object({
  name: z.string(),
  description: z.string(),
  detailedDescription: z.string(),
})

/**
 * Fixo de propósito: é o mesmo para todos os produtos, então fica em cache e
 * só o produto da vez é cobrado inteiro.
 */
const SYSTEM = `You translate product listings for Gota de Cura, a non-profit shop in Campinas, Brazil, run by volunteers. It sells essential oils, hydrosols and handmade products distilled at a small farm, Chácara da Mãe Luzia; all income supports the charitable work of Morada Espírita Prof. Lairi Hans. You translate from Brazilian Portuguese into natural US English for visitors to the shop's website.

Terminology:
- hidrolato → hydrosol; óleo essencial → essential oil; óleo vegetal → vegetable oil (carrier oil when it dilutes an essential oil); diluição → dilution; tintura → tincture; pomada → balm; sais de banho → bath salts; água de colônia → eau de cologne; escalda-pés → foot soak; melaleuca → tea tree; TCM stays TCM (the carrier oil), MTC → TCM (Traditional Chinese Medicine).
- The essential oil and the hydrosol are two results of the same distillation: the oil carries the plant's fat-soluble compounds, the hydrosol its water-soluble ones. Never describe the hydrosol as a leftover, by-product or "the water that remains".
- Keep proper names as they are: Gota de Cura, Gotinha de Cura, Chácara da Mãe Luzia, Morada, Cantinho da Amazônia, and product line names written as brands. Keep popular plant names that have no common English name (e.g. breu branco, cumaru, copaíba) and add nothing to explain them.
- Keep scientific names, quantities and units exactly (120ml, 10 ml, 2%, 1 litro → 1 liter).

Rules:
- Translate only. Do not add, drop, soften or strengthen any claim — especially therapeutic, safety and dosage statements; render them as faithfully as English allows.
- The descriptions are HTML. Keep every tag and attribute exactly as it is and translate only the text between tags. Return an empty string for a field that is empty in the input.
- Match the tone of the original: warm and plain, never salesy.`

const client = new Anthropic()

async function translate(product: ProductItem): Promise<ProductTranslation | null> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium', format: zodOutputFormat(Translation) },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          category: product.type ?? '',
          name: product.name,
          description: product.description ?? '',
          detailedDescription: product.detailedDescription ?? '',
        }),
      },
    ],
  })

  if (response.stop_reason === 'refusal') {
    console.warn(`  ! recusado (${response.stop_details?.category ?? 'sem categoria'})`)
    return null
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    console.warn(`  ! resposta incompleta (${response.stop_reason})`)
    return null
  }
  return response.parsed_output
}

async function draft(args: string[]) {
  const all = args.includes('--all')
  const onlyIndex = args.indexOf('--only')
  const only = onlyIndex >= 0 ? new Set(args[onlyIndex + 1]?.split(',')) : null

  const products = (await ProductsService.getProducts())
    .filter((product) => (only ? only.has(product.id) : true))
    .filter((product) => all || only || !product.translations?.en?.name?.trim())
    .sort((a, b) => a.id.localeCompare(b.id))

  console.log(`${products.length} produto(s) para traduzir com ${MODEL}.`)

  const drafts: Draft[] = []
  const failed: string[] = []

  for (const [index, product] of products.entries()) {
    console.log(`[${index + 1}/${products.length}] ${product.id} — ${product.name}`)
    try {
      const en = await translate(product)
      if (!en) {
        failed.push(product.id)
        continue
      }
      drafts.push({
        id: product.id,
        type: product.type,
        pt: {
          name: product.name,
          description: product.description,
          detailedDescription: product.detailedDescription ?? '',
        },
        en,
      })
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        console.error('  ! limite de requisições atingido — rode de novo para continuar')
        break
      }
      if (error instanceof Anthropic.APIError) {
        console.error(`  ! erro da API ${error.status}: ${error.message}`)
      } else {
        console.error('  !', error)
      }
      failed.push(product.id)
    }
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(drafts, null, 2)}\n`)

  console.log(
    `\n${drafts.length} rascunho(s) em ${path.relative(process.cwd(), OUT_FILE)}.`,
  )
  if (failed.length) console.log(`Sem tradução: ${failed.join(', ')}`)
  console.log('Revise o arquivo e depois rode com --apply para gravar no Firestore.')
}

/** Mesma regra do formulário do painel: campo vazio não é gravado. */
const filled = (translation: ProductTranslation): ProductTranslation =>
  Object.fromEntries(
    Object.entries(translation).filter(
      ([, value]) => typeof value === 'string' && value.replace(/<[^>]*>/g, '').trim(),
    ),
  )

async function apply(file: string) {
  const drafts = JSON.parse(fs.readFileSync(file, 'utf-8')) as Draft[]
  console.log(`Gravando ${drafts.length} tradução(ões) de ${file}…`)

  for (const entry of drafts) {
    const en = filled(entry.en)
    if (!en.name) {
      console.warn(`  - ${entry.id}: sem nome em inglês, pulado`)
      continue
    }
    // Só o campo da tradução — preço, estoque e o resto ficam intocados.
    await updateDoc(doc(db, 'products', entry.id), { 'translations.en': en })
    console.log(`  ✓ ${entry.id}`)
  }
}

const args = process.argv.slice(2)
const applyIndex = args.indexOf('--apply')

;(applyIndex >= 0 ? apply(args[applyIndex + 1] ?? OUT_FILE) : draft(args))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
