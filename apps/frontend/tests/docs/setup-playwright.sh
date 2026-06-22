#!/bin/bash

# 🚀 Script de Setup Rápido - Playwright + Clerk Testing
# Uso: ./setup-playwright.sh

set -e  # Exit on error

echo "🎭 Inicializando Playwright + Clerk Testing Setup..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FRONTEND_DIR="apps/frontend"

# 1. Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Não está na raiz do projeto FazAI${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Localização correta: $(pwd)${NC}"
echo ""

# 2. Criar .env.test se não existir
if [ ! -f "$FRONTEND_DIR/.env.test" ]; then
    echo -e "${YELLOW}📝 Criando .env.test...${NC}"
    cp "$FRONTEND_DIR/.env.test.example" "$FRONTEND_DIR/.env.test"
    echo -e "${GREEN}✅ .env.test criado${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  PRÓXIMO PASSO: Editar $FRONTEND_DIR/.env.test com suas credenciais${NC}"
    echo -e "${YELLOW}   - VITE_CLERK_PUBLISHABLE_KEY${NC}"
    echo -e "${YELLOW}   - CLERK_SECRET_KEY${NC}"
    echo -e "${YELLOW}   - TEST_USER_EMAIL${NC}"
    echo -e "${YELLOW}   - TEST_USER_PASSWORD${NC}"
    echo ""
else
    echo -e "${GREEN}✅ .env.test já existe${NC}"
    echo ""
fi

# 3. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install > /dev/null 2>&1 || true
cd "$FRONTEND_DIR"
npm install > /dev/null 2>&1 || true
cd ../..
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 4. Validar variáveis de ambiente
echo -e "${YELLOW}🔍 Validando configuração...${NC}"
MISSING_VARS=0

for var in VITE_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY TEST_USER_EMAIL TEST_USER_PASSWORD; do
    if grep -q "^$var=" "$FRONTEND_DIR/.env.test" 2>/dev/null; then
        VALUE=$(grep "^$var=" "$FRONTEND_DIR/.env.test" | cut -d'=' -f2)
        if [ -z "$VALUE" ] || [ "$VALUE" = "seu_valor_aqui" ] || [ "$VALUE" = "pk_test_seu_publishable_key_aqui" ]; then
            echo -e "${RED}  ❌ $var: NÃO CONFIGURADO${NC}"
            MISSING_VARS=$((MISSING_VARS + 1))
        else
            echo -e "${GREEN}  ✅ $var: OK${NC}"
        fi
    else
        echo -e "${RED}  ❌ $var: NÃO ENCONTRADO${NC}"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

echo ""

if [ $MISSING_VARS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Variáveis de ambiente faltando!${NC}"
    echo -e "${YELLOW}   Edite $FRONTEND_DIR/.env.test com as credenciais do Clerk${NC}"
    echo ""
    echo -e "${YELLOW}Como obter as credenciais:${NC}"
    echo "   1. Ir para https://dashboard.clerk.com"
    echo "   2. Home > Configure > API Keys"
    echo "   3. Copiar VITE_CLERK_PUBLISHABLE_KEY e CLERK_SECRET_KEY"
    echo "   4. Ir para Users e criar um usuário de teste"
    echo "   5. Adicionar email e senha em .env.test"
    echo ""
else
    echo -e "${GREEN}✅ Todas as variáveis configuradas!${NC}"
    echo ""
fi

# 5. Mostrar próximos passos
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Setup Concluído!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo "1️⃣  Editar arquivo de configuração:"
echo "   nano $FRONTEND_DIR/.env.test"
echo ""
echo "2️⃣  Iniciar a aplicação (em um terminal):"
echo "   npm run dev"
echo ""
echo "3️⃣  Rodar testes (em outro terminal):"
echo "   cd $FRONTEND_DIR"
echo "   npm run test:e2e"
echo ""
echo "4️⃣  Ver relatório de testes:"
echo "   npm run test:e2e:report"
echo ""
echo "Documentação:"
echo "   📖 Guia Completo: $FRONTEND_DIR/PLAYWRIGHT_TESTING.md"
echo "   🎯 Boas Práticas: $FRONTEND_DIR/PLAYWRIGHT_BEST_PRACTICES.md"
echo "   ✅ Checklist: PLAYWRIGHT_SETUP_CHECKLIST.md"
echo ""
