import type { GalleryItem } from "@/data/gallery";

/** Remove acentos, lowercase, colapsa espaços */
export function normalize(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Texto pesquisável de um modelo, cobrindo todos os campos relevantes. */
export function searchableText(g: GalleryItem): string {
  return normalize(
    [
      g.title,
      g.category,
      g.shape,
      g.length ?? "",
      g.mainColor,
      g.secondaryColor ?? "",
      g.finish,
      g.style ?? "",
      g.description ?? "",
      ...(g.tags ?? []),
      ...(g.occasions ?? []),
      ...(g.colors ?? []),
    ].join(" "),
  );
}

/** Retorna true se todos os tokens da query aparecem no texto do modelo. */
export function matchesQuery(g: GalleryItem, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const text = searchableText(g);
  const tokens = q.split(" ").filter((t) => t.length > 0);
  return tokens.every((t) => text.includes(t));
}

/** Pontua um item para "Sugestões para você" com base em filtros/booking. */
export function scoreSuggestion(
  g: GalleryItem,
  hints: {
    shape?: string;
    styles?: string[];
    colors?: string[];
    decorations?: string[];
    occasions?: string[];
  },
): number {
  let score = 0;
  const n = (s: string) => normalize(s);
  if (hints.shape && n(hints.shape) === n(g.shape)) score += 3;
  const tags = (g.tags ?? []).map(n);
  const style = n(g.style ?? "");
  const main = n(g.mainColor);
  const sec = n(g.secondaryColor ?? "");
  for (const s of hints.styles ?? []) {
    const ns = n(s);
    if (ns === style || ns === n(g.category) || tags.includes(ns)) score += 2;
  }
  for (const c of hints.colors ?? []) {
    const nc = n(c);
    if (nc === main || nc === sec || tags.includes(nc)) score += 2;
  }
  for (const d of hints.decorations ?? []) {
    const nd = n(d);
    if (nd === n(g.finish) || tags.includes(nd)) score += 1;
  }
  for (const o of hints.occasions ?? []) {
    const no = n(o);
    if ((g.occasions ?? []).map(n).includes(no)) score += 3;
  }
  if (g.featured) score += 0.5;
  return score;
}
