# TextLabel — Handoff Técnico Completo
> Documento gerado em 22/04/2026 para continuidade no Cursor / Windsurf / Antigravity

---

## 1. Visão Geral do Projeto

**TextLabel** é um PWA (Progressive Web App) de geração e impressão de etiquetas de produção de fios têxteis, integrado com impressora Zebra ZT230 via ZPL II e formulários impressos em impressora de rede.

**URL produção:** `https://textlabel.vercel.app`  
**Repositório:** GitHub (branch `main` → auto-deploy Vercel)

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + CSS puro |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Authentication (email/senha + Google OAuth) |
| Deploy | Vercel (auto-deploy via GitHub) |
| Impressora etiquetas | Zebra ZT230 ZDesigner 200dpi — protocolo ZPL II |
| Impressora formulários | Corradi-Tietê — IP 10.0.0.104 — rede TCP/IP |
| Monitor local | PowerShell + .bat (roda no PC da impressora) |

---

## 3. Estrutura de Arquivos

```
fiolabel-v3/
├── src/
│   ├── App.jsx                  # Roteamento principal, auth guard
│   ├── main.jsx                 # Entry point
│   ├── components/
│   │   ├── Formularios.jsx      # Gera HTML dos 3 formulários → salva .htm
│   │   ├── InstallBanner.jsx    # Banner PWA install (Android + iOS)
│   │   ├── LabelPreview.jsx     # Preview visual 2×3 das etiquetas
│   │   └── Topbar.jsx           # Navbar com navegação e logout
│   ├── lib/
│   │   ├── firebase.js          # Config Firebase + todas as funções CRUD
│   │   └── zpl.js               # Gerador ZPL + LAYOUT_DEFAULT + download
│   ├── pages/
│   │   ├── CadastroPage.jsx     # CRUD produtos e máquinas (edição inline)
│   │   ├── ConfigPage.jsx       # Config impressora + layout etiqueta (sliders)
│   │   ├── LoginPage.jsx        # Login email/senha + Google + cadastro + reset
│   │   ├── ProducaoPage.jsx     # Dashboard principal — emissão de ciclos
│   │   └── RelatorioPage.jsx    # Histórico de emissões com filtros + CSV
│   └── styles/
│       └── global.css           # Design system completo (tema navy #0a1628)
├── vite.config.js               # Vite + PWA plugin
├── vercel.json                  # SPA redirect config
└── package.json
```

---

## 4. Firebase — Coleções Firestore

```
produtos/          → { cod, desc, comp, titulo, empresa, cnpj, un }
maquinas/          → { cod, desc, fusos, local }
ciclos/{lote}__{maquina} → { valor: number }  ← contador atômico por lote+máquina
emissoes/          → { ciclo, lote, maquina, produto, descricao, composicao,
                        titulo, data, totalFusos, empresa, cnpj,
                        userEmail, userName, criadoEm }
etiquetas/         → uma por fuso de cada emissão
meta/empresa       → { nome, cnpj, vel, dens, offx }
meta/layout        → configurações de fonte/espaçamento (LAYOUT_DEFAULT fallback)
```

**Regras Firestore necessárias:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 5. Variáveis de Ambiente (Vercel + .env)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**⚠️ Problema conhecido:** A `VITE_FIREBASE_API_KEY` no Vercel está desatualizada/inválida.  
**Fix:** Firebase Console → ⚙️ Configurações do projeto → Seus apps → copiar `apiKey` → atualizar no Vercel → Redeploy.

---

## 6. Lógica de Negócio Principal

### 6.1 Ciclo de Produção
- Ciclo é **por Lote + Máquina** (transação atômica Firestore — nunca duplica)
- Cada ciclo gera N etiquetas (1 por fuso)
- Coleção: `ciclos/{lote}__{maquina}` → `{ valor: number }`

### 6.2 Geração ZPL (etiquetas Zebra)
- **Arquivo:** `src/lib/zpl.js`
- **Papel:** rolo 2 colunas × 50mm cada = 100mm total = 786 dots
- **Etiqueta:** 50×30mm = 393×236 dots por coluna
- **Bloco:** 6 etiquetas por arquivo (2 colunas × 3 linhas) = `^LL708`
- **Ordem:** INVERSA (último bloco primeiro) para sequência correta ao desenrolar
- **Offset:** `^LS-24` (compensação física da ZT230)
- **Margens assimétricas:** col esquerda mX+6, col direita mX+16
- **Layout configurável via Firestore** (`meta/layout`) com LAYOUT_DEFAULT como fallback

```javascript
// LAYOUT_DEFAULT atual (src/lib/zpl.js)
{
  fontEmpresa: '20,20', fontCnpj: '18,18', fontDesc: '24,24', fontComp: '24,24',
  fontLabel: '10,9', fontMaq: '22,20', fontCiclo: '22,20', fontFuso: '30,30',
  fontLote: '30,30', colMaq: 135, colCiclo: 95, margemX: 14, margemTop: 8, espacamento: 2
}
```

### 6.3 Download ZPL
- Salvo como `.txt` (evita bloqueio Windows Defender)
- Nome: `C{ciclo}_{maquina}_{lote}.txt`
- O monitor `.bat` detecta `C*.txt` na pasta Downloads

