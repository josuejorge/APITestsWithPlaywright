import { test as base } from "@playwright/test";
import { LoginService } from "../services/login.service";
import { UserService } from "../services/user.service";
import { ProductService } from "../services/product.service";
import { CartService } from "../services/cart.service";
import { buildUser } from "../data/user.data";
import { buildProduct } from "../data/product.data";

interface ApiFixtures {
  loginService: LoginService;
  userService: UserService;
  authProductService: ProductService;
  cartContext: {
    cartService: CartService;
    productService: ProductService;
    productId: string;
    userId: string;
    token: string;
  };
}

export const test = base.extend<ApiFixtures>({
  loginService: async ({ request }, use) => {
    await use(new LoginService(request));
  },
  userService: async ({ request }, use) => {
    await use(new UserService(request));
  },
  authProductService: async ({ request }, use) => {
    const user = buildUser({ administrador: "true" });

    const createRes = await request.post("/usuarios", { data: user });
    const { _id: userId } = await createRes.json();

    const loginRes = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const { authorization: token } = await loginRes.json();

    await use(new ProductService(request, token));

    await request.delete(`/usuarios/${userId}`);
  },
  cartContext: async ({ request }, use) => {
    const user = buildUser({ administrador: "true" });

    const createUserRes = await request.post("/usuarios", { data: user });
    const { _id: userId } = await createUserRes.json();

    const loginRes = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const { authorization: token } = await loginRes.json();

    const productService = new ProductService(request, token);
    const product = buildProduct({ quantidade: 100 });
    const createProductRes = await productService.create(product);
    const { _id: productId } = await createProductRes.json();

    const cartService = new CartService(request, token);

    await use({ cartService, productService, productId, userId, token });

    await cartService.cancelPurchase();
    await productService.delete(productId);
    await request.delete(`/usuarios/${userId}`);
  },
});

export { expect } from "@playwright/test";
