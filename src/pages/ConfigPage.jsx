// src/pages/ConfigPage.jsx
import { useState, useEffect } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmpresa, setEmpresa, onCiclos, setCicloManualLoteMaq } from '../lib/firebase'

export function ConfigPage() {
  const [printer, setPrinter] = useState({ vel: '3', dens: '15', offx: '0' })
  const [ciclos,  setCiclos]  = useState([])
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getEmpresa().then(d => {
      if (d?.vel) setPrinter({ vel: String(d.vel||3), dens: String(d.dens||15), offx: String(d.offx||0) })
    })
    const unsub = onCiclos(setCiclos)
    return unsub
  }, [])

  async function salvarImpressora() {
    setLoading(true)
    try {
      await setEmpresa({
        vel:  +printer.vel,
        dens: +printer.dens,
        offx: +printer.offx,
      })
      toast.success('Configurações da impressora salvas!')
    } catch (e) { toast.error('Erro: ' + e.message) }
    setLoading(false)
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

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Impressora · Ciclos por Lote/Máquina</p>
      </div>

      {/* IMPRESSORA */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">IMPRESSORA — ZEBRA ZT230</span>
        </div>
        <div className="card-body">
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.8 }}>
            Modelo: <span style={{ color: 'var(--green)' }}>Zebra ZT230 ZDesigner</span> &nbsp;·&nbsp;
            DPI: <span style={{ color: 'var(--green)' }}>200</span> &nbsp;·&nbsp;
            Etiqueta: <span style={{ color: 'var(--orange)' }}>50mm × 30mm</span> &nbsp;·&nbsp;
            Protocolo: <span style={{ color: 'var(--accent)' }}>ZPL II</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Velocidade (ips)</label>
              <select className="form-control" value={printer.vel}
                onChange={e => setPrinter(p => ({ ...p, vel: e.target.value }))}>
                <option value="2">2 ips</option>
                <option value="3">3 ips</option>
                <option value="4">4 ips</option>
                <option value="6">6 ips</option>
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
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={salvarImpressora} disabled={loading}>
              <Save size={13} /> {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* CICLOS */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">CICLOS POR LOTE / MÁQUINA</span>
          <span style={{ fontSize: '.73rem', color: 'var(--muted)' }}>
            {ciclos.length} combinações ativas
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {ciclos.length === 0 && (
            <div className="empty"><p>Nenhum ciclo emitido ainda.</p></div>
          )}
          {ciclos.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>LOTE</th>
                    <th>MÁQUINA</th>
                    <th className="td-center">PRÓXIMO CICLO</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ciclos.map(c => (
                    <tr key={c.id}>
                      <td><span className="badge badge-orange">{c.lote}</span></td>
                      <td><span className="badge badge-gray">{c.maquina}</span></td>
                      <td className="td-center">
                        {editando?.id === c.id ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            <input
                              className="form-control"
                              type="number" min="1"
                              style={{ width: 80, padding: '4px 8px', fontSize: '.8rem' }}
                              value={editando.valor}
                              onChange={e => setEditando(p => ({ ...p, valor: e.target.value }))}
                            />
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
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => setEditando({ id: c.id, lote: c.lote, maquina: c.maquina, valor: c.valor })}
                        >
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
