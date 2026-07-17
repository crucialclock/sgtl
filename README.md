# SGTL

Aplicativo do SGTL feito com React, TypeScript e Tailwind, preparado para Web e Desktop com Tauri.

## Requisitos

- Node.js
- Rust
- API do SGTL rodando

## Configuracao

Crie o arquivo `.env` com base no `.env.example`.

Exemplo:

```env
VITE_API_URL=http://127.0.0.1:3333
VITE_APP_NAME=SGTL
VITE_APP_VERSION=0.1.0
VITE_BASE_PATH=./
```

## Rodar em desenvolvimento

Instale as dependencias:

```bash
npm install
```

Rode somente o frontend web:

```bash
npm run dev
```

Rode como aplicativo desktop:

```bash
npm run tauri dev
```

Gere o build web para GitHub Pages:

```bash
npm run build
```

`VITE_BASE_PATH=./` mantém os assets relativos e facilita publicar o conteúdo de `dist/` no GitHub Pages sem alterar código.

## Acesso padrao

```txt
E-mail: admin@sgtl.local
Senha: admin12345
```

## Scripts

```bash
npm run dev
npm run tauri dev
npm run typecheck
npm run build
```

## Observacoes

- O frontend consome a API configurada em `VITE_API_URL`.
- Configurações compartilhadas ficam centralizadas em `src/config/app-config.ts`.
- A camada `src/platform/` isola diferenças entre navegador e Tauri.
- O arquivo `.env` nao deve ser versionado.
- Use `.env.example` como referencia para novas instalacoes.
