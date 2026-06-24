import { APIRequestContext } from "@playwright/test";
import { ProductPayload } from "../data/product.data";

export class ProductService {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async create(product: ProductPayload) {
    return this.request.post("/produtos", {
      data: product,
      headers: { Authorization: this.token },
    });
  }

  async getById(id: string) {
    return this.request.get(`/produtos/${id}`);
  }

  async list(params?: Record<string, string>) {
    return this.request.get("/produtos", { params });
  }

  async update(id: string, product: ProductPayload) {
    return this.request.put(`/produtos/${id}`, {
      data: product,
      headers: { Authorization: this.token },
    });
  }

  async delete(id: string) {
    return this.request.delete(`/produtos/${id}`, {
      headers: { Authorization: this.token },
    });
  }
}
