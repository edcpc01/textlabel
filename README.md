# TextLabel v3 — Sistema de Etiquetas de Produção de Fios

> Tema: Façonagem Rhodia · Stack: React + Vite + Firebase + Vercel · PWA

---

## Stack

| Camada       | Tecnologia |
|---|---|
| Frontend     | React 18 + Vite |
| Estilo       | CSS puro (tema Façonagem) |
| Backend      | Firebase Firestore + Auth |
| Deploy       | Vercel (GitHub auto-deploy) |
| Impressora   | Zebra ZT230 · 200dpi · ZPL II · 50×30mm |
| PWA          | vite-plugin-pwa (offline + instalável) |

---

## 1 — Firebase: criar projeto

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. **Criar projeto** → nome: `textlabel`
3. **Firestore** → Criar banco → modo **Produção** → região `southamerica-east1`
4. **Authentication** → Ativar provedor **E-mail/Senha**
5. **Authentication → Users → Add user** → crie o(s) usuário(s)
6. **Project Settings → Your apps → Web** → Registre o app → copie as credenciais

### Regras de segurança Firestore (Cole em Firestore → Rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Documento inicial do ciclo (Firestore → coleção `meta` → doc `ciclo`)
```json
{ "valor": 1 }
```

---

## 2 — Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com as credenciais copiadas do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=textlabel.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=textlabel
VITE_FIREBASE_STORAGE_BUCKET=textlabel.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 3 — Rodar localmente

```bash
npm install
npm run dev
# Abra http://localhost:5173
```

---

## 4 — GitHub

```bash
git init
git add .
git commit -m "feat: TextLabel v3 — Firebase + Façonagem theme"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/textlabel.git
git push -u origin main
```

---

## 5 — Vercel (deploy automático)

1. [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório GitHub
2. Framework: **Vite** (detectado automaticamente)
3. **Environment Variables** → adicione todas as `VITE_FIREBASE_*` do seu `.env.local`
4. **Deploy** → pronto!

A cada `git push main` o Vercel faz deploy automático.

---

## 6 — Multi-dispositivo

O ciclo global fica em `Firestore/meta/ciclo` com **transação atômica** — garante que dois dispositivos nunca emitam o mesmo número, mesmo em paralelo.

Cada estação acessa `https://seu-app.vercel.app` no browser e faz login com seu usuário Firebase.

---

## 7 — Integração com impressora Zebra

### Opção A — Zebra BrowserPrint (automático)
1. Instale o **Zebra Browser Print** na máquina com a impressora conectada
2. Download: https://www.zebra.com/us/en/support-downloads/printer-software/browser-print.html
3. O app detecta automaticamente e envia o ZPL direto à impressora

### Opção B — Download .zpl
Sem BrowserPrint, o sistema baixa o arquivo `.zpl` nomeado como:
`C000042_F12_OP-2024-001.zpl`

Envie para a impressora via USB usando qualquer utilitário ZPL.

---

## Estrutura do projeto

```
textlabel/
├── src/
│   ├── App.jsx                  # Roteamento + Auth guard
│   ├── main.jsx
│   ├── components/
│   │   ├── Topbar.jsx           # Nav + ciclo global realtime
│   │   └── LabelPreview.jsx     # Preview visual 2× da etiqueta
│   ├── lib/
│   │   ├── firebase.js          # Firestore + Auth helpers
│   │   └── zpl.js               # Gerador ZPL (ZT230 200dpi 50×30mm)
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── ProducaoPage.jsx     # Emissão + preview + ZPL
│   │   ├── CadastroPage.jsx     # Produtos, máquinas, operadores
│   │   ├── RelatorioPage.jsx    # Histórico + filtros + CSV
│   │   └── ConfigPage.jsx       # Empresa + impressora + ciclo manual
│   └── styles/
│       └── global.css           # Tema Façonagem Rhodia completo
├── index.html
├── vite.config.js               # Vite + PWA plugin
├── vercel.json                  # SPA routing
├── .env.example
└── package.json
```

---

## Campos da etiqueta (50×30mm · ZPL II · Code 128)

| Campo | Fonte |
|---|---|
| Número do Ciclo | Firestore transação atômica |
| Lote / Ordem de Produção | Formulário |
| Data de Fabricação | Formulário |
| Descrição do Produto | Cadastro (auto-fill) |
| Número do Fuso (posição) | Formulário |
| Máquina | Cadastro |
| Composição | Cadastro (auto-fill) |
| Operador + Turno | Cadastro |
| Código de Barras | Code 128: `PRODUTO-LOTE-C000042-F12` |
