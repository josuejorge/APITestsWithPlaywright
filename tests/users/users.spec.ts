import { test, expect } from "../../src/support/fixtures";
import { buildUser } from "../../src/data/user.data";
import { validateSchema } from "../../src/schemas/login.schema";
import {
  userSchema,
  userCreatedSchema,
  userListSchema,
} from "../../src/schemas/user.schema";

test.describe("POST /usuarios", () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`/usuarios/${id}`);
    }
    createdIds.length = 0;
  });

  test("deve cadastrar usuário com sucesso", async ({ userService }) => {
    const user = buildUser();
    const response = await userService.create(user);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();

    createdIds.push(body._id);

    const schemaErrors = validateSchema(body, userCreatedSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve cadastrar usuário não-admin", async ({ userService }) => {
    const user = buildUser({ administrador: "false" });
    const response = await userService.create(user);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body._id).toBeTruthy();

    createdIds.push(body._id);
  });

  test("deve rejeitar email duplicado", async ({ userService }) => {
    const user = buildUser();

    const first = await userService.create(user);
    const firstBody = await first.json();
    createdIds.push(firstBody._id);

    const duplicate = await userService.create(user);
    const duplicateBody = await duplicate.json();

    expect(duplicate.status()).toBe(400);
    expect(duplicateBody.message).toBe("Este email já está sendo usado");
  });

  test("deve falhar com campos obrigatórios ausentes", async ({
    userService,
  }) => {
    const response = await userService.create({} as any);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.nome).toBeDefined();
    expect(body.email).toBeDefined();
    expect(body.password).toBeDefined();
    expect(body.administrador).toBeDefined();
  });

  test("deve falhar com email em formato inválido", async ({
    userService,
  }) => {
    const user = buildUser({ email: "email-invalido" });
    const response = await userService.create(user);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBe("email deve ser um email válido");
  });

  test("deve falhar com administrador diferente de true/false", async ({
    userService,
  }) => {
    const user = buildUser({ administrador: "sim" });
    const response = await userService.create(user);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.administrador).toBeDefined();
  });
});

test.describe("GET /usuarios", () => {
  test("deve listar usuários", async ({ request }) => {
    const response = await request.get("/usuarios");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.usuarios)).toBe(true);

    const schemaErrors = validateSchema(body, userListSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve buscar usuário por ID", async ({ userService, request }) => {
    const user = buildUser();
    const createRes = await userService.create(user);
    const { _id: userId } = await createRes.json();

    const response = await request.get(`/usuarios/${userId}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.nome).toBe(user.nome);
    expect(body.email).toBe(user.email);
    expect(body.password).toBe(user.password);
    expect(body.administrador).toBe(user.administrador);

    const schemaErrors = validateSchema(body, userSchema);
    expect(schemaErrors).toEqual([]);

    await userService.deleteById(userId);
  });

  test("deve retornar erro para ID inexistente", async ({ request }) => {
    const response = await request.get("/usuarios/aaaBBBcccDDDeeFF");
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Usuário não encontrado");
  });

  test("deve filtrar usuários por nome", async ({
    userService,
    request,
  }) => {
    const user = buildUser();
    const createRes = await userService.create(user);
    const { _id: userId } = await createRes.json();

    const response = await request.get("/usuarios", {
      params: { nome: user.nome },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBeGreaterThanOrEqual(1);
    expect(body.usuarios.some((u: any) => u.nome === user.nome)).toBe(true);

    await userService.deleteById(userId);
  });
});

test.describe("PUT /usuarios/{id}", () => {
  test("deve atualizar usuário existente", async ({
    userService,
    request,
  }) => {
    const user = buildUser();
    const createRes = await userService.create(user);
    const { _id: userId } = await createRes.json();

    const updated = buildUser();
    const response = await request.put(`/usuarios/${userId}`, {
      data: updated,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Registro alterado com sucesso");

    const getRes = await request.get(`/usuarios/${userId}`);
    const getBody = await getRes.json();
    expect(getBody.nome).toBe(updated.nome);
    expect(getBody.email).toBe(updated.email);

    await userService.deleteById(userId);
  });

  test("deve criar usuário quando ID não existe", async ({
    userService,
    request,
  }) => {
    const user = buildUser();
    const response = await request.put("/usuarios/aaaBBBcccDDDeeFF", {
      data: user,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();

    await userService.deleteById(body._id);
  });

  test("deve rejeitar email duplicado ao atualizar", async ({
    userService,
    request,
  }) => {
    const userA = buildUser();
    const userB = buildUser();

    const resA = await userService.create(userA);
    const { _id: idA } = await resA.json();

    const resB = await userService.create(userB);
    const { _id: idB } = await resB.json();

    const response = await request.put(`/usuarios/${idB}`, {
      data: buildUser({ email: userA.email }),
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Este email já está sendo usado");

    await userService.deleteById(idA);
    await userService.deleteById(idB);
  });
});

test.describe("DELETE /usuarios/{id}", () => {
  test("deve deletar usuário com sucesso", async ({
    userService,
    request,
  }) => {
    const user = buildUser();
    const createRes = await userService.create(user);
    const { _id: userId } = await createRes.json();

    const response = await userService.deleteById(userId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Registro excluído com sucesso");

    const getRes = await request.get(`/usuarios/${userId}`);
    expect(getRes.status()).toBe(400);
  });

  test("deve retornar sucesso para ID inexistente", async ({
    userService,
  }) => {
    const response = await userService.deleteById("aaaBBBcccDDDeeFF");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Nenhum registro excluído");
  });
});
