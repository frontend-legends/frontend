// Ярлык ссылки на тему книги: русский заголовок статьи и, для ссылки на якорь, заголовок раздела.
// Тело статьи (minimark: [tag, props, ...children]) грузится один раз на путь и кэшируется.

type MNode = string | [string, Record<string, unknown>, ...MNode[]];

const bodies = new Map<string, Promise<MNode[] | null>>();

function loadBody(path: string): Promise<MNode[] | null> {
  let body = bodies.get(path);
  if (!body) {
    body = queryCollection("content")
      .path(path)
      .first()
      .then((page) => ((page?.body as { value?: MNode[] } | undefined)?.value ?? null))
      .catch(() => null);
    bodies.set(path, body);
  }
  return body;
}

const isEl = (n: MNode): n is [string, Record<string, unknown>, ...MNode[]] => Array.isArray(n);

function text(n: MNode): string {
  return isEl(n) ? n.slice(2).map((c) => text(c as MNode)).join("") : n;
}

const level = (n: MNode) => (isEl(n) ? Number(/^h([1-6])$/.exec(n[0])?.[1] ?? 0) : 0);

export type PagePeek = { heading?: string; section?: string };

/** the page's own heading; with `hash` — also that section's heading */
export async function loadPagePeek(path: string, hash?: string): Promise<PagePeek> {
  const nodes = await loadBody(path);
  if (!nodes) return {};

  const h1 = nodes.find((n) => level(n) === 1);
  const heading = h1 ? text(h1).trim() : undefined;

  const node = hash ? nodes.find((n) => isEl(n) && n[1]?.id === hash) : undefined;
  const section = node ? text(node).trim() : undefined;

  return { heading, section };
}
