# Offsetly — Game Data Explorer

Painel educacional em React + Vite para consultar dados e versões de APIs públicas de CS2, Fortnite, Rainbow Six Siege, Rust, Roblox, FiveM, VALORANT e PUBG.

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy na Vercel

Importe este repositório na Vercel. Use o preset Vite, `npm run build` e `dist` como diretório de saída. A função `api/offsets.js` será publicada como função serverless.

## API

A interface consulta `/api/offsets?game=cs2&type=current`. Tipos: `current`, `builds` e `build&id=...`. As respostas dependem da disponibilidade e do formato das APIs de terceiros; o painel não inventa valores quando uma fonte falha.

## Jogos

CS2, Fortnite, Rainbow Six Siege, Rust, Roblox, FiveM, VALORANT e PUBG.
