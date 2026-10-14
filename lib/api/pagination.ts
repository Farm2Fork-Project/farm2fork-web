import type { ApiPage } from "./contracts.ts";

/** Collect role-scoped pages without silently hiding records after page one. */
export async function collectPages<T>(
  fetchPage: (page: number) => Promise<ApiPage<T>>,
): Promise<ApiPage<T>> {
  const first = await fetchPage(1);
  const data = [...first.data];
  for (let page = 2; page <= (first.totalPages ?? 1); page++) {
    data.push(...(await fetchPage(page)).data);
  }
  return { ...first, data };
}
