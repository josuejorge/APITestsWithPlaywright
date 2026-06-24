export const userSchema = {
  nome: "string",
  email: "string",
  password: "string",
  administrador: "string",
  _id: "string",
};

export const userCreatedSchema = {
  message: "string",
  _id: "string",
};

export const userListSchema = {
  quantidade: "number",
  usuarios: "object",
};
