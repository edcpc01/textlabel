// src/pages/ConfigPage.jsx
import { useState, useEffect } from 'react'
import { Save, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getEmpresa, setEmpresa, onCiclos, setCicloManualLoteMaq,
  getLayout, setLayout,
  getImpressoraNilit, setImpressoraNilit,
} from '../lib/firebase'
import { LAYOUT_DEFAULT } from '../lib/zpl'
import { LabelPreview } from '../components/LabelPreview'

// Sliders de fonte: converte "24,22" ↔ { h: 24, w: 22 }
function FontSlider({ label, value, onChange }) {
  const [h, w] = value.split(',').map(Number)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="range" min="8" max="48" value={h} style={{ flex: 1 }}
          onChange={e => onChange(`${e.target.value},${w}`)} />
        <span style={{ fontFamily: 'monospace', minWidth: 48, fontSize: '.8rem',
          color: 'var(--accent)', textAlign: 'center' }}>{h}×{w}</span>
        <input type="range" min="6" max="46" value={w} style={{ flex: 1 }}
          onChange={e => onChange(`${h},${e.target.value}`)} />
      </div>
    </div>
  )
}

function NumSlider({ label, value, min, max, onChange, unit = 'dots' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="range" min={min} max={max} value={value} style={{ flex: 1 }}
          onChange={e => onChange(Number(e.target.value))} />
        <span style={{ fontFamily: 'monospace', minWidth: 60, fontSize: '.8rem',
          color: 'var(--accent)', textAlign: 'center' }}>{value} {unit}</span>
      </div>
    </div>
  )
}

