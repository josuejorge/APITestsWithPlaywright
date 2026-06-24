export const productSchema = {
  nome: "string",
  preco: "number",
  descricao: "string",
  quantidade: "number",
  _id: "string",
};

export const productCreatedSchema = {
  message: "string",
  _id: "string",
};

export const productListSchema = {
  quantidade: "number",
  produtos: "object",
};
