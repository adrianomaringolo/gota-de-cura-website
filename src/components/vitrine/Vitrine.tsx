'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ProductItem } from '@/lib/types'
import { CatalogToggle } from './CatalogToggle'
import { shelfLabel, useCatalogue, type Shelf } from './data'
import { LinhaGrid } from './LinhaGrid'
import { ListaView } from './ListaView'
import { PlantaView } from './PlantaView'
import { PrateleiraGrid } from './PrateleiraGrid'
import { VitrineChrome } from './VitrineChrome'

/** Nothing has been touched for this long → the tablet resets for the next person. */
const IDLE_MS = 60_000

type View =
  | { name: 'home' }
  | { name: 'list' }
  | { name: 'category'; shelf: Shelf }
  | { name: 'product'; shelf: Shelf; item: ProductItem; from: 'category' | 'list' }

const viewKey = (view: View) => {
  switch (view.name) {
    case 'home':
      return 'home'
    case 'list':
      return 'list'
    case 'category':
      return `c:${view.shelf.type.id}`
    case 'product':
      return `p:${view.shelf.type.id}:${view.item.id}`
  }
}

export function Vitrine() {
  const catalogue = useCatalogue()
  const [view, setView] = useState<View>({ name: 'home' })
  const scrollRef = useRef<HTMLDivElement>(null)

  const goHome = useCallback(() => setView({ name: 'home' }), [])

  const goBack = useCallback(() => {
    setView((current) => {
      if (current.name === 'product') {
        return current.from === 'list'
          ? { name: 'list' }
          : { name: 'category', shelf: current.shelf }
      }
      return { name: 'home' }
    })
  }, [])

  // Each view starts at the top; a product opened after a long scroll should not
  // inherit the shelf's scroll position.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [view])

  // Kiosk reset. Only armed away from home, and any touch, key or scroll defers it.
  useEffect(() => {
    if (view.name === 'home') return

    let timer = window.setTimeout(goHome, IDLE_MS)
    const bump = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(goHome, IDLE_MS)
    }
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const
    events.forEach((event) => window.addEventListener(event, bump, { passive: true }))

    return () => {
      window.clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, bump))
    }
  }, [view, goHome])

  const crumbs = buildCrumbs(view, setView)

  const catalogToggle = (
    <CatalogToggle
      active={view.name === 'list' ? 'list' : 'grid'}
      onGrid={goHome}
      onList={() => setView({ name: 'list' })}
    />
  )

  return (
    <div className="flex h-full flex-col">
      <VitrineChrome
        crumbs={crumbs}
        onBack={view.name === 'home' ? undefined : goBack}
        onHome={view.name === 'home' ? undefined : goHome}
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        {catalogue.status === 'loading' && <LoadingScreen />}
        {catalogue.status === 'error' && <ErrorScreen />}

        {catalogue.status === 'ready' && (
          <div key={viewKey(view)} className="animate-rise [animation-duration:400ms]">
            {view.name === 'home' && (
              <LinhaGrid
                shelves={catalogue.shelves}
                toggle={catalogToggle}
                onOpen={(shelf) => setView({ name: 'category', shelf })}
              />
            )}
            {view.name === 'list' && (
              <ListaView
                shelves={catalogue.shelves}
                toggle={catalogToggle}
                onOpen={(shelf, item) =>
                  setView({ name: 'product', shelf, item, from: 'list' })
                }
              />
            )}
            {view.name === 'category' && (
              <PrateleiraGrid
                shelf={view.shelf}
                onOpen={(item) =>
                  setView({
                    name: 'product',
                    shelf: view.shelf,
                    item,
                    from: 'category',
                  })
                }
              />
            )}
            {view.name === 'product' && <PlantaView item={view.item} />}
          </div>
        )}
      </div>
    </div>
  )
}

type Crumb = { label: string; onClick?: () => void }

function buildCrumbs(view: View, setView: (view: View) => void): Crumb[] {
  switch (view.name) {
    case 'home':
      return [{ label: 'Toque em uma linha para começar' }]
    case 'list':
      return [{ label: 'Lista de preços' }]
    case 'category':
      return [{ label: shelfLabel(view.shelf.type) }]
    case 'product':
      return [
        view.from === 'list'
          ? { label: 'Lista de preços', onClick: () => setView({ name: 'list' }) }
          : {
              label: shelfLabel(view.shelf.type),
              onClick: () => setView({ name: 'category', shelf: view.shelf }),
            },
        { label: view.item.name },
      ]
  }
}

function LoadingScreen() {
  return (
    <div className="mx-auto max-w-[92rem] px-5 py-8 sm:px-8 sm:py-11">
      <div className="h-9 w-52 animate-pulse rounded-lg bg-canvas-sunk" />
      <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-canvas-sunk" />
      <div className="mt-10 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))] sm:gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-2xl bg-canvas-sunk sm:aspect-square"
            style={{ animationDelay: `${index * 60}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function ErrorScreen() {
  return (
    <div className="mx-auto grid max-w-[42rem] place-items-center px-6 py-24 text-center">
      <p className="font-display text-2xl font-semibold text-ink">
        Não consegui carregar a vitrine agora
      </p>
      <p className="mx-auto mt-3 max-w-[40ch] text-base text-ink-soft">
        Pode ser a conexão da loja. Toque para tentar de novo — se continuar, chame a
        equipe.
      </p>
      <Button className="mt-7" size="lg" onClick={() => window.location.reload()}>
        Tentar de novo
      </Button>
    </div>
  )
}
