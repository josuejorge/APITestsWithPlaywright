import { faker } from "@faker-js/faker";

export interface UserPayload {
  nome: string;
  email: string;
  password: string;
  administrador: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function buildUser(
  overrides?: Partial<UserPayload>
): UserPayload {
  return {
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 10 }),
    administrador: "true",
    ...overrides,
  };
}

export function buildLogin(
  overrides?: Partial<LoginPayload>
): LoginPayload {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 10 }),
    ...overrides,
  };
}
