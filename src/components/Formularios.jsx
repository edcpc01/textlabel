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
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Formulários — Ciclo ${maqCiclo}</title>
<style>
  /* Forçar frente/verso na mesma folha */
  @page p1front { size: A4 portrait; margin: 12mm 14mm; }
  @page p1back  { size: A4 portrait; margin: 12mm 14mm; }
  @page p2      { size: A4 landscape; margin: 8mm 10mm; }

  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial Narrow', Arial, sans-serif; font-size:9pt; color:#000; }

  .pagina { width:100%; min-height:100vh; page-break-after:always; display:flex; flex-direction:column; }
  .pagina:last-child { page-break-after:auto; }
  .landscape { page-break-before: always; }

  /* ── FORM 1 FRENTE ── */
  .f1 { display:flex; flex-direction:column; gap:4mm; flex:1; }
  .titulo { text-align:center; border-bottom:3px solid #000; padding-bottom:3mm; }
  .titulo h1 { font-size:26pt; font-weight:900; text-transform:uppercase; letter-spacing:2px; }
  .titulo h2 { font-size:11pt; font-weight:400; letter-spacing:3px; text-transform:uppercase; margin-top:1mm; }
  .campo { border:1.5px solid #000; padding:2mm 3mm; }
  .campo label { font-size:6.5pt; font-weight:700; text-transform:uppercase; color:#555; display:block; margin-bottom:1mm; }
  .campo .v { font-size:12pt; font-weight:700; min-height:6mm; }
  .campo .v.lg { font-size:15pt; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:3mm; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:3mm; }
  .ciclo-box { border:3px solid #000; padding:4mm 5mm; display:flex; justify-content:space-between; align-items:center; }
  .ciclo-box .num { font-size:40pt; font-weight:900; letter-spacing:1px; line-height:1; }
  .ciclo-box .lbl { font-size:10pt; font-weight:700; margin-bottom:2mm; }
  .qr-area { display:flex; flex-direction:column; align-items:center; gap:1mm; }
  .qr-area img { width:28mm; height:28mm; }
  .qr-area span { font-size:6.5pt; color:#555; }
  .checklist { border:1.5px solid #000; }
  .cl-header { background:#333; color:#fff; font-size:8pt; font-weight:700; text-transform:uppercase; padding:2mm 3mm; }
  .cl-body { display:grid; grid-template-columns:repeat(5,1fr); }
  .cl-item { padding:2mm 2.5mm; border-right:1px solid #000; }
  .cl-item:last-child { border-right:none; }
  .cl-item label { font-size:6.5pt; font-weight:700; display:block; margin-bottom:1.5mm; }
  .cl-linha { border-bottom:1px solid #ccc; height:5.5mm; margin-bottom:1.5mm; }
  .cl-row2 { border-top:1px solid #000; }
  .cl-span2 { grid-column:span 2; border-right:none; }
  .assinaturas { display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; }
  .assin { border:1.5px solid #000; padding:2mm 3mm; }
  .assin label { font-size:6.5pt; font-weight:700; text-transform:uppercase; display:block; margin-bottom:10mm; }
  .assin-linha { border-top:1px solid #000; font-size:6.5pt; padding-top:1mm; color:#555; }

  /* ── FORM 1 VERSO ── */
  .f1v-titulo { text-align:center; font-size:16pt; font-weight:900; text-transform:uppercase; letter-spacing:1px; margin-bottom:4mm; }
  .grade { border:1.5px solid #000; display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
  .cat { border-right:1.5px solid #000; border-bottom:1.5px solid #000; display:flex; flex-direction:column; }
  .cat:nth-child(4n) { border-right:none; }
  .cat.ultima { border-bottom:none; }
  .cat-titulo { font-size:7.5pt; font-weight:700; text-transform:uppercase; text-align:center; padding:1.5mm; border-bottom:1px solid #000; background:#fafafa; }
  .celulas { display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
  .cel { border-right:1px dashed #ccc; border-bottom:1px dashed #ccc; min-height:8mm; }
  .cel:nth-child(4n) { border-right:none; }
  .instrucao { display:flex; align-items:center; justify-content:center; text-align:center; font-size:8.5pt; font-weight:700; padding:3mm; line-height:1.6; background:#f5f5f5; border-right:none; }
  .tabela-rodape { width:100%; border-collapse:collapse; margin-top:4mm; }
  .tabela-rodape th { border:1px solid #000; padding:2mm 3mm; font-size:8pt; font-weight:700; background:#fafafa; text-align:center; }
  .tabela-rodape td { border:1px solid #000; padding:2mm 3mm; font-size:9pt; font-weight:700; min-height:9mm; vertical-align:middle; }
  .rodape-info { margin-top:3mm; font-size:7pt; font-style:italic; color:#666; }

  /* ── FORM 2 PAISAGEM ── */
  .f2 { display:flex; flex-direction:column; gap:3mm; flex:1; }
  .f2-cab { display:flex; align-items:center; border-bottom:2.5px solid #000; padding-bottom:2.5mm; }
  .logo { font-size:14pt; font-weight:900; font-style:italic; color:#cc0000; min-width:38mm; }
  .logo span { font-size:6.5pt; display:block; color:#666; font-style:normal; font-weight:400; }
  .f2-titulo { font-size:15pt; font-weight:900; text-transform:uppercase; text-align:center; flex:1; }
  .dados-linha { display:grid; gap:0; border:1px solid #000; }
  .dl1 { grid-template-columns:1fr 2fr 1fr 1fr; }
  .dl2 { grid-template-columns:1fr 1fr; border-top:none; margin-top:-1px; }
  .celula { border-right:1px solid #000; padding:1.5mm 2mm; display:flex; flex-direction:column; }
  .celula:last-child { border-right:none; }
  .celula label { font-size:6.5pt; font-weight:700; color:#444; margin-bottom:.5mm; }
  .celula .cv { font-size:9.5pt; font-weight:700; min-height:5.5mm; }
  .celula .cv.lg { font-size:12pt; }
  .tabela-fusos { display:grid; grid-template-columns:1fr 1fr; gap:4mm; flex:1; }
  table.fusos { width:100%; border-collapse:collapse; font-size:8pt; }
  table.fusos th { background:#222; color:#fff; padding:1.5mm 2mm; text-align:center; border:1px solid #000; font-size:7.5pt; font-weight:700; }
  table.fusos td { border:1px solid #000; padding:.8mm 2mm; height:5mm; text-align:center; vertical-align:middle; }
  table.fusos td:first-child { font-weight:700; background:#f5f5f5; width:14mm; }
  .f2-rodape { display:grid; grid-template-columns:45px 50px 1fr 1fr 1fr 1fr; gap:0; border:1px solid #000; }
  .rd-item { border-right:1px solid #000; padding:2mm 2mm; }
  .rd-item:last-child { border-right:none; }
  .rd-item label { font-size:6.5pt; font-weight:700; display:block; text-transform:uppercase; }
  .rd-item .resp { font-size:7pt; min-height:8mm; }
  .rd-item .data-l { font-size:6.5pt; color:#555; border-top:1px solid #ccc; padding-top:1mm; margin-top:1mm; }
  .dir { border:1px solid #000; padding:2mm 3mm; }
  .dir .dh { display:flex; gap:12mm; font-size:8pt; font-weight:700; margin-bottom:2mm; }
  .obs-line { border-bottom:1px solid #ccc; height:5mm; }
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
