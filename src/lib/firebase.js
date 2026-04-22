// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, doc, addDoc, updateDoc,
  deleteDoc, getDoc, onSnapshot, query, orderBy,
  writeBatch, serverTimestamp, runTransaction, setDoc,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)

// ─── AUTH ──────────────────────────────────────────────
export const login        = (email, pwd)  => signInWithEmailAndPassword(auth, email, pwd)
export const logout       = ()            => signOut(auth)
export const onAuth       = (cb)          => onAuthStateChanged(auth, cb)
export const cadastrarUser = async (nome, email, pwd) => {
  const cred = await createUserWithEmailAndPassword(auth, email, pwd)
  await updateProfile(cred.user, { displayName: nome })
  return cred.user
}
export const resetSenha   = (email)       => sendPasswordResetEmail(auth, email)
export const loginGoogle  = ()            => signInWithPopup(auth, new GoogleAuthProvider())

// ─── CICLO POR LOTE + MÁQUINA ──────────────────────────
function cicloDocId(lote, maquina) {
  const safe = s => String(s).replace(/[^a-zA-Z0-9\-_]/g, '_')
  return `${safe(lote)}__${safe(maquina)}`
}

export async function getNextCicloLoteMaq(lote, maquina) {
  const ref = doc(db, 'ciclos', cicloDocId(lote, maquina))
  let nextCiclo
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      nextCiclo = 1
      tx.set(ref, { lote, maquina, valor: 2, atualizadoEm: serverTimestamp() })
    } else {
      nextCiclo = snap.data().valor
      tx.update(ref, { valor: nextCiclo + 1, atualizadoEm: serverTimestamp() })
    }
  })
  return nextCiclo
}

export async function getCicloAtualLoteMaq(lote, maquina) {
  if (!lote || !maquina) return null
  const snap = await getDoc(doc(db, 'ciclos', cicloDocId(lote, maquina)))
  return snap.exists() ? snap.data().valor : 1
}

export async function setCicloManualLoteMaq(lote, maquina, valor) {
  const ref = doc(db, 'ciclos', cicloDocId(lote, maquina))
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { valor: Number(valor) })
  } else {
    await setDoc(ref, { lote, maquina, valor: Number(valor), atualizadoEm: serverTimestamp() })
  }
}

export function onCiclos(cb) {
  return onSnapshot(collection(db, 'ciclos'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── BARCODE NILIT — contador sequencial ───────────────
export async function getNextBarcodeRange(count) {
  const ref = doc(db, 'meta', 'barcode_nilit')
  let start
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      start = 112000001
      tx.set(ref, { valor: start + count, atualizadoEm: serverTimestamp() })
    } else {
      start = snap.data().valor
      tx.update(ref, { valor: start + count, atualizadoEm: serverTimestamp() })
    }
  })
  return start
}

// ─── EMITIR CICLO ──────────────────────────────────────
export async function emitirCiclo({
  lote, maquina, maquinaFusos, produto, descricao,
  composicao, titulo, data, empresa, cnpj,
  empresaNome, userEmail, userName,
  po = '', operador = '', lv = 'A', opacidade = '', emissaoHora = '',
}) {
  const ciclo      = await getNextCicloLoteMaq(lote, maquina)
  const totalFusos = Math.max(1, parseInt(maquinaFusos) || 1)
  const ts         = serverTimestamp()

  const isNilit = (empresa || '').toLowerCase().includes('nilit')
  let barcodeStart = null
  if (isNilit) {
    barcodeStart = await getNextBarcodeRange(totalFusos)
  }

  const getBarcodeForFuso = fuso => {
    if (!isNilit || barcodeStart === null) return ''
    return 'B' + String(barcodeStart + (fuso - 1)).padStart(9, '0')
  }

  const cicloRef = await addDoc(collection(db, 'emissoes'), {
    ciclo, lote, maquina, produto, descricao, composicao,
    titulo, data, totalFusos, empresa, cnpj, empresaNome,
    po, operador, lv, opacidade, emissaoHora,
    userEmail: userEmail || '',
    userName:  userName  || '',
    criadoEm: ts,
  })

  const batch = writeBatch(db)
  for (let fuso = 1; fuso <= totalFusos; fuso++) {
    batch.set(doc(collection(db, 'etiquetas')), {
      ciclo, lote, maquina, fuso, produto, descricao,
      composicao, titulo, data, empresa, cnpj, empresaNome,
      po, operador, lv, opacidade, emissaoHora,
      barcode: getBarcodeForFuso(fuso),
      userEmail: userEmail || '',
      userName:  userName  || '',
      emissaoId: cicloRef.id, criadoEm: ts,
    })
  }
  await batch.commit()

  const barcodes = isNilit
    ? Array.from({ length: totalFusos }, (_, i) => getBarcodeForFuso(i + 1))
    : []

  return { ciclo, totalFusos, emissaoId: cicloRef.id, barcodes }
}

