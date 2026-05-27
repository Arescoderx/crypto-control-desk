# Crypto Control Desk

Sistema web para simular controle de carteira cripto, estrategias de trading, bot automatico, sinais externos, historico e relatorios.

O projeto usa React, TypeScript, Vite, TailwindCSS, shadcn/ui e Recharts. Os dados ficam salvos no navegador em JSON usando `localStorage`.

## Requisitos

Antes de comecar, instale:

- Node.js 18 ou superior
- npm
- Git

Para conferir se esta tudo instalado:

```bash
node -v
npm -v
git --version
```

## Como rodar o projeto

### 1. Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta do projeto:

```bash
cd crypto-control-desk
```

### 2. Instalar dependencias

```bash
npm install
```

Se estiver usando PowerShell no Windows e aparecer erro de politica de execucao, use:

```bash
npm.cmd install
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

No Windows, se o PowerShell bloquear o comando:

```bash
npm.cmd run dev
```

Depois abra no navegador o endereco mostrado no terminal. Normalmente sera:

```text
http://localhost:5173
```

ou:

```text
http://127.0.0.1:5173
```

## Scripts disponiveis

Rodar o projeto:

```bash
npm run dev
```

Gerar build de producao:

```bash
npm run build
```

Visualizar o build:

```bash
npm run preview
```

Rodar testes:

```bash
npm run test
```

Rodar lint:

```bash
npm run lint
```

## Como usar para apresentacao

### 1. Abrir o sistema

Depois de rodar `npm run dev`, abra:

```text
http://localhost:5173/dashboard
```

### 2. Configurar saldo e moeda

Va em **Configuracoes**:

- escolha `USD` ou `BRL`
- ajuste o saldo inicial se quiser
- use **Exportar JSON** para salvar os dados
- use **Importar JSON** para restaurar dados depois

### 3. Criar estrategia demo

Va em **Estrategias** e configure uma estrategia para demonstracao:

- Moedas: marque `BTC`, `ETH`, `BNB`, `DOGE`, `ADA` e `SOL`
- Risco: `0.1`
- Min Change: `0`
- TP: `0.1`
- SL: `0.1`
- Max Allocation: `0.3`
- Min Trade: `10`

Quando `Min Change` esta em `0`, o bot entra em modo demo e opera com mais frequencia para facilitar a apresentacao.

### 4. Ligar o bot

Va em **Dashboard** e clique em **Bot Inativo** para ativar.

O bot roda a cada 2 segundos e usa o preco mais recente salvo no sistema. Os precos das moedas sao atualizados a cada 30 segundos quando a API esta disponivel. Se a API falhar, o sistema usa cache/fallback para continuar funcionando.

### 5. Ver compras e vendas

Acompanhe:

- **Dashboard**: resumo e trades recentes
- **Historico**: lista de operacoes
- **Relatorios**: graficos, tabelas e impressao/PDF

## Relatorios

Na aba **Relatorios** voce pode:

- ver patrimonio total
- ver total comprado e vendido
- acompanhar P&L realizado
- visualizar grafico de evolucao do portfolio
- visualizar grafico de compras e vendas por ativo
- imprimir a pagina
- exportar trades em CSV

Para gerar PDF, clique em **Imprimir** e escolha "Salvar como PDF" no navegador.

## Dados do sistema

Os dados ficam no navegador em `localStorage`, no formato JSON. Isso inclui:

- saldo
- moeda escolhida
- carteira
- trades
- estrategias
- sinais externos
- historico do portfolio
- estado do bot

Se limpar os dados do navegador, os dados do sistema tambem podem ser apagados. Use **Exportar JSON** antes de limpar o navegador.

## Observacoes

Este sistema e um simulador para estudo/apresentacao. Ele nao executa ordens reais em corretoras e nao deve ser usado como recomendacao financeira.
