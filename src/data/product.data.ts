import { faker } from "@faker-js/faker";

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export function buildProduct(
  overrides?: Partial<ProductPayload>
): ProductPayload {
  return {
    nome: faker.commerce.productName(),
    preco: faker.number.int({ min: 1, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 0, max: 999 }),
    ...overrides,
  };
}
