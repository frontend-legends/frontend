export function getGreeting(date: string): { message: string, icon: string } {
  const currentHour = Number(date?.split(" ")[1]?.slice(0, 2));

  if (currentHour >= 5 && currentHour < 12) {
    return {
      message: "Good morning",
      icon: "ph:mountains-bold"
    };
  } else if (currentHour >= 12 && currentHour < 17) {
    return {
      message: "Good afternoon",
      icon: "ph:sun-bold",
    };
  } else if (currentHour >= 17 && currentHour < 21) {
    return {
      message: "Good evening",
      icon: "ph:sun-horizon-bold",
    };
  } else {
    return {
      message: "Good night",
      icon: "ph:moon-bold",
    };
  }
}

// Frontmatter date → "15 ноября 2026". Day + month from Intl (genitive), year appended by hand:
// with `year` Intl adds a trailing " г.". Null for a missing or invalid date.
export function formatRuDate(raw?: string | Date): string | null {
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  const dayMonth = date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return `${dayMonth} ${date.getFullYear()}`;
}