export function ConfigPage() {
  const [printer, setPrinter]       = useState({ vel: '3', dens: '15', offx: '-24' })
  const [printerNilit, setPrinterNilit] = useState({ vel: '3', dens: '15', offx: '0' })
  const [ciclos,  setCiclos]        = useState([])
  const [editando, setEditando]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [layout, setLayoutLocal]    = useState(LAYOUT_DEFAULT)
  const [empresa, setEmpresaLocal]  = useState({})

  useEffect(() => {
    getEmpresa().then(d => {
      setEmpresaLocal(d || {})
      if (d?.vel !== undefined) setPrinter({
        vel:  String(d.vel  ?? 3),
        dens: String(d.dens ?? 15),
        offx: String(d.offx ?? -24),
      })
    })
    getImpressoraNilit().then(d => {
      setPrinterNilit({ vel: String(d.vel ?? 3), dens: String(d.dens ?? 15), offx: String(d.offx ?? 0) })
    })
    getLayout().then(setLayoutLocal)
    const unsub = onCiclos(setCiclos)
    return unsub
  }, [])

  async function salvarImpressora() {
    setLoading(true)
    try {
      await setEmpresa({ vel: +printer.vel, dens: +printer.dens, offx: +printer.offx })
      toast.success('Impressora Padrão salva!')
    } catch (e) { toast.error('Erro: ' + e.message) }
    setLoading(false)
  }

  async function salvarImpressoraNilit() {
    setLoading(true)
    try {
      await setImpressoraNilit({ vel: +printerNilit.vel, dens: +printerNilit.dens, offx: +printerNilit.offx })
      toast.success('Impressora Nilit salva!')
    } catch (e) { toast.error('Erro: ' + e.message) }
    setLoading(false)
  }

  async function salvarLayout() {
    setLoading(true)
    try {
      await setLayout(layout)
      toast.success('Layout salvo!')
    } catch (e) { toast.error('Erro: ' + e.message) }
    setLoading(false)
  }

  function resetLayout() {
    setLayoutLocal(LAYOUT_DEFAULT)
    toast.success('Layout resetado para o padrão.')
  }

  async function salvarCicloManual() {
    if (!editando) return
    const v = parseInt(editando.valor)
    if (isNaN(v) || v < 1) { toast.error('Valor inválido.'); return }
    if (!confirm(`Definir ciclo de ${editando.maquina} / ${editando.lote} para ${v}?`)) return
    await setCicloManualLoteMaq(editando.lote, editando.maquina, v)
    setEditando(null)
    toast.success('Ciclo atualizado!')
  }

  // Preview ao vivo com o layout atual
  const previewRecord = {
    empresa: empresa.nome || 'TECELAGEM SAO JOAO DE TIETE',
    cnpj: empresa.cnpj || '06.745.682/0001-48',
    descricao: 'FIO PES TEXT. A AR SO 2X100/96',
    composicao: '100% PES', titulo: '230',
    maquina: 'AIKI 1A', ciclo: 1, fuso: 1,
    lote: '6848', data: new Date().toISOString().split('T')[0],
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Impressora · Layout da Etiqueta · Ciclos</p>
      </div>

      {/* IMPRESSORA PADRÃO */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">IMPRESSORA PADRÃO — São João / Rhodia</span>
          <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>50×30mm · 2 colunas</span>
        </div>
        <div className="card-body">
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 14 }}>
            Modelo: <span style={{ color: 'var(--green)' }}>ZT230 ZDesigner</span> · DPI: <span style={{ color: 'var(--green)' }}>200</span> · Etiqueta: <span style={{ color: 'var(--orange)' }}>50×30mm · 2 colunas</span> · Protocolo: <span style={{ color: 'var(--accent)' }}>ZPL II</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Velocidade (ips)</label>
              <select className="form-control" value={printer.vel} onChange={e => setPrinter(p => ({ ...p, vel: e.target.value }))}>
                <option value="2">2 ips</option><option value="3">3 ips</option>
                <option value="4">4 ips</option><option value="6">6 ips</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Densidade (0–30)</label>
              <input className="form-control" type="number" min="0" max="30" value={printer.dens}
                onChange={e => setPrinter(p => ({ ...p, dens: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Offset X (dots)</label>
              <input className="form-control" type="number" value={printer.offx}
                onChange={e => setPrinter(p => ({ ...p, offx: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvarImpressora} disabled={loading}>
            <Save size={13} /> Salvar
          </button>
        </div>
      </div>

      {/* IMPRESSORA NILIT */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">IMPRESSORA NILIT</span>
          <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>64×35mm · 1 coluna · aplicado automaticamente</span>
        </div>
        <div className="card-body">
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 14 }}>
            Configuração aplicada <strong style={{ color: 'var(--accent)' }}>automaticamente</strong> quando o produto selecionado for da Nilit. Offset padrão <code>0</code> (sem deslocamento).
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Velocidade (ips)</label>
              <select className="form-control" value={printerNilit.vel} onChange={e => setPrinterNilit(p => ({ ...p, vel: e.target.value }))}>
                <option value="2">2 ips</option><option value="3">3 ips</option>
                <option value="4">4 ips</option><option value="6">6 ips</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Densidade (0–30)</label>
              <input className="form-control" type="number" min="0" max="30" value={printerNilit.dens}
                onChange={e => setPrinterNilit(p => ({ ...p, dens: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Offset X (dots)</label>
              <input className="form-control" type="number" value={printerNilit.offx}
                onChange={e => setPrinterNilit(p => ({ ...p, offx: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvarImpressoraNilit} disabled={loading}>
            <Save size={13} /> Salvar Nilit
          </button>
        </div>
      </div>

      {/* LAYOUT DA ETIQUETA */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">LAYOUT DA ETIQUETA</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={resetLayout}><RefreshCw size={12} /> Resetar</button>
            <button className="btn btn-primary btn-sm" onClick={salvarLayout} disabled={loading}><Save size={13} /> Salvar Layout</button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* CONTROLES */}
            <div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>
                Fontes (altura × largura em dots)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FontSlider label="Empresa (L1)" value={layout.fontEmpresa} onChange={v => setLayoutLocal(l => ({...l, fontEmpresa: v}))} />
                <FontSlider label="CNPJ (L2)" value={layout.fontCnpj} onChange={v => setLayoutLocal(l => ({...l, fontCnpj: v}))} />
                <FontSlider label="Descrição (L3)" value={layout.fontDesc} onChange={v => setLayoutLocal(l => ({...l, fontDesc: v}))} />
                <FontSlider label="Composição (L4)" value={layout.fontComp} onChange={v => setLayoutLocal(l => ({...l, fontComp: v}))} />
                <FontSlider label="Labels (Máq/Ciclo/Fuso)" value={layout.fontLabel} onChange={v => setLayoutLocal(l => ({...l, fontLabel: v}))} />
                <FontSlider label="Valor Máquina" value={layout.fontMaq} onChange={v => setLayoutLocal(l => ({...l, fontMaq: v}))} />
                <FontSlider label="Valor Ciclo" value={layout.fontCiclo} onChange={v => setLayoutLocal(l => ({...l, fontCiclo: v}))} />
                <FontSlider label="Valor Fuso (destaque)" value={layout.fontFuso} onChange={v => setLayoutLocal(l => ({...l, fontFuso: v}))} />
                <FontSlider label="Lote / Data" value={layout.fontLote} onChange={v => setLayoutLocal(l => ({...l, fontLote: v}))} />

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Espaçamento e Colunas
                  </div>
                  <NumSlider label="Espaçamento entre linhas" value={layout.espacamento ?? 2} min={0} max={10} onChange={v => setLayoutLocal(l => ({...l, espacamento: v}))} />
                  <NumSlider label="Margem superior (topo)" value={layout.margemTop ?? 4} min={0} max={20} onChange={v => setLayoutLocal(l => ({...l, margemTop: v}))} />
                  <NumSlider label="Largura col. Máquina" value={layout.colMaq} min={80} max={200} onChange={v => setLayoutLocal(l => ({...l, colMaq: v}))} />
                  <NumSlider label="Largura col. Ciclo" value={layout.colCiclo} min={60} max={160} onChange={v => setLayoutLocal(l => ({...l, colCiclo: v}))} />
                  <NumSlider label="Margem lateral (X)" value={layout.margemX} min={0} max={20} onChange={v => setLayoutLocal(l => ({...l, margemX: v}))} />
                </div>
              </div>
            </div>

            {/* PREVIEW AO VIVO */}
            <div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                Preview ao vivo
              </div>
              <LabelPreview record={previewRecord} layout={layout} />
            </div>
          </div>
        </div>
      </div>

      {/* CICLOS */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">CICLOS POR LOTE / MÁQUINA</span>
          <span style={{ fontSize: '.73rem', color: 'var(--muted)' }}>{ciclos.length} combinações</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {ciclos.length === 0 && <div className="empty"><p>Nenhum ciclo emitido ainda.</p></div>}
          {ciclos.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>LOTE</th><th>MÁQUINA</th><th className="td-center">PRÓXIMO CICLO</th><th /></tr></thead>
                <tbody>
                  {ciclos.map(c => (
                    <tr key={c.id}>
                      <td><span className="badge badge-orange">{c.lote}</span></td>
                      <td><span className="badge badge-gray">{c.maquina}</span></td>
                      <td className="td-center">
                        {editando?.id === c.id ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            <input className="form-control" type="number" min="1"
                              style={{ width: 80, padding: '4px 8px', fontSize: '.8rem' }}
                              value={editando.valor}
                              onChange={e => setEditando(p => ({ ...p, valor: e.target.value }))} />
                            <button className="btn btn-primary btn-sm" onClick={salvarCicloManual}>✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>✕</button>
                          </div>
                        ) : (
                          <strong style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>
                            {String(c.valor).padStart(3, '0')}
                          </strong>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => setEditando({ id: c.id, lote: c.lote, maquina: c.maquina, valor: c.valor })}>
                          <AlertTriangle size={12} /> Ajustar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
