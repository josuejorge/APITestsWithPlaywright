import { APIRequestContext } from "@playwright/test";
import { UserPayload } from "../data/user.data";

export class UserService {
  constructor(private request: APIRequestContext) {}

  async create(user: UserPayload) {
    return this.request.post("/usuarios", { data: user });
  }

  async deleteById(id: string) {
    return this.request.delete(`/usuarios/${id}`);
  }
}
