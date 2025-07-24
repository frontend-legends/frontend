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

  for (const item of items) {
    const isTopLevel = Number.isInteger(item.order);

    if (isTopLevel) {
      grouped.set(item.order, {
        order: item.order,
        title: item.title,
        path: item.path,
        children: [],
      });
    } else {
      const parentOrder = Math.floor(item.order);
      const parent = grouped.get(parentOrder);
      if (parent) {
        parent.children.push(item);
      } else {
        // Optional: handle missing parent case
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
