import type {
  ProductIntelligenceRow,
  ProductIntelligenceTableName,
} from "./product-intelligence.types";
import type { ProductIntelligenceAdminConfig } from "./product-intelligence-config";

type RestErrorPayload = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export class ProductIntelligenceRestClient {
  private readonly config: ProductIntelligenceAdminConfig;

  constructor(config: ProductIntelligenceAdminConfig) {
    this.config = config;
  }

  private async request<Response>(path: string, init: RequestInit): Promise<Response> {
    const response = await fetch(`${this.config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.config.serviceRoleKey,
        authorization: `Bearer ${this.config.serviceRoleKey}`,
        "content-type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const responseBody = await response.text();
      let payload: RestErrorPayload = { message: responseBody };
      try {
        payload = JSON.parse(responseBody) as RestErrorPayload;
      } catch {
        // Keep the plain response body when PostgREST does not return JSON.
      }
      throw new Error(
        `Product Intelligence database request failed (${response.status}): ${
          payload.message ?? payload.details ?? "Unknown PostgREST error"
        }`,
      );
    }

    if (response.status === 204) return undefined as Response;

    const responseBody = await response.text();
    if (responseBody.trim().length === 0) return undefined as Response;
    return JSON.parse(responseBody) as Response;
  }

  async upsert<Table extends ProductIntelligenceTableName>(
    table: Table,
    rows: readonly ProductIntelligenceRow<Table>[],
    onConflict: string,
  ): Promise<void> {
    if (rows.length === 0) return;
    const search = new URLSearchParams({ on_conflict: onConflict });
    await this.request(`${table}?${search.toString()}`, {
      method: "POST",
      headers: {
        prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    });
  }

  async rpc<Response>(functionName: string, args: Record<string, unknown>): Promise<Response> {
    return this.request(`rpc/${functionName}`, {
      method: "POST",
      body: JSON.stringify(args),
    });
  }

  async selectOne<Table extends ProductIntelligenceTableName>(
    table: Table,
    filters: Record<string, string>,
  ): Promise<ProductIntelligenceRow<Table> | null> {
    if (Object.keys(filters).length === 0) {
      throw new Error("Product Intelligence selectOne requires at least one filter.");
    }
    const search = new URLSearchParams({ select: "*", limit: "1" });
    for (const [column, value] of Object.entries(filters)) search.set(column, `eq.${value}`);
    const rows = await this.request<ProductIntelligenceRow<Table>[]>(
      `${table}?${search.toString()}`,
      { method: "GET" },
    );
    return rows[0] ?? null;
  }

  async selectAll<Table extends ProductIntelligenceTableName>(
    table: Table,
  ): Promise<ProductIntelligenceRow<Table>[]> {
    const pageSize = 500;
    const rows: ProductIntelligenceRow<Table>[] = [];

    for (let offset = 0; ; offset += pageSize) {
      const search = new URLSearchParams({
        select: "*",
        limit: pageSize.toString(),
        offset: offset.toString(),
      });
      const page = await this.request<ProductIntelligenceRow<Table>[]>(
        `${table}?${search.toString()}`,
        { method: "GET" },
      );
      rows.push(...page);
      if (page.length < pageSize) return rows;
    }
  }

  async update<Table extends ProductIntelligenceTableName>(
    table: Table,
    values: Partial<ProductIntelligenceRow<Table>>,
    filters: Record<string, string>,
  ): Promise<void> {
    if (Object.keys(filters).length === 0) {
      throw new Error("Product Intelligence update requires at least one filter.");
    }
    const search = new URLSearchParams();
    for (const [column, value] of Object.entries(filters)) search.set(column, `eq.${value}`);
    await this.request(`${table}?${search.toString()}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify(values),
    });
  }
}
