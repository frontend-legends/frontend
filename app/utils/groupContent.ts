// utils/groupContent.ts
export interface ContentItem {
  title: string;
  id: string;
  path: string;
  order: number;
}

export interface GroupedContent {
  order: number;
  title: string;
  path: string;
  children: ContentItem[];
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
        children: [],
      });
    } else {
      const parentOrder = Math.floor(order);
      const parent = grouped.get(parentOrder);
      if (parent) {
        parent.children.push(item);
      } else {
        grouped.set(parentOrder, {
          order: parentOrder,
          title: "Untitled",
          path: "",
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
