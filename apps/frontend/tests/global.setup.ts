import { FullConfig } from "@playwright/test";

/**
 * Global setup para preparar o ambiente de testes
 * Pode ser usado para:
 * - Fazer login uma vez e reusar credenciais em cookies
 * - Criar dados de teste no backend
 * - Preparar o banco de dados
 */
async function globalSetup(_config: FullConfig) {
  console.log("🚀 Global Setup: Iniciando preparação do ambiente de testes...");

  const appUrl = process.env.VITE_APP_URL || "http://localhost:5173";

  // Verificar se a aplicação está disponível
  try {
    const response = await fetch(appUrl);
    if (!response.ok) {
      throw new Error(`Aplicação retornou status ${response.status}`);
    }
    console.log("✅ Aplicação está acessível em:", appUrl);
  } catch (error) {
    console.error("❌ Erro ao acessar a aplicação:", error);
    console.error(
      "   Certifique-se de que a aplicação está rodando com: npm run dev",
    );
    throw error;
  }

  // Verificar se o backend está disponível
  const apiUrl = process.env.API_URL || "http://localhost:3001/api/v1";
  try {
    const response = await fetch(`${apiUrl}/health`);
    if (!response.ok) {
      console.warn(
        "⚠️  Backend pode estar indisponível, status:",
        response.status,
      );
    } else {
      console.log("✅ Backend está acessível em:", apiUrl);
    }
  } catch (error) {
    console.warn(
      "⚠️  Não foi possível conectar ao backend. Alguns testes podem falhar.",
    );
    console.warn("   Erro:", (error as Error).message);
  }

  // Verificar variáveis de ambiente necessárias
  const requiredEnvVars = [
    "VITE_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "TEST_USER_EMAIL",
    "TEST_USER_PASSWORD",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingEnvVars.length > 0) {
    console.warn("⚠️  Variáveis de ambiente faltando:");
    missingEnvVars.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
    console.warn(
      "   Certifique-se de que .env.test está configurado corretamente.",
    );
  }

  console.log("✅ Setup global concluído!");
}

export default globalSetup;
