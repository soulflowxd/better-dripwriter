const keyboardRows = [
  { keys: "qwertyuiop", offset: 0 },
  { keys: "asdfghjkl", offset: 0.5 },
  { keys: "zxcvbnm", offset: 1 }
];

const positions = new Map<string, { row: number; column: number }>();
keyboardRows.forEach((row, rowIndex) => {
  [...row.keys].forEach((key, columnIndex) => {
    positions.set(key, { row: rowIndex, column: row.offset + columnIndex });
  });
});

export function getNearbyTypo(char: string, random = Math.random): string | null {
  const lower = char.toLowerCase();
  const position = positions.get(lower);
  if (!position) return null;

  const neighbors = [...positions].filter(([key, other]) =>
    key !== lower &&
    Math.abs(position.row - other.row) <= 1 &&
    Math.abs(position.column - other.column) <= 1
  ).map(([key]) => key);

  if (!neighbors.length) return null;
  const typo = neighbors[Math.floor(random() * neighbors.length)];
  return char === lower ? typo : typo.toUpperCase();
}

export function makeSpellingSlip(word: string, random = Math.random): string | null {
  if (!/^[A-Za-z]{4,12}$/.test(word)) return null;
  const interior = 1 + Math.floor(random() * (word.length - 2));
  const next = word[interior + 1];
  if (next && word[interior].toLowerCase() !== next.toLowerCase()) {
    return word.slice(0, interior) + next + word[interior] + word.slice(interior + 2);
  }
  return word.slice(0, interior) + word[interior] + word.slice(interior);
}