// ─── EMISSÕES ──────────────────────────────────────────
export function onEmissoes(cb) {
  const q = query(collection(db, 'emissoes'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function onEtiquetas(cb) {
  const q = query(collection(db, 'etiquetas'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// ─── PRODUTOS ──────────────────────────────────────────
export const addProduto    = d  => addDoc(collection(db, 'produtos'), d)
export const deleteProduto = id => deleteDoc(doc(db, 'produtos', id))
export function onProdutos(cb) {
  return onSnapshot(collection(db, 'produtos'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── MÁQUINAS ──────────────────────────────────────────
export const addMaquina    = d  => addDoc(collection(db, 'maquinas'), d)
export const deleteMaquina = id => deleteDoc(doc(db, 'maquinas', id))
export function onMaquinas(cb) {
  return onSnapshot(collection(db, 'maquinas'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── CONFIG EMPRESA ────────────────────────────────────
export async function getEmpresa() {
  const snap = await getDoc(doc(db, 'meta', 'empresa'))
  return snap.exists() ? snap.data() : {}
}
export async function setEmpresa(data) {
  return setDoc(doc(db, 'meta', 'empresa'), data, { merge: true })
}

// ─── CONFIG IMPRESSORA NILIT ───────────────────────────
export async function getImpressoraNilit() {
  const snap = await getDoc(doc(db, 'meta', 'impressora_nilit'))
  return snap.exists()
    ? { vel: 3, dens: 15, offx: 0, ...snap.data() }
    : { vel: 3, dens: 15, offx: 0 }
}
export async function setImpressoraNilit(data) {
  return setDoc(doc(db, 'meta', 'impressora_nilit'), data, { merge: true })
}

// ─── CÓDIGO OPERADOR POR USUÁRIO ───────────────────────
export async function getOrCreateOperadorCode(user) {
  if (!user?.uid) return 1000
  const userRef = doc(db, 'usuarios', user.uid)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists() && userSnap.data().operadorCode) {
    return userSnap.data().operadorCode
  }
  const seqRef = doc(db, 'meta', 'operador_seq')
  let code
  await runTransaction(db, async tx => {
    const seqSnap = await tx.get(seqRef)
    if (!seqSnap.exists()) {
      code = 1000
      tx.set(seqRef, { valor: 1001 })
    } else {
      code = seqSnap.data().valor
      tx.update(seqRef, { valor: code + 1 })
    }
    tx.set(userRef, {
      operadorCode: code,
      email:        user.email       || '',
      nome:         user.displayName || '',
      criadoEm:     serverTimestamp(),
    }, { merge: true })
  })
  return code
}

// ─── LAYOUT DA ETIQUETA ────────────────────────────────
import { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT } from './zpl.js'
export { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT }

export async function getLayout() {
  const snap = await getDoc(doc(db, 'meta', 'layout'))
  return snap.exists() ? { ...LAYOUT_DEFAULT, ...snap.data() } : { ...LAYOUT_DEFAULT }
}
export async function setLayout(data) {
  return setDoc(doc(db, 'meta', 'layout'), data, { merge: true })
}

export async function getLayoutNilit() {
  const snap = await getDoc(doc(db, 'meta', 'layout_nilit'))
  return snap.exists() ? { ...LAYOUT_NILIT_DEFAULT, ...snap.data() } : { ...LAYOUT_NILIT_DEFAULT }
}
export async function setLayoutNilit(data) {
  return setDoc(doc(db, 'meta', 'layout_nilit'), data, { merge: true })
}
