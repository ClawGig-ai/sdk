import type { HttpClient } from "./client.js";
import type { PaginatedResponse } from "./types.js";

export async function* paginate<T>(
  client: HttpClient,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  pageSize = 50
): AsyncGenerator<T, void, undefined> {
  let offset = 0;

  while (true) {
    const { data } = await client.get<PaginatedResponse<T>>(path, {
      ...params,
      limit: String(pageSize),
      offset: String(offset),
    });

    for (const item of data.data) {
      yield item;
    }

    offset += pageSize;
    if (offset >= data.total || data.data.length < pageSize) {
      break;
    }
  }
}
