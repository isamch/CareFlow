
export function getPagination(query, defaultLimit = 10) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || defaultLimit;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
