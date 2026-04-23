// src/components/Formularios.jsx
// Gera e imprime os 3 formulários com dados do ciclo

export function gerarEImprimirFormularios(dados) {
  const { maquina, lote, ciclo, descricao, composicao, titulo, empresa, cnpj, data, totalFusos, impressoraRede } = dados

  const cicloStr  = String(ciclo).padStart(5, '0')
  const maqCiclo  = `${maquina}${cicloStr}`

  // Torção extraída da descrição
  const torcao = (() => {
    const match = (descricao || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Fusos para formulário 2 — divididos ao meio
  const metade    = Math.ceil(totalFusos / 2)
  const rowsFuso1 = Array.from({ length: metade }, (_, i) =>
    `<tr><td>${i+1}</td><td></td><td></td></tr>`
  ).join('')
  const rowsFuso2 = Array.from({ length: totalFusos - metade }, (_, i) =>
    `<tr><td>${metade+i+1}</td><td></td><td></td></tr>`
  ).join('')

  // QR Code via API pública (sem dependência externa)
  const qrData    = encodeURIComponent(maqCiclo)
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=$  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Formulários — Ciclo ${maqCiclo}</title>
<style>
  /* Reset de Impressão Moderno */
  @page { size: A4 portrait; margin: 0; }
  @page landscape-page { size: A4 landscape; margin: 0; }

  * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Arial', sans-serif; font-size: 9pt; color: #000; background: #fff; }

  .pagina { 
    width: 210mm; 
    height: 297mm; 
    padding: 12mm 15mm;
    page-break-after: always; 
    position: relative;
    overflow: hidden;
  }
  
  /* Página em Paisagem */
  .pagina.landscape { 
    width: 297mm; 
    height: 210mm; 
    padding: 10mm 12mm;
    page-break-before: always;
  }

  /* ── FORM 1 FRENTE ── */
  .f1 { display:flex; flex-direction:column; gap:4mm; height: 100%; }
  .titulo { text-align:center; border-bottom:3px solid #000; padding-bottom:3mm; }
  .titulo h1 { font-size:24pt; font-weight:900; text-transform:uppercase; }
  .titulo h2 { font-size:10pt; font-weight:400; text-transform:uppercase; margin-top:1mm; }
  .campo { border:1.5px solid #000; padding:2mm 3mm; }
  .campo label { font-size:6.5pt; font-weight:700; text-transform:uppercase; color:#333; display:block; margin-bottom:1mm; }
  .campo .v { font-size:11pt; font-weight:700; min-height:5mm; }
  .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:3mm; }
  .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:3mm; }
  .ciclo-box { border:3px solid #000; padding:4mm 5mm; display:flex; justify-content:space-between; align-items:center; }
  .ciclo-box .num { font-size:38pt; font-weight:900; line-height:1; }
  .qr-area { text-align:center; }
  .qr-area img { width:26mm; height:26mm; }
  .checklist { border:1.5px solid #000; }
  .cl-header { background:#000; color:#fff; font-size:8pt; font-weight:700; text-transform:uppercase; padding:2mm 3mm; }
  .cl-body { display:grid; grid-template-columns:repeat(5, 1fr); }
  .cl-item { padding:2mm; border-right:1px solid #000; }
  .cl-item:last-child { border-right:none; }
  .cl-item label { font-size:6pt; font-weight:700; display:block; margin-bottom:1mm; }
  .cl-linha { border-bottom:1px solid #aaa; height:5mm; margin-bottom:1mm; }
  .cl-row2 { border-top:1px solid #000; }
  .cl-span2 { grid-column: span 2; border-right:none; }
  .assinaturas { display:grid; grid-template-columns: repeat(3, 1fr); gap:3mm; }
  .assin { border:1.5px solid #000; padding:2mm 3mm; }
  .assin-linha { border-top:1px solid #000; font-size:6pt; margin-top:8mm; padding-top:1mm; }

  /* ── FORM 1 VERSO ── */
  .grade { border:1.5px solid #000; display:grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .cat { border-right:1.5px solid #000; border-bottom:1.5px solid #000; display:flex; flex-direction:column; }
  .cat:nth-child(4n) { border-right:none; }
  .cat-titulo { font-size:7.5pt; font-weight:700; text-align:center; padding:1.5mm; border-bottom:1px solid #000; background:#f0f0f0; }
  .celulas { display:grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .cel { border-right:1px dashed #ccc; border-bottom:1px dashed #ccc; min-height:7mm; }
  .tabela-rodape { width:100%; border-collapse:collapse; margin-top:4mm; }
  .tabela-rodape th, .tabela-rodape td { border:1px solid #000; padding:2mm; text-align:center; }

  /* ── FORM 2 PAISAGEM ── */
  .f2-cab { display:flex; align-items:center; border-bottom:2.5px solid #000; padding-bottom:2mm; }
  .logo { font-size:14pt; font-weight:900; font-style:italic; color:#cc0000; width:40mm; }
  .f2-titulo { font-size:14pt; font-weight:900; text-transform:uppercase; text-align:center; flex:1; }
  .dados-linha { display:grid; border:1px solid #000; }
  .dl1 { grid-template-columns: 1fr 2fr 1fr 1fr; }
  .dl2 { grid-template-columns: 1fr 1fr; border-top:none; }
  .celula { border-right:1px solid #000; padding:1.5mm 2mm; }
  .tabela-fusos { display:grid; grid-template-columns: 1fr 1fr; gap:4mm; margin-top:2mm; }
  table.fusos { width:100%; border-collapse:collapse; }
  table.fusos th { background:#000; color:#fff; padding:1.5mm; border:1px solid #000; font-size:7pt; }
  table.fusos td { border:1px solid #000; padding:1mm; text-align:center; font-size:8pt; }
</style>
</head>id #ccc; height:5mm; }
</style>
</head>
<body>

<!-- PÁGINA 1 — FRENTE -->
<div class="pagina">
<div class="f1">
  <div class="titulo">
    <h1>Texturizadora</h1>
    <h2>Etiqueta de Ciclo de Produção</h2>
  </div>
  <div class="grid2">
    <div class="campo"><label>Material</label><div class="v">${empresa || ''}</div></div>
    <div class="campo"><label>Lote</label><div class="v">${lote}</div></div>
  </div>
  <div class="campo"><label>Descrição do Material</label><div class="v lg">${descricao}</div></div>
  <div class="ciclo-box">
    <div>
      <div class="lbl">Ciclo:</div>
      <div class="num">${maqCiclo}</div>
    </div>
    <div class="qr-area">
      <img src="${qrUrl}" alt="QR Code ${maqCiclo}" />
      <span>${maqCiclo}</span>
    </div>
  </div>
  <div class="grid3">
    <div class="campo"><label>Máquina</label><div class="v">${maquina}</div></div>
    <div class="campo"><label>Turno</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>Data / Hora Ciclo</label><div class="v">&nbsp;</div></div>
  </div>
  <div class="grid3">
    <div class="campo"><label>Responsável</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>QTDE Bobinas</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>Peso Bruto</label><div class="v">&nbsp;</div></div>
  </div>
  <div class="checklist">
    <div class="cl-header">Controle de Processo</div>
    <div class="cl-body">
      <div class="cl-item"><label>Máquina</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item"><label>Aspira Fio</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item"><label>Confec. Jersei</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item"><label>Batocagem</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item"><label>Liberação AFT</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item cl-row2"><label>Data</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item cl-row2"><label>Hora</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item cl-row2"><label>Escolha</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      <div class="cl-item cl-row2 cl-span2"><label>Responsável</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="assin"><label>Jersey</label><div class="assin-linha">Assinatura</div></div>
    <div class="assin"><label>Destino</label><div class="assin-linha">Assinatura</div></div>
    <div class="assin"><label>Liberação</label><div class="assin-linha">Assinatura</div></div>
  </div>
</div>
</div>

<!-- PÁGINA 2 — VERSO (impressão duplex: no verso da página 1) -->
<div class="pagina">
<div class="f1v-titulo">Defeitos de Escolha Visual</div>
<div class="grade">
  ${['Bobinas com Pêlo','Bobinas Suja','Tubete Amassado','Sem Entrelaçamento',
     'Defeito de Enrolamento','Torção Errada','Tubete Errado','Fio Trançado',
     'Bobinas com 01 Cabo','Bobinas sem Reserva','Bobinas com TMT','Fio Podre',
  ].map(nome => `
  <div class="cat">
    <div class="cat-titulo">${nome}</div>
    <div class="celulas">${Array(16).fill('<div class="cel"></div>').join('')}</div>
  </div>`).join('')}
  <div class="cat ultima"><div class="cat-titulo">Bobinas com Anel</div><div class="celulas">${Array(16).fill('<div class="cel"></div>').join('')}</div></div>
  <div class="cat ultima"><div class="cat-titulo">Bobinas Batidas</div><div class="celulas">${Array(16).fill('<div class="cel"></div>').join('')}</div></div>
  <div class="cat ultima"><div class="cat-titulo">&nbsp;</div><div class="celulas">${Array(16).fill('<div class="cel"></div>').join('')}</div></div>
  <div class="cat ultima instrucao">
    <div class="instrucao">MARCAR NOS CAMPOS<br>NÚMERO DA BOBINA<br>COM DEFEITO.</div>
  </div>
</div>
<table class="tabela-rodape">
  <thead><tr><th style="width:28mm;"></th><th style="width:35mm;">Data</th><th style="width:40mm;">Turma</th><th>Responsável</th></tr></thead>
  <tbody>
    <tr><td>Batocagem</td><td></td><td></td><td></td></tr>
    <tr><td>Escolha</td><td></td><td></td><td></td></tr>
  </tbody>
</table>
<div class="rodape-info">Qualidade\\padronização\\tietê\\formulários\\FO 02 038- Defeitos de Escolha Visual (folha verso)</div>
</div>

<!-- PÁGINA 3 — CLASSIFICAÇÃO VISUAL (PAISAGEM) -->
<div class="pagina landscape" style="transform-origin:top left;">
<div class="f2">
  <div class="f2-cab">
    <div class="logo">Rhodia<span>Poliamida América do Sul</span></div>
    <div class="f2-titulo">Classificação Visual de Afinidade Tintorial</div>
  </div>
  <div class="dados-linha dl1">
    <div class="celula"><label>Maquina</label><div class="cv">${maquina}</div></div>
    <div class="celula"><label>Título</label><div class="cv lg">${descricao}</div></div>
    <div class="celula"><label>Torção</label><div class="cv">${torcao}</div></div>
    <div class="celula"><label>Lote</label><div class="cv">${lote}</div></div>
  </div>
  <div class="dados-linha dl2">
    <div class="celula"><label>DataHoraCiclo</label><div class="cv">&nbsp;</div></div>
    <div class="celula"><label>Obs.</label><div class="cv">&nbsp;</div></div>
  </div>
  <div class="tabela-fusos">
    <table class="fusos">
      <thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead>
      <tbody>${rowsFuso1}</tbody>
    </table>
    <table class="fusos">
      <thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead>
      <tbody>${rowsFuso2}</tbody>
    </table>
  </div>
  <div class="f2-rodape">
    <div class="rd-item"><label>Máq. Jersey</label><div class="resp">&nbsp;</div></div>
    <div class="rd-item"><label>Nº Bobinas</label><div class="resp">&nbsp;</div></div>
    <div class="rd-item"><label>Jersey — Responsável</label><div class="resp">&nbsp;</div><div class="data-l">Data:</div></div>
    <div class="rd-item"><label>Tingimento — Responsável</label><div class="resp">&nbsp;</div><div class="data-l">Data:</div></div>
    <div class="rd-item"><label>Conferente — Responsável</label><div class="resp">&nbsp;</div><div class="data-l">Data:</div></div>
    <div class="rd-item"><label>Liberação — Responsável</label><div class="resp">&nbsp;</div><div class="data-l">Data:</div></div>
  </div>
  <div class="dir">
    <div class="dh">
      <span>DIRECIONAMENTO PARA ESCOLHA/EMBALAGEM</span>
      <span>LIDER RESP.: ___________________________</span>
    </div>
    <div class="obs-line"></div>
    <div class="obs-line"></div>
  </div>
</div>
</div>

<script>
  // Aguarda QR code carregar antes de imprimir
  window.onload = () => {
    const img = document.querySelector('img[alt^="QR"]')
    if (img && !img.complete) {
      img.onload = () => setTimeout(() => window.print(), 300)
      img.onerror = () => setTimeout(() => window.print(), 300)
    } else {
      setTimeout(() => window.print(), 400)
    }
  }
</script>
</body>
</html>`

  // Download automático do arquivo .htm para o monitor local (.bat) processar a impressão na Corradi-Tietê
  const timestamp = Date.now()
  const impressoraSufixo = impressoraRede ? `__${impressoraRede.replace(/[^a-zA-Z0-9\-_]/g, '_')}` : ''
  const filename = `F${cicloStr}_${maquina}_${lote}_${timestamp}${impressoraSufixo}.htm`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 500)
}
