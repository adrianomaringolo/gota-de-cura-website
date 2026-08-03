/**
 * Emits a JSON-LD block. Every caller builds the schema from our own content —
 * never from user input — so serialising it straight into the tag is safe.
 */
export function JsonLd({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
