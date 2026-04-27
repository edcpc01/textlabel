// src/pages/RelatorioPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { Download, Printer, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { onEmissoes, onMaquinas, onProdutos, getEtiquetasPorEmissao, getImpressoraNilit, getEmpresa, getLayout, getLayoutNilit } from '../lib/firebase'
import { buildZPLCiclo, buildZPLNilitCiclo, printZPL } from '../lib/zpl'

function fmtTs(ts) {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('pt-BR')
}
function fmtDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().split('T')[0]
}

export function RelatorioPage() {
  const [emissoes,  setEmissoes]  = useState([])
  const [maquinas,  setMaquinas]  = useState([])
  const [produtos,  setProdutos]  = useState([])
  const [expanded,  setExpanded]  = useState({})
  const [filtros, setFiltros] = useState({ de: '', ate: '', maquina: '', produto: '', lote: '' })

  useEffect(() => {
    const u1 = onEmissoes(setEmissoes)
    const u2 = onMaquinas(setMaquinas)
    const u3 = onProdutos(setProdutos)
    return () => { u1(); u2(); u3() }
  }, [])

  const filtradas = useMemo(() => {
    return emissoes.filter(e => {
      const d = fmtDate(e.criadoEm)
      if (filtros.de  && d < filtros.de)  return false
      if (filtros.ate && d > filtros.ate)  return false
      if (filtros.maquina && e.maquina !== filtros.maquina) return false
      if (filtros.produto && e.produto !== filtros.produto) return false
      if (filtros.lote && !e.lote?.toLowerCase().includes(filtros.lote.toLowerCase())) return false
      return true
    })
  }, [emissoes, filtros])

  const today = new Date().toISOString().split('T')[0]
  const hoje  = emissoes.filter(e => fmtDate(e.criadoEm) === today).length
  const totalEtiquetas = emissoes.reduce((s, e) => s + (parseInt(e.totalFusos) || 0), 0)
  const lotesDistintos = new Set(emissoes.map(e => e.lote)).size

  function exportCSV() {
    const header = ['CICLO','DATA_HORA','LOTE','MAQUINA','PRODUTO','DESCRICAO','COMPOSICAO','TITULO_DTEX','TOTAL_FUSOS','USUARIO']
    const rows = filtradas.map(e => [
      String(e.ciclo).padStart(3,'0'),
      fmtTs(e.criadoEm), e.lote, e.maquina,
      e.produto, e.descricao||'', e.composicao||'', e.titulo||'',
      e.totalFusos||0, e.userName || e.userEmail || ''
    ])
    const csv = [header,...rows].map(r =>
      r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(';')
    ).join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `emissoes_textlabel_${today}.csv`; a.click()
    toast.success('CSV exportado!')
  }

  async function reimprimir(e) {
    const maq = maquinas.find(m => m.cod === e.maquina)
    const fusos = parseInt(e.totalFusos || maq?.fusos || 1)
    const sufixo = e.lv ? ` · LV ${e.lv}` : ''
    if (!confirm(`Reimprimir ciclo ${String(e.ciclo).padStart(3,'0')}${sufixo} — ${fusos} etiquetas?`)) return

    const isNilit = (e.empresa || '').toLowerCase().includes('nilit')

    try {
      // Reconstrói labelEntries a partir das etiquetas salvas — preserva descricao por fuso (S/Z) e barcodes
      const etiquetas = await getEtiquetasPorEmissao(e.id)
      const labelEntries = etiquetas.length
        ? etiquetas.map(et => ({ ...e, ...et, ciclo: e.ciclo, fuso: et.fuso }))
        : null

      let zpl, filename = `C${String(e.ciclo).padStart(3,'0')}_${e.maquina}_${e.lote}.zpl`
      if (isNilit) {
        const [configNilit, layoutNilit] = await Promise.all([getImpressoraNilit(), getLayoutNilit()])
        const barcodes = Array.from({ length: fusos }, (_, i) => {
          const eti = etiquetas.find(x => Number(x.fuso) === i + 1)
          return eti?.barcode || 'B000000000'
        })
        const baseRecord = {
          ...e,
          ciclo: e.ciclo,
          lv: e.lv || 'A',
          emissaoHora: e.emissaoHora || '',
          operador: e.operador || '',
        }
        zpl = buildZPLNilitCiclo(baseRecord, {
          vel: configNilit.vel ?? 3, dens: configNilit.dens ?? 15, offx: configNilit.offx ?? 0,
        }, barcodes, fusos, layoutNilit, labelEntries)
      } else {
        const [empresa, layout] = await Promise.all([getEmpresa(), getLayout()])
        zpl = buildZPLCiclo({ ...e, ciclo: e.ciclo }, {
          vel: empresa.vel ?? 3, dens: empresa.dens ?? 15, offx: empresa.offx ?? -24,
        }, fusos, layout, labelEntries)
      }

      await printZPL(zpl, filename)
      toast.success(`Reimpressão: ${fusos} etiquetas enviadas!`)
    } catch (err) {
      toast.error('Erro ao reimprimir: ' + (err?.message || err))
    }
  }

  function toggleExpand(id) { setExpanded(p => ({ ...p, [id]: !p[id] })) }

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Relatório <span>de Produção</span></h1>
          <p className="page-subtitle">Histórico de ciclos — cada linha representa um ciclo completo (todos os fusos)</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} className="no-print">
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><Download size={13} /> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><Printer size={13} /> Imprimir</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Ciclos Emitidos</div>
          <div className="stat-value">{emissoes.length}</div>
          <div className="stat-sub">todos os tempos</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Etiquetas Geradas</div>
          <div className="stat-value">{totalEtiquetas}</div>
          <div className="stat-sub">soma de todos os fusos</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Ciclos Hoje</div>
          <div className="stat-value">{hoje}</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--yellow)' }}>
          <div className="stat-label">Lotes Distintos</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{lotesDistintos}</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="card no-print" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title orange">FILTROS</span>
          <button className="btn btn-ghost btn-sm"
            onClick={() => setFiltros({ de: '', ate: '', maquina: '', produto: '', lote: '' })}>
            Limpar
          </button>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">De</label>
              <input className="form-control" type="date" value={filtros.de}
                onChange={e => setFiltros(f => ({ ...f, de: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Até</label>
              <input className="form-control" type="date" value={filtros.ate}
                onChange={e => setFiltros(f => ({ ...f, ate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Máquina</label>
              <select className="form-control" value={filtros.maquina}
                onChange={e => setFiltros(f => ({ ...f, maquina: e.target.value }))}>
                <option value="">Todas</option>
                {maquinas.map(m => <option key={m.id} value={m.cod}>{m.cod}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Produto</label>
              <select className="form-control" value={filtros.produto}
                onChange={e => setFiltros(f => ({ ...f, produto: e.target.value }))}>
                <option value="">Todos</option>
                {produtos.map(p => <option key={p.id} value={p.cod}>{p.cod}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lote</label>
              <input className="form-control" placeholder="Buscar lote..." value={filtros.lote}
                onChange={e => setFiltros(f => ({ ...f, lote: e.target.value }))} />
            </div>
          </div>
          <div style={{ fontSize: '.73rem', color: 'var(--muted)' }}>
            {filtradas.length} de {emissoes.length} ciclos
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th>CICLO</th>
                <th>DATA / HORA</th>
                <th>LOTE</th>
                <th>MÁQUINA</th>
                <th>PRODUTO</th>
                <th>DESCRIÇÃO</th>
                <th className="td-center">FUSOS</th>
                <th>USUÁRIO</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {!filtradas.length && (
                <tr><td colSpan="10"><div className="empty"><p>Nenhum ciclo encontrado.</p></div></td></tr>
              )}
              {filtradas.map(e => (
                <>
                  <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(e.id)}>
                    <td style={{ color: 'var(--muted)', textAlign: 'center' }}>
                      {expanded[e.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </td>
                    <td><span className="badge badge-blue td-mono">{String(e.ciclo).padStart(3,'0')}</span></td>
                    <td style={{ fontSize: '.75rem', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{fmtTs(e.criadoEm)}</td>
                    <td><span className="badge badge-orange">{e.lote}</span></td>
                    <td><span className="badge badge-gray">{e.maquina}</span></td>
                    <td className="td-mono td-bold">{e.produto}</td>
                    <td style={{ fontSize: '.78rem', color: 'var(--text2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.descricao || '—'}
                    </td>
                    <td className="td-center">
                      <strong style={{ color: 'var(--accent)' }}>{e.totalFusos}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: '.78rem', color: 'var(--text)' }}>
                          {e.userName || '—'}
                        </span>
                        {e.userEmail && (
                          <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>
                            {e.userEmail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="no-print">
                      <button className="btn btn-ghost btn-sm btn-icon"
                        onClick={ev => { ev.stopPropagation(); reimprimir(e) }}
                        title="Reimprimir ciclo completo">
                        <RotateCcw size={13} />
                      </button>
                    </td>
                  </tr>

                  {expanded[e.id] && (
                    <tr key={`${e.id}-fusos`}>
                      <td colSpan="10" style={{ background: 'var(--surface)', padding: '12px 24px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {Array.from({ length: e.totalFusos }, (_, i) => i + 1).map(f => (
                            <span key={f} className="badge badge-gray" style={{ minWidth: 36, justifyContent: 'center' }}>
                              F{f}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: 8, fontSize: '.72rem', color: 'var(--muted)' }}>
                          Comp.: {e.composicao || '—'} &nbsp;·&nbsp;
                          Título: {e.titulo || '—'} Dtex &nbsp;·&nbsp;
                          Data fab.: {e.data || '—'}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
