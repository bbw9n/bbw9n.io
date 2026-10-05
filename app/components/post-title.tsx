// Renders Org-style `_{sub}` in a title as a subscript.
export function PostTitle({ title }: { title: string }) {
  return title
    .split(/_\{([^}]*)\}/)
    .map((part, i) => (i % 2 ? <sub key={i}>{part}</sub> : part))
}
