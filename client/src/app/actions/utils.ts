export function appendPaginationParams(url: string, page?: number, perPage?: number): string {
  const params = new URLSearchParams();
  
  if (page !== undefined) {
    params.append('page', page.toString());
  }
  
  if (perPage !== undefined) {
    params.append('per_page', perPage.toString());
  }
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}