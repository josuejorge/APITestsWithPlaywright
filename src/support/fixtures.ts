import { test as base } from "@playwright/test";
import { LoginService } from "../services/login.service";
import { UserService } from "../services/user.service";

interface ApiFixtures {
  loginService: LoginService;
  userService: UserService;
}

export const test = base.extend<ApiFixtures>({
  loginService: async ({ request }, use) => {
    await use(new LoginService(request));
  },
  userService: async ({ request }, use) => {
    await use(new UserService(request));
  },
});

export { expect } from "@playwright/test";
