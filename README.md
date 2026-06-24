# API Tests with Playwright - ServeRest

Projeto de automação de testes de API utilizando [Playwright](https://playwright.dev/) para a plataforma [ServeRest](https://serverest.dev/?lang=pt-BR#/).

O ServeRest é uma API REST gratuita que simula uma loja virtual, ideal para estudos e prática de testes de API.

## Endpoints cobertos

| Módulo | Método | Endpoint | Testes |
|---|---|---|---|
| **Login** | POST | `/login` | 9 |
| **Usuários** | GET, POST, PUT, DELETE | `/usuarios` | 15 |
| **Produtos** | GET, POST, PUT, DELETE | `/produtos` | 12 |
| **Carrinhos** | GET, POST, DELETE | `/carrinhos` | 15 |
| | | **Total** | **51** |

## Estrutura do projeto

```
├── src/
│   ├── data/            # Builders com dados dinâmicos (Faker)
│   ├── schemas/         # Validação de contrato das respostas
│   ├── services/        # Camada de serviço (encapsula chamadas HTTP)
│   └── support/         # Fixtures customizadas do Playwright
├── tests/
│   ├── login/           # Testes de autenticação
│   ├── users/           # Testes de CRUD de usuários
│   ├── products/        # Testes de CRUD de produtos
│   └── carts/           # Testes de carrinho de compras
├── playwright.config.ts
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)

## Instalação

```bash
git clone <url-do-repositorio>
npm install
```

## Como rodar

```bash
# Rodar todos os testes
npm test

# Rodar por módulo
npm run test:login
npm run test:users
npm run test:products
npm run test:carts

# Abrir relatório HTML após execução
npm run test:report
```

## Tecnologias utilizadas

- [Playwright Test](https://playwright.dev/docs/api-testing) - Framework de testes
- [Faker.js](https://fakerjs.dev/) - Geração de dados dinâmicos
