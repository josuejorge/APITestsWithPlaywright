import { test, expect } from "../../src/support/fixtures";
import { buildProduct } from "../../src/data/product.data";
import { validateSchema } from "../../src/schemas/login.schema";
import {
  productSchema,
  productCreatedSchema,
  productListSchema,
} from "../../src/schemas/product.schema";

test.describe("POST /produtos", () => {
  const productIds: string[] = [];

  test.afterEach(async ({ authProductService }) => {
    for (const id of productIds) {
      await authProductService.delete(id);
    }
    productIds.length = 0;
  });

  test("deve cadastrar produto com sucesso", async ({
    authProductService,
  }) => {
    const product = buildProduct();
    const response = await authProductService.create(product);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();

    productIds.push(body._id);

    const schemaErrors = validateSchema(body, productCreatedSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve rejeitar produto com nome duplicado", async ({
    authProductService,
  }) => {
    const product = buildProduct();

    const first = await authProductService.create(product);
    const firstBody = await first.json();
    productIds.push(firstBody._id);

    const duplicate = await authProductService.create(product);
    const duplicateBody = await duplicate.json();

    expect(duplicate.status()).toBe(400);
    expect(duplicateBody.message).toBe("Já existe produto com esse nome");
  });

  test("deve falhar sem token de autenticação", async ({ request }) => {
    const response = await request.post("/produtos", {
      data: buildProduct(),
    });
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toContain(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });

  test("deve falhar com usuário não-admin", async ({ request }) => {
    const { buildUser } = await import("../../src/data/user.data");
    const user = buildUser({ administrador: "false" });

    const createRes = await request.post("/usuarios", { data: user });
    const { _id: userId } = await createRes.json();

    const loginRes = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const { authorization: token } = await loginRes.json();

    const response = await request.post("/produtos", {
      data: buildProduct(),
      headers: { Authorization: token },
    });
    const body = await response.json();

    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Rota exclusiva para administradores"
    );

    await request.delete(`/usuarios/${userId}`);
  });

  test("deve falhar com campos obrigatórios ausentes", async ({
    authProductService,
  }) => {
    const response = await authProductService.create({} as any);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.nome).toBeDefined();
    expect(body.preco).toBeDefined();
    expect(body.descricao).toBeDefined();
    expect(body.quantidade).toBeDefined();
  });
});

test.describe("GET /produtos", () => {
  test("deve listar produtos", async ({ request }) => {
    const response = await request.get("/produtos");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.produtos)).toBe(true);

    const schemaErrors = validateSchema(body, productListSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve buscar produto por ID", async ({ authProductService }) => {
    const product = buildProduct();
    const createRes = await authProductService.create(product);
    const { _id: productId } = await createRes.json();

    const response = await authProductService.getById(productId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.nome).toBe(product.nome);
    expect(body.preco).toBe(product.preco);
    expect(body.descricao).toBe(product.descricao);
    expect(body.quantidade).toBe(product.quantidade);

    const schemaErrors = validateSchema(body, productSchema);
    expect(schemaErrors).toEqual([]);

    await authProductService.delete(productId);
  });

  test("deve retornar erro para ID inexistente", async ({ request }) => {
    const response = await request.get("/produtos/aaaBBBcccDDDeeFF");
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Produto não encontrado");
  });
});

test.describe("PUT /produtos/{id}", () => {
  test("deve atualizar produto existente", async ({
    authProductService,
  }) => {
    const product = buildProduct();
    const createRes = await authProductService.create(product);
    const { _id: productId } = await createRes.json();

    const updated = buildProduct();
    const response = await authProductService.update(productId, updated);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Registro alterado com sucesso");

    const getRes = await authProductService.getById(productId);
    const getBody = await getRes.json();
    expect(getBody.nome).toBe(updated.nome);
    expect(getBody.preco).toBe(updated.preco);

    await authProductService.delete(productId);
  });

  test("deve criar produto quando ID não existe", async ({
    authProductService,
  }) => {
    const product = buildProduct();
    const response = await authProductService.update(
      "aaaBBBcccDDDeeFF",
      product
    );
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();

    await authProductService.delete(body._id);
  });
});

test.describe("DELETE /produtos/{id}", () => {
  test("deve deletar produto com sucesso", async ({
    authProductService,
  }) => {
    const product = buildProduct();
    const createRes = await authProductService.create(product);
    const { _id: productId } = await createRes.json();

    const response = await authProductService.delete(productId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Registro excluído com sucesso");

    const getRes = await authProductService.getById(productId);
    expect(getRes.status()).toBe(400);
  });

  test("deve retornar sucesso para ID inexistente", async ({
    authProductService,
  }) => {
    const response = await authProductService.delete("aaaBBBcccDDDeeFF");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Nenhum registro excluído");
  });
});
