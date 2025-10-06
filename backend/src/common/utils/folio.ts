// /src/common/utils/folio.ts
export function folio(prefix = 'DOC'): string {
  const now = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const rnd = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${now}-${rnd}`;
}
