import { test, expect } from "../../src/support/fixtures";
import { buildCart } from "../../src/data/cart.data";
import { validateSchema } from "../../src/schemas/login.schema";
import {
  cartCreatedSchema,
  cartListSchema,
} from "../../src/schemas/cart.schema";

test.describe("POST /carrinhos", () => {
  test("deve cadastrar carrinho com sucesso", async ({ cartContext }) => {
    const { cartService, productId } = cartContext;
    const cart = buildCart([productId], 1);

    const response = await cartService.create(cart);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();

    const schemaErrors = validateSchema(body, cartCreatedSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve rejeitar segundo carrinho para mesmo usuário", async ({
    cartContext,
  }) => {
    const { cartService, productId } = cartContext;

    const first = await cartService.create(buildCart([productId], 1));
    expect(first.status()).toBe(201);

    const second = await cartService.create(buildCart([productId], 1));
    const body = await second.json();

    expect(second.status()).toBe(400);
    expect(body.message).toBe("Não é permitido ter mais de 1 carrinho");
  });

  test("deve rejeitar produto duplicado no carrinho", async ({
    cartContext,
  }) => {
    const { cartService, productId } = cartContext;

    const cart = {
      produtos: [
        { idProduto: productId, quantidade: 1 },
        { idProduto: productId, quantidade: 2 },
      ],
    };

    const response = await cartService.create(cart);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe(
      "Não é permitido possuir produto duplicado"
    );
  });

  test("deve rejeitar produto inexistente", async ({ cartContext }) => {
    const { cartService } = cartContext;
    const cart = buildCart(["aaaBBBcccDDDeeFF"], 1);

    const response = await cartService.create(cart);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Produto não encontrado");
  });

  test("deve rejeitar quantidade maior que estoque", async ({
    cartContext,
  }) => {
    const { cartService, productId } = cartContext;
    const cart = buildCart([productId], 99999);

    const response = await cartService.create(cart);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe(
      "Produto não possui quantidade suficiente"
    );
  });

  test("deve falhar sem token de autenticação", async ({ request }) => {
    const response = await request.post("/carrinhos", {
      data: buildCart(["aaaBBBcccDDDeeFF"], 1),
    });
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toContain(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });
});

test.describe("GET /carrinhos", () => {
  test("deve listar carrinhos", async ({ request }) => {
    const response = await request.get("/carrinhos");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.carrinhos)).toBe(true);

    const schemaErrors = validateSchema(body, cartListSchema);
    expect(schemaErrors).toEqual([]);
  });

  test("deve buscar carrinho por ID", async ({ cartContext }) => {
    const { cartService, productId, userId } = cartContext;

    const createRes = await cartService.create(buildCart([productId], 2));
    const { _id: cartId } = await createRes.json();

    const response = await cartService.getById(cartId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body._id).toBe(cartId);
    expect(body.idUsuario).toBe(userId);
    expect(body.produtos).toHaveLength(1);
    expect(body.produtos[0].idProduto).toBe(productId);
    expect(body.produtos[0].quantidade).toBe(2);
    expect(body.precoTotal).toBeGreaterThan(0);
    expect(body.quantidadeTotal).toBe(2);
  });

  test("deve retornar erro para ID inexistente", async ({ request }) => {
    const response = await request.get("/carrinhos/aaaBBBcccDDDeeFF");
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Carrinho não encontrado");
  });
});

test.describe("DELETE /carrinhos/concluir-compra", () => {
  test("deve concluir compra e excluir carrinho", async ({
    cartContext,
  }) => {
    const { cartService, productId } = cartContext;

    await cartService.create(buildCart([productId], 1));

    const response = await cartService.completePurchase();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Registro excluído com sucesso");
  });

  test("deve retornar mensagem quando não há carrinho", async ({
    cartContext,
  }) => {
    const { cartService } = cartContext;

    const response = await cartService.completePurchase();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe(
      "Não foi encontrado carrinho para esse usuário"
    );
  });

  test("deve falhar sem token", async ({ request }) => {
    const response = await request.delete("/carrinhos/concluir-compra");
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toContain(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });
});

test.describe("DELETE /carrinhos/cancelar-compra", () => {
  test("deve cancelar compra e restaurar estoque", async ({
    cartContext,
  }) => {
    const { cartService, productService, productId } = cartContext;
    const quantity = 3;

    const beforeRes = await productService.getById(productId);
    const beforeStock = (await beforeRes.json()).quantidade;

    await cartService.create(buildCart([productId], quantity));

    const midRes = await productService.getById(productId);
    const midStock = (await midRes.json()).quantidade;
    expect(midStock).toBe(beforeStock - quantity);

    const response = await cartService.cancelPurchase();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe(
      "Registro excluído com sucesso. Estoque dos produtos reabastecido"
    );

    const afterRes = await productService.getById(productId);
    const afterStock = (await afterRes.json()).quantidade;
    expect(afterStock).toBe(beforeStock);
  });

  test("deve retornar mensagem quando não há carrinho", async ({
    cartContext,
  }) => {
    const { cartService } = cartContext;

    const response = await cartService.cancelPurchase();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe(
      "Não foi encontrado carrinho para esse usuário"
    );
  });

  test("deve falhar sem token", async ({ request }) => {
    const response = await request.delete("/carrinhos/cancelar-compra");
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.message).toContain(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });
});
