// Оглавление книги + прогресс читателя. Общий источник для карты, обложки главной
// и закрывающей плиты «продолжить»: один запрос (только поля оглавления, без тел статей).
import { groupContent, type ContentItem } from "@/utils/groupContent";
import { useAuthStore } from "~/store/auth.store";

export function useBookMap() {
  const authStore = useAuthStore();
  const isAuth = computed(() => !!authStore.getAuth);

  const { data, pending } = useAsyncData("book-map", () =>
    queryCollection("content")
      .select("id", "title", "path", "order", "date", "author")
      .order("order", "ASC")
      .where("order", ">", "0")
      .all(),
  );

  const finished = computed(() => {
    const set = new Set<string>();
    for (const s of authStore.getUserMetadata?.stories ?? []) if (s.is_finished) set.add(s.title);
    return set;
  });

  // progress is stored as /chapter/story (with a leading slash)
  const isCompleted = (path: string) =>
    finished.value.has("/" + path.replace(/^\/?content\//, "").replace(/^\/+/, ""));

  const chapters = computed(() =>
    groupContent((data.value ?? []) as ContentItem[]).map((c) => {
      const done = c.children.filter((s) => isCompleted(s.path)).length;
      return { ...c, done, pct: c.children.length ? done / c.children.length : 0 };
    }),
  );

  const stories = computed(() => chapters.value.flatMap((c) => c.children));
  const totalStories = computed(() => stories.value.length);
  const totalDone = computed(() => chapters.value.reduce((n, c) => n + c.done, 0));
  const latestDate = computed(() => stories.value.reduce<string | undefined>((m, s) => (s.date && (!m || s.date > m) ? s.date : m), undefined));

  /** первая непройденная тема по порядку книги (для гостя — самая первая) */
  const nextStory = computed(() => stories.value.find((s) => !isCompleted(s.path)) ?? stories.value[0]);

  return { isAuth, pending, chapters, stories, totalStories, totalDone, latestDate, nextStory, isCompleted };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function ruPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
