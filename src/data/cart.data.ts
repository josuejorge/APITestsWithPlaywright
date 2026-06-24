export interface CartItemPayload {
  idProduto: string;
  quantidade: number;
}

export interface CartPayload {
  produtos: CartItemPayload[];
}

export function buildCart(productIds: string[], quantity = 1): CartPayload {
  return {
    produtos: productIds.map((idProduto) => ({
      idProduto,
      quantidade: quantity,
    })),
  };
}
