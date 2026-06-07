// utils/groupContent.ts
export interface ContentItem {
  title: string;
  id: string;
  path: string;
  order: number;
  date?: string;
}

export interface GroupedContent {
  order: number;
  title: string;
  path: string;
  date?: string; // latest date among the section index and its children
  children: ContentItem[];
}

// ISO dates (YYYY-MM-DD) compare correctly as strings; returns the later one.
function maxDate(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

export function groupContent(items: ContentItem[]): GroupedContent[] {
  const grouped = new Map<number, GroupedContent>();

  for (const rawItem of items) {
    const order = Number(rawItem.order); // 👈 безопасно, даже если строка
    const item = { ...rawItem, order }; // перезаписываем с числовым order

    const isTopLevel = Number.isInteger(order);

    if (isTopLevel) {
      grouped.set(order, {
        order,
        title: item.title,
        path: item.path,
        date: item.date,
        children: [],
      });
    } else {
      const parentOrder = Math.floor(order);
      const parent = grouped.get(parentOrder);
      if (parent) {
        parent.children.push(item);
        parent.date = maxDate(parent.date, item.date);
      } else {
        grouped.set(parentOrder, {
          order: parentOrder,
          title: "Untitled",
          path: "",
          date: item.date,
          children: [item],
        });
      }
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      children: group.children.sort((a, b) => a.order - b.order),
    }));
}
