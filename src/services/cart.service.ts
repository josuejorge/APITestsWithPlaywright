import { APIRequestContext } from "@playwright/test";
import { CartPayload } from "../data/cart.data";

export class CartService {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async create(cart: CartPayload) {
    return this.request.post("/carrinhos", {
      data: cart,
      headers: { Authorization: this.token },
    });
  }

  async list(params?: Record<string, string>) {
    return this.request.get("/carrinhos", { params });
  }

  async getById(id: string) {
    return this.request.get(`/carrinhos/${id}`);
  }

  async completePurchase() {
    return this.request.delete("/carrinhos/concluir-compra", {
      headers: { Authorization: this.token },
    });
  }

  async cancelPurchase() {
    return this.request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: this.token },
    });
  }
}
