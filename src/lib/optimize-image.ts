/** Longest side kept for product photos: enough for the gallery on retina screens. */
const MAX_DIMENSION = 1600
const WEBP_QUALITY = 0.8

/**
 * Re-encodes a photo as WebP in the browser, scaled down so its longest side is
 * at most MAX_DIMENSION. Phone photos arrive as multi-megabyte JPEGs/HEICs;
 * this keeps what goes to Storage — and what the image proxy has to fetch — to
 * a few hundred KB. Falls back to the original file when the browser can't
 * decode it or can't encode WebP, so an upload never fails because of this.
 */
export async function optimizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    )
    // Browsers without a WebP encoder silently hand back a PNG instead.
    if (!blob || blob.type !== 'image/webp') return file
    // Already-small WebPs can come out larger after re-encoding.
    if (file.type === 'image/webp' && scale === 1 && blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch (error) {
    console.error('[optimizeImage] Mantendo o arquivo original', error)
    return file
  }
}
