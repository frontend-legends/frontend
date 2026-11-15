// Колода вопросов с собеседования, собранная из самой книги.
//
// В главах вопросы оформлены двумя способами, оба разбираются здесь:
//   1. <b class="text-on-semi-light">Вопрос?</b> <span class="text-gray">Ответ</span>  (раздел «Вопросы на собеседовании»)
//   2. ::question … #answer … ::  (старое имя слота — #mid)                                                            (новый стандарт глав)
// Ответ на карточке — короткий «хороший ответ» из книги, ссылка ведёт в раздел главы.

type MNode = string | [string, Record<string, unknown>, ...MNode[]];

export type DeckSegment = { text: string; code?: true };
export type DeckCard = {
  q: string;
  a: DeckSegment[];
  order: number;
  title: string;
  /** /content/... с якорем на раздел, где стоит вопрос */
  href: string;
};

const MAX_Q = 96;
const MAX_A = 320;

const isEl = (n: MNode | undefined): n is [string, Record<string, unknown>, ...MNode[]] => Array.isArray(n);

function textOf(n: MNode): string {
  if (typeof n === "string") return n;
  return n.slice(2).map((c) => textOf(c as MNode)).join("");
}

function hasClass(n: MNode | undefined, cls: string): boolean {
  if (!isEl(n)) return false;
  const c = n[1]?.className ?? n[1]?.class;
  return Array.isArray(c) ? c.includes(cls) : typeof c === "string" && c.split(/\s+/).includes(cls);
}

/** inline content → text runs + `code` chips (everything else is flattened to text) */
function segmentsOf(children: MNode[]): DeckSegment[] {
  const out: DeckSegment[] = [];
  for (const c of children) {
    if (isEl(c) && c[0] === "code") {
      out.push({ text: textOf(c), code: true });
      continue;
    }
    const t = textOf(c);
    if (!t) continue;
    const last = out.at(-1);
    if (last && !last.code) last.text += t;
    else out.push({ text: t });
  }
  const first = out[0];
  const last = out.at(-1);
  if (first && !first.code) first.text = first.text.trimStart();
  if (last && !last.code) last.text = last.text.trimEnd();
  return out.filter((s) => s.text);
}

const lengthOf = (segs: DeckSegment[]) => segs.reduce((n, s) => n + s.text.length, 0);

type Page = { path: string; title: string; order: number; body?: { value?: MNode[] } };

function cardsOf(page: Page): DeckCard[] {
  const cards: DeckCard[] = [];
  let anchor = "";
  const push = (q: string, a: DeckSegment[]) => {
    q = q.replace(/\s+/g, " ").trim();
    const len = lengthOf(a);
    if (!q.includes("?") || q.length > MAX_Q || len < 24 || len > MAX_A) return;
    cards.push({
      q,
      a,
      order: Number(page.order),
      title: page.title,
      href: `/content${page.path}${anchor ? `#${anchor}` : ""}`,
    });
  };

  for (const n of page.body?.value ?? []) {
    if (!isEl(n)) continue;
    const [tag, props] = n;
    if (tag === "h2" && typeof props?.id === "string") anchor = props.id;

    // 1. <b class="text-on-semi-light">Q</b><span class="text-gray">A</span>
    if (tag === "p") {
      const kids = n.slice(2) as MNode[];
      const qi = kids.findIndex((k) => isEl(k) && k[0] === "b" && hasClass(k, "text-on-semi-light"));
      if (qi === -1) continue;
      const answer = kids.slice(qi + 1).find((k) => isEl(k) && k[0] === "span" && hasClass(k, "text-gray"));
      if (!isEl(answer)) continue;
      push(textOf(kids[qi]!), segmentsOf(answer.slice(2) as MNode[]));
    }

    // 2. ::question — default slot = question, #answer (или старый #mid) = short answer
    if (tag === "question") {
      const kids = n.slice(2) as MNode[];
      const qNode = kids.find((k) => isEl(k) && k[0] !== "template");
      const mid = kids.find((k) => isEl(k) && k[0] === "template" && ("v-slot:answer" in (k[1] ?? {}) || "v-slot:mid" in (k[1] ?? {})));
      if (!qNode || !isEl(mid)) continue;
      const firstP = (mid.slice(2) as MNode[]).find((k) => isEl(k) && k[0] === "p");
      if (!isEl(firstP)) continue;
      push(textOf(qNode), segmentsOf(firstP.slice(2) as MNode[]));
    }
  }
  return cards;
}

// module-level cache: the deck is built once per session
const cards = ref<DeckCard[]>([]);
const ready = ref(false);
let loading: Promise<void> | null = null;

async function load() {
  const t0 = performance.now();
  try {
    const pages = (await queryCollection("content")
      .select("path", "title", "order", "body")
      .order("order", "ASC")
      .all()) as unknown as Page[];
    cards.value = pages.flatMap(cardsOf);
  } catch (e) {
    console.warn("[interview deck] failed to build from content", e);
    cards.value = [];
  }
  ready.value = true;
  if (import.meta.dev) console.debug(`[interview deck] ${cards.value.length} cards in ${Math.round(performance.now() - t0)}ms`);
}

export function useInterviewDeck() {
  if (import.meta.client && !loading) loading = load();
  return { cards, ready };
}
