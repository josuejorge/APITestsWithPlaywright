import { test, expect } from "../../src/support/fixtures";
import { buildUser, buildLogin } from "../../src/data/user.data";
import {
  loginSuccessSchema,
  loginFailSchema,
  validateSchema,
} from "../../src/schemas/login.schema";

test.describe("POST /login", () => {
  const user = buildUser();
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post("/usuarios", { data: user });
    const body = await response.json();
    userId = body._id;
  });

  test.afterAll(async ({ request }) => {
    if (userId) {
      await request.delete(`/usuarios/${userId}`);
    }
  });

  test("deve realizar login com sucesso", async ({ loginService }) => {
    const response = await loginService.login({
      email: user.email,
      password: user.password,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Login realizado com sucesso");
    expect(body.authorization).toContain("Bearer ");

    const schemaErrors = validateSchema(body, loginSuccessSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve retornar token no formato Bearer JWT", async ({
    loginService,
  }) => {
    const response = await loginService.login({
      email: user.email,
      password: user.password,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.authorization).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  test("deve falhar com email inválido", async ({ loginService }) => {
    const response = await loginService.login(
      buildLogin({ password: user.password })
    );
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toBe("Email e/ou senha inválidos");

    const schemaErrors = validateSchema(body, loginFailSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve falhar com senha inválida", async ({ loginService }) => {
    const response = await loginService.login(
      buildLogin({ email: user.email })
    );
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toBe("Email e/ou senha inválidos");
  });

  test("deve falhar com credenciais inexistentes", async ({
    loginService,
  }) => {
    const response = await loginService.login(buildLogin());
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toBe("Email e/ou senha inválidos");
  });

  test("deve falhar com email vazio", async ({ loginService }) => {
    const response = await loginService.login({
      email: "",
      password: user.password,
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBe("email não pode ficar em branco");
  });

  test("deve falhar com password vazio", async ({ loginService }) => {
    const response = await loginService.login({
      email: user.email,
      password: "",
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.password).toBe("password não pode ficar em branco");
  });

  test("deve falhar com email em formato inválido", async ({
    loginService,
  }) => {
    const response = await loginService.login({
      email: "email-invalido",
      password: user.password,
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBe("email deve ser um email válido");
  });

  test("deve falhar sem enviar body", async ({ request }) => {
    const response = await request.post("/login", {
      data: {},
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBeDefined();
    expect(body.password).toBeDefined();
  });
});
