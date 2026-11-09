/** Up to two initials: first and last word of the name. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** Stable colour for a string: same name, same hue, every time. */
export function colorFromString(value: string): string {
  let hash = 0
  for (const char of value.trim().toLowerCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }
  // Dark enough for white text to keep contrast.
  return `hsl(${Math.abs(hash) % 360} 45% 38%)`
}
