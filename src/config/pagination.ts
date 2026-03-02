import { AxiosInstance } from "axios";
import { api } from "./api";

const PAGE_SIZE = 200;

export async function fetchAllPages<T>(
  url: string,
  params?: URLSearchParams,
  client: AxiosInstance = api
): Promise<T[]> {
  const searchParams = params ?? new URLSearchParams();
  const allItems: T[] = [];
  let page = 1;

  while (true) {
    searchParams.set("page", String(page));
    searchParams.set("page-size", String(PAGE_SIZE));

    const response = await client.get(`${url}?${searchParams.toString()}`);

    allItems.push(...response.data);
    if (response.data.length < PAGE_SIZE) break;
    page++;
  }

  return allItems;
}