### 6.4 Formulários (3 documentos por ciclo)
- **Arquivo:** `src/components/Formularios.jsx`
- Salvo como `.htm` na pasta Downloads
- Nome: `F{ciclo}_{maquina}_{lote}_{timestamp}.htm`
- Monitor `.bat` detecta `F*.htm` e envia para impressora Corradi-Tietê (10.0.0.104)
- **Pág 1:** Etiqueta de Ciclo (frente) — A4 retrato
- **Pág 2:** Defeitos de Escolha Visual (verso) — A4 retrato
- **Pág 3:** Classificação Visual de Afinidade Tintorial — A4 paisagem
- QR Code gerado via `api.qrserver.com` com código do ciclo
- Dados automáticos: Máquina, Lote, Ciclo, Descrição, Torção (extraída da descrição)
- Campos em branco (preenchimento manual): Data/Hora Ciclo, Turno, Responsável

---

## 7. Monitor Local Windows (MONITOR-USB.bat)

**Localização:** PC conectado à Zebra ZT230  
**Arquivos necessários (mesma pasta):**
- `MONITOR-USB.bat` — loop de monitoramento
- `print_raw.ps1` — envia ZPL via Windows API (winspool.Drv P/Invoke)

**Fluxo:**
```
Downloads/C*.txt → print_raw.ps1 → ZDesigner ZT230-200dpi ZPL (USB002)
Downloads/F*.htm → msedge --headless → Corradi-Tietê (10.0.0.104)
```

**Configurações da impressora Zebra:**
- Porta: USB002
- Suporte bidirecional: DESATIVADO (essencial para copy /b funcionar)
- Driver: ZDesigner ZT230-200dpi ZPL

---

## 8. Fluxo Completo ao Emitir Ciclo

```
1. Usuário preenche: Máquina + Lote + Produto + Data
2. Clica "Emitir Ciclo (N etiquetas)"
3. [Firebase] getNextCicloLoteMaq() → incremento atômico
4. [Firebase] emitirCiclo() → salva em emissoes/ e etiquetas/
5. [ZPL] buildZPLCiclo() → gera blocos de 6 etiquetas em ordem inversa
6. [Download] arquivo C{N}_{MAQ}_{LOTE}.txt → pasta Downloads
7. [Download] arquivo F{N}_{MAQ}_{LOTE}_{ts}.htm → pasta Downloads
8. [Monitor bat] detecta C*.txt → print_raw.ps1 → Zebra (USB002)
9. [Monitor bat] detecta F*.htm → Edge headless → Corradi-Tietê (10.0.0.104)
```

---

## 9. Problemas Conhecidos e Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| Login Google falha `api-key-not-valid` | VITE_FIREBASE_API_KEY inválida no Vercel | Atualizar env var + Redeploy |
| Dados não aparecem no app | Usuário não autenticado / regras Firestore | Verificar regras + login |
| Etiquetas não imprimem | Suporte bidirecional ativo na USB002 | Desmarcar nas propriedades da impressora |
| Texto cortado na etiqueta | Offset físico da ZT230 | Ajustar `offx` em Config (padrão -24) |
| Monitor não detecta arquivos | .bat não está aberto | Abrir MONITOR-USB.bat antes de emitir |
| Formulários não imprimem | Edge não instalado no PC | Verificar caminho do Edge no .bat |

---

## 10. Comandos de Desenvolvimento

```bash
# Instalar dependências
cd fiolabel-v3
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy (via GitHub → Vercel automático)
git add .
git commit -m "descrição"
git push origin main
```

---

## 11. Configurações da Impressora Zebra ZT230

```
Modelo:    ZDesigner ZT230-200dpi ZPL
DPI:       200
Porta:     USB002 (Zebra Technologies — PortaUSB)
Suporte bidirecional: DESATIVADO
Papel:     Rolo 100mm (2 colunas × 50mm)
Etiqueta:  50×30mm por célula
Protocolo: ZPL II
Velocidade padrão: 3 ips
Densidade padrão: 15
Offset X:  -24 dots (^LS-24)
```

---

## 12. Design System

```css
/* Cores principais */
--bg:      #0a1628   /* fundo principal */
--surface: #0f1b2d   /* cards */
--card2:   #152238   /* cards secundários */
--accent:  #00d4ff   /* cyan — cor primária */
--green:   #00e5a0
--orange:  #ff8c42
--yellow:  #ffd700
--red:     #ff4466
--text:    #e2eaf4
--text2:   #8ba4c0
--muted:   #5a7a9a
--border:  #1e3a5f
```

---

## 13. Próximos Passos / Pendências

- [ ] **Fix urgente:** Atualizar VITE_FIREBASE_API_KEY no Vercel
- [ ] Testar impressão completa após fix da API key
- [ ] Validar formulários impressos na Corradi-Tietê
- [ ] Testar com máquinas de 96, 54, 48, 40, 36 fusos
- [ ] Implementar controle de acesso por perfil (admin vs operador)
- [ ] Adicionar relatório de formulários emitidos

