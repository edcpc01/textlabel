// src/pages/CadastroPage.jsx
import { useState, useEffect } from 'react'
import { Trash2, Plus, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  onProdutos, addProduto, deleteProduto,
  onMaquinas, addMaquina, deleteMaquina,
  getEmpresa,
} from '../lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function useCollection(onFn) {
  const [items, setItems] = useState([])
  useEffect(() => { const u = onFn(setItems); return u }, [])
  return items
}

// ─── EDIÇÃO INLINE ────────────────────────────────────
function EditableRow({ columns, row, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)

  function startEdit() { setDraft(row); setEditing(true) }
  function cancel()    { setEditing(false) }
  async function save() {
    await onSave(row.id, draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <tr>
        {columns.map(c => (
          <td key={c.key} className={c.cls || ''}>
            {c.render ? c.render(row[c.key], row) : (row[c.key] || '—')}
          </td>
        ))}
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={startEdit} title="Editar">
              <Pencil size={12} />
            </button>
            <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(row.id)} title="Excluir">
              <Trash2 size={12} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ background: 'rgba(0,212,255,.05)' }}>
      {columns.map(c => (
        <td key={c.key} style={{ padding: '6px 8px' }}>
          {c.editType === 'select' ? (
            <select
              className="form-control"
              style={{ padding: '5px 8px', fontSize: '.8rem' }}
              value={draft[c.key] || ''}
              onChange={e => setDraft(p => ({ ...p, [c.key]: e.target.value }))}
            >
              {c.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : c.editType === 'number' ? (
            <input
              className="form-control"
              type="number" min="1"
              style={{ padding: '5px 8px', fontSize: '.8rem' }}
              value={draft[c.key] || ''}
              onChange={e => setDraft(p => ({ ...p, [c.key]: e.target.value }))}
            />
          ) : c.noEdit ? (
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{row[c.key] || '—'}</span>
          ) : (
            <input
              className="form-control"
              type="text"
              style={{ padding: '5px 8px', fontSize: '.8rem' }}
              value={draft[c.key] || ''}
              onChange={e => setDraft(p => ({ ...p, [c.key]: e.target.value }))}
            />
          )}
        </td>
      ))}
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-success btn-sm btn-icon" onClick={save} title="Salvar">
            <Check size={13} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={cancel} title="Cancelar">
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── PRODUTOS ─────────────────────────────────────────
function ProdutosCard({ produtos }) {
  const [f, setF] = useState({
    empresa: '', cnpj: '', cod: '', desc: '', comp: '', titulo: '', un: 'kg', opacidade: ''
  })

  useEffect(() => {
    getEmpresa().then(d => {
      if (d?.nome) setF(p => ({ ...p, empresa: d.nome || '', cnpj: d.cnpj || '' }))
    })
  }, [])

  async function salvar() {
    if (!f.empresa) { toast.error('Informe a empresa.'); return }
    if (!f.cod)     { toast.error('Informe o código.'); return }
    if (!f.desc)    { toast.error('Informe a descrição.'); return }
    if (produtos.find(p => p.cod === f.cod.toUpperCase())) {
      toast.error('Código já existe.'); return
    }
    await addProduto({ ...f, cod: f.cod.toUpperCase(), opacidade: f.opacidade.toUpperCase() })
    setF(p => ({ ...p, cod: '', desc: '', comp: '', titulo: '', un: 'kg', opacidade: '' }))
    toast.success('Produto salvo!')
  }

  async function editarProduto(id, draft) {
    await updateDoc(doc(db, 'produtos', id), {
      empresa:   draft.empresa   || '',
      cnpj:      draft.cnpj      || '',
      desc:      draft.desc      || '',
      comp:      draft.comp      || '',
      titulo:    draft.titulo    || '',
      un:        draft.un        || 'kg',
      opacidade: draft.opacidade || '',
    })
    toast.success('Produto atualizado!')
  }

  const columns = [
    { key: 'empresa',   label: 'Empresa' },
    { key: 'cnpj',      label: 'CNPJ' },
    { key: 'cod',       label: 'Código', noEdit: true,
      render: v => <span className="badge badge-blue">{v}</span> },
    { key: 'opacidade', label: 'Opac.',
      render: v => v ? <span className="badge badge-blue">{v}</span> : '—' },
    { key: 'desc',      label: 'Descrição' },
    { key: 'comp',      label: 'Composição' },
    { key: 'titulo',    label: 'Título (Dtex)' },
    { key: 'un',        label: 'Un.', editType: 'select', options: ['kg','g','m','con'],
      render: v => <span className="badge badge-orange">{v}</span> },
  ]

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">PRODUTOS (FIOS)</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{produtos.length} cadastrados</span>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group span2">
            <label className="form-label">Empresa</label>
            <input className="form-control" placeholder="Corradi Indústria Têxtil"
              value={f.empresa} onChange={e => setF(p => ({ ...p, empresa: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input className="form-control" placeholder="00.000.000/0000-00"
              value={f.cnpj} onChange={e => setF(p => ({ ...p, cnpj: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Opacidade <span style={{ color: 'var(--muted)', fontSize: '.75em' }}>(2 letras — ex: BK)</span></label>
            <input className="form-control" placeholder="BK" maxLength={2}
              value={f.opacidade}
              onChange={e => setF(p => ({ ...p, opacidade: e.target.value.toUpperCase() }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Código</label>
            <input className="form-control" placeholder="102130"
              value={f.cod} onChange={e => setF(p => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="form-group span2">
            <label className="form-label">Descrição</label>
            <input className="form-control" placeholder="FIO PES TEXT. A AR SO 2X100/96DTEX CRU"
              value={f.desc} onChange={e => setF(p => ({ ...p, desc: e.target.value }))} />
          </div>
          <div className="form-group span3">
            <label className="form-label">Composição</label>
            <input className="form-control" placeholder="100% PES"
              value={f.comp} onChange={e => setF(p => ({ ...p, comp: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Título (Dtex)</label>
            <input className="form-control" placeholder="230"
              value={f.titulo} onChange={e => setF(p => ({ ...p, titulo: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Unidade</label>
            <select className="form-control" value={f.un}
              onChange={e => setF(p => ({ ...p, un: e.target.value }))}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="m">m</option>
              <option value="con">cone</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvar}>
          <Plus size={13} /> Salvar Produto
        </button>

        {produtos.length > 0 && (
          <div style={{ marginTop: 20 }} className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th style={{ width: 72 }} />
                </tr>
              </thead>
              <tbody>
                {produtos.map(row => (
                  <EditableRow
                    key={row.id}
                    columns={columns}
                    row={row}
                    onSave={editarProduto}
                    onDelete={async id => {
                      if (!confirm('Excluir produto?')) return
                      await deleteProduto(id)
                      toast.success('Removido.')
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {produtos.length === 0 && (
          <div className="empty" style={{ marginTop: 16 }}><p>Nenhum produto cadastrado.</p></div>
        )}
      </div>
    </div>
  )
}

// ─── MÁQUINAS ─────────────────────────────────────────
function MaquinasCard({ maquinas }) {
  const [f, setF] = useState({ cod: '', desc: '', fusos: '', local: '' })

  async function salvar() {
    if (!f.cod || !f.desc) { toast.error('Código e descrição são obrigatórios.'); return }
    if (!f.fusos || parseInt(f.fusos) < 1) { toast.error('Informe o número de fusos.'); return }
    if (maquinas.find(m => m.cod === f.cod.toUpperCase())) {
      toast.error('Código já existe.'); return
    }
    await addMaquina({ ...f, cod: f.cod.toUpperCase(), fusos: parseInt(f.fusos) })
    setF({ cod: '', desc: '', fusos: '', local: '' })
    toast.success('Máquina salva!')
  }

  async function editarMaquina(id, draft) {
    await updateDoc(doc(db, 'maquinas', id), {
      desc:  draft.desc  || '',
      fusos: parseInt(draft.fusos) || 1,
      local: draft.local || '',
    })
    toast.success('Máquina atualizada!')
  }

  const columns = [
    { key: 'cod',   label: 'Código', noEdit: true,
      render: v => <span className="badge badge-blue">{v}</span> },
    { key: 'desc',  label: 'Descrição' },
    { key: 'fusos', label: 'Fusos', editType: 'number',
      render: v => <strong style={{ color: 'var(--accent)' }}>{v}</strong> },
    { key: 'local', label: 'Localização' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">MÁQUINAS</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{maquinas.length} cadastradas</span>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Código / ID</label>
            <input className="form-control" placeholder="MAQ-01" value={f.cod}
              onChange={e => setF(p => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="form-group span2">
            <label className="form-label">Descrição</label>
            <input className="form-control" placeholder="AIKI TEXTURIZADORA A AR" value={f.desc}
              onChange={e => setF(p => ({ ...p, desc: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Nº de Fusos *</label>
            <input className="form-control" type="number" min="1" placeholder="Ex: 72" value={f.fusos}
              onChange={e => setF(p => ({ ...p, fusos: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Localização</label>
            <input className="form-control" placeholder="Setor A" value={f.local}
              onChange={e => setF(p => ({ ...p, local: e.target.value }))} />
          </div>
        </div>

        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvar}>
          <Plus size={13} /> Salvar Máquina
        </button>

        {maquinas.length > 0 && (
          <div style={{ marginTop: 20 }} className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th style={{ width: 72 }} />
                </tr>
              </thead>
              <tbody>
                {maquinas.map(row => (
                  <EditableRow
                    key={row.id}
                    columns={columns}
                    row={row}
                    onSave={editarMaquina}
                    onDelete={async id => {
                      if (!confirm('Excluir máquina?')) return
                      await deleteMaquina(id)
                      toast.success('Removida.')
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {maquinas.length === 0 && (
          <div className="empty" style={{ marginTop: 16 }}><p>Nenhuma máquina cadastrada.</p></div>
        )}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────
export function CadastroPage() {
  const produtos = useCollection(onProdutos)
  const maquinas = useCollection(onMaquinas)

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Cadastros</h1>
        <p className="page-subtitle">Produtos (Fios) · Máquinas — clique em <strong style={{color:'var(--accent)'}}>✎</strong> para editar qualquer registro</p>
      </div>
      <ProdutosCard produtos={produtos} />
      <MaquinasCard maquinas={maquinas} />
    </div>
  )
}
