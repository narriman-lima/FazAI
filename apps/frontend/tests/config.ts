import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

/**
 * Configuração de variáveis de ambiente para testes
 */
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

export const testConfig = {
  // Configurações para testes com Clerk
  auth: {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },

  // URLs
  app: {
    url: process.env.VITE_APP_URL || "http://localhost:5173",
    apiUrl: process.env.API_URL || "http://localhost:3001/api/v1",
  },

  // Usuário de teste
  testUser: {
    email: process.env.TEST_USER_EMAIL || "test@example.com",
    password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  },

  // Clerk instance
  clerk: {
    frontendApi:
      process.env.CLERK_FRONTEND_API ||
      "https://your-clerk-instance.clerk.accounts.com",
  },
};

export const config = defineConfig({});

export default config;
