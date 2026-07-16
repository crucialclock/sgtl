# SGTL Desktop

Aplicativo desktop do SGTL feito com Tauri, React, TypeScript e Tailwind.

## Requisitos

- Node.js
- Rust
- API do SGTL rodando

## Configuracao

Crie o arquivo `.env` com base no `.env.example`.

Exemplo:

```env
VITE_API_URL=http://127.0.0.1:3333
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
- O arquivo `.env` nao deve ser versionado.
- Use `.env.example` como referencia para novas instalacoes.
