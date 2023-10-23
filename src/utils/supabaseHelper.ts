export function buildPagination(page: number, itemsPerPage: number = 10) {
  const limit = itemsPerPage ? +itemsPerPage : 10;
  const from = page ? (page - 1) * limit : 0;
  const to = page ? from + itemsPerPage - 1 : itemsPerPage - 1;

  return { from, to };
}
