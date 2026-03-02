import { describe, it } from "node:test";
import assert from "node:assert";
import { AxiosInstance } from "axios";
import { fetchAllPages } from "../src/config/pagination";

function createMockClient(pages: any[][]): AxiosInstance {
  let callCount = 0;
  return {
    get: async () => {
      const data = pages[callCount++] ?? [];
      return { data };
    },
  } as unknown as AxiosInstance;
}

describe("fetchAllPages", () => {
  it("returns all items from a single page", async () => {
    const client = createMockClient([[{ id: "1" }, { id: "2" }]]);

    const result = await fetchAllPages<{ id: string }>(
      "workspaces/123/tags",
      undefined,
      client
    );

    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result, [{ id: "1" }, { id: "2" }]);
  });

  it("fetches multiple pages until last page has fewer items", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: String(i) }));
    const page2 = [{ id: "200" }, { id: "201" }];
    const client = createMockClient([page1, page2]);

    const result = await fetchAllPages<{ id: string }>(
      "workspaces/123/tags",
      undefined,
      client
    );

    assert.strictEqual(result.length, 202);
  });

  it("returns empty array when API returns no items", async () => {
    const client = createMockClient([[]]);

    const result = await fetchAllPages("workspaces/123/tags", undefined, client);

    assert.strictEqual(result.length, 0);
  });

  it("passes extra params alongside pagination params", async () => {
    let capturedUrl = "";
    const client = {
      get: async (url: string) => {
        capturedUrl = url;
        return { data: [] };
      },
    } as unknown as AxiosInstance;

    const params = new URLSearchParams({ archived: "false" });
    await fetchAllPages("workspaces/123/projects", params, client);

    assert(capturedUrl.includes("archived=false"), "should include archived param");
    assert(capturedUrl.includes("page=1"), "should include page param");
    assert(capturedUrl.includes("page-size=200"), "should include page-size param");
    assert(!capturedUrl.includes("?&"), "should not have ?& in URL");
  });
});
