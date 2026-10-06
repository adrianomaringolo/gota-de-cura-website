import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/lib/cart-context'

/** What every root layout wraps its pages in — the site's and the internal one. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'oklch(0.24 0.03 300)',
            color: 'white',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '0.9375rem',
          },
        }}
      />
    </CartProvider>
  )
}
