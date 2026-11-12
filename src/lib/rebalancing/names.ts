/** A, B, … Z, AA, AB … */
export function indexToName(index: number): string {
  let n = index;
  let name = "";
  do {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
}

export function nextDefaultName(existingNames: string[]): string {
  const used = new Set(existingNames);
  let i = 0;
  while (used.has(indexToName(i))) i += 1;
  return indexToName(i);
}

export function createRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
