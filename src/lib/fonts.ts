import localFont from 'next/font/local'
import { Archivo, Petrona } from 'next/font/google'

/**
 * Petrona — a warm, slightly narrow book serif with real bones. Reads like a
 * botanical monograph, which is exactly the register: careful, not precious.
 */
export const petrona = Petrona({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-petrona',
})

/** Archivo — sturdy grotesque for UI and long-form Portuguese body copy. */
export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-archivo',
})

/**
 * Amarillo is the brand's own script, already used in the logo lockup
 * ("Cuidando com amor"). Kept for that one line and nothing else.
 */
export const amarillo = localFont({
  src: '../../public/fonts/Amarillo.ttf',
  display: 'swap',
  variable: '--font-amarillo',
})

/**
 * Ample Soft Pro is the wordmark's own face. It is used to letterset the
 * lockup ("gota de cura") and nowhere else — it is logo, not UI type.
 */
export const ampleSoft = localFont({
  src: [
    { path: '../../public/fonts/AmpleSoftPro-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/AmpleSoftPro.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/AmpleSoftPro-Bold.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-ample',
})
