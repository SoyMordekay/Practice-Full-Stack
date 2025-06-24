# 🛒 Full Stack Technical - Backend

Backend API for a credit card payment onboarding and product store, built with **NestJS**, **TypeScript**, **TypeORM** and **PostgreSQL**.

---

## 📚 API Documentation

- Interactive Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Import the Postman collection from `/docs` (if available).

---

## 🚀 Tech Stack

- [NestJS](https://nestjs.com/) (Node.js framework)
- TypeScript
- TypeORM
- PostgreSQL
- Jest (unit testing)
- Wompi API (payment gateway)

---

## ⚙️ Setup & Installation

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```


---

## ▶️ Running the App

- **Development:**
  ```bash
  npm run start:dev
  ```
- **Production:**
  ```bash
  npm run build
  npm run start:prod
  ```

---

## 🧪 Running Tests & Coverage

- **Unit tests:**
  ```bash
  npm run test
  ```
- **Test coverage:**
  ```bash
  npm run test:cov
  ```
  > Aim for **80%+** coverage for full points.

---

## 📚 API Endpoints

| Method | Endpoint                                      | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | `/payments`                                   | Process a new payment              |
| GET    | `/payments/:transactionId/status`             | Get payment transaction status     |
| GET    | `/products`                                   | List all products                  |
| ...    | ...                                           | ...                                |


---

## 🔒 Security

- Uses [helmet](https://www.npmjs.com/package/helmet) for security headers.
- Follows OWASP recommendations for API security.
- Sensitive data is never logged.

---

## 🧩 Hexagonal Architecture

- Domain, Application, Infrastructure layers.
- Ports & Adapters pattern for easy testing and extension.

---

## 👤 Author

- Julian Andres Rengifo Giraldo
- [LinkedIn](https://www.linkedin.com/in/julian-andres-rengifo-giraldo-b883b317a/) | [GitHub](https://github.com/SoyMordekay/Practice-Full-Stack)

---
