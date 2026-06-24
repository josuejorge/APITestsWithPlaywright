import { APIRequestContext } from "@playwright/test";
import { LoginPayload } from "../data/user.data";

export class LoginService {
  constructor(private request: APIRequestContext) {}

  async login(credentials: LoginPayload) {
    return this.request.post("/login", { data: credentials });
  }
}
