export function rollItems<T extends { weight?: number }>(
  items: T[],
  count: number = 1
): T[] {
  if (count <= 1) {
    return [rollSingleItem(items)];
  }

  const rolledItem = rollSingleItem(items);
  return [
    rolledItem,
    ...rollItems(
      items.filter((item) => item !== rolledItem),
      count - 1
    ),
  ];
}

function rollSingleItem<T extends { weight?: number }>(items: T[]) {
  const weights = items.map((item) => item.weight ?? 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const thresholds: number[] = [];
  weights.forEach((weight, i) => {
    thresholds.push(weight / totalWeight + (thresholds[i - 1] ?? 0));
  });
  const randomNumber = Math.random();
  const itemIndex = thresholds.findIndex(
    (threshold) => randomNumber < threshold
  );
  return items[itemIndex];
}
