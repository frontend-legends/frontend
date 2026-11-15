// Авторы книги — при сборке, а не в браузере.
// Сайт пересобирается на каждый пуш в main репозитория контента (content/.github/workflows/trigger-deploy.yml),
// а новый автор появляется только через мерж — значит, список, взятый при сборке, всегда свежий.
// Модуль один раз спрашивает GitHub API и кладёт результат в /contributors.json рядом со статикой:
// посетители не ходят в api.github.com и не упираются в его лимит (60 запросов в час на IP без токена).
// GITHUB_TOKEN в окружении сборки (необязательно) поднимает лимит самой сборки до 5000 в час —
// у Vercel общие IP, анонимный лимит там может быть уже выбран.
// Не получилось — файла нет, и страница /contributors спрашивает GitHub сама, как раньше.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineNuxtModule, useLogger } from "@nuxt/kit";

const REPO = "frontend-legends/content";

interface GithubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export default defineNuxtModule({
  meta: { name: "fl-contributors" },
  async setup(_, nuxt) {
    const logger = useLogger("contributors");
    // outside .nuxt: the build dir is wiped during the build, this one is not
    const dir = join(nuxt.options.rootDir, "node_modules/.cache/fl-public");

    nuxt.hook("nitro:config", (config) => {
      config.publicAssets ||= [];
      config.publicAssets.push({ dir, baseURL: "/", maxAge: 0 });
    });

    await mkdir(dir, { recursive: true });
    const file = join(dir, "contributors.json");

    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=100`, {
        headers: {
          accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const list = (await res.json()) as GithubContributor[];
      const users = list
        .filter((c) => c.type === "User")
        .map(({ login, avatar_url, html_url, contributions }) => ({ login, avatar_url, html_url, contributions }));
      await writeFile(file, JSON.stringify(users));
      logger.success(`contributors.json: ${users.length}`);
    } catch (e) {
      // no stale file: the page falls back to asking GitHub itself
      await rm(file, { force: true });
      logger.warn(`contributors.json not built (${(e as Error).message}); /contributors will query GitHub at runtime`);
    }
  },
});
