// ============================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================
// SUBSTITUA OS VALORES ABAIXO COM AS SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBUaR78TuFW0NTCdQdLRzXFBh6xvHq-swk",
  authDomain: "assinatura-74b86.firebaseapp.com",
  projectId: "assinatura-74b86",
  storageBucket: "assinatura-74b86.firebasestorage.app",
  messagingSenderId: "184248073971",
  appId: "1:184248073971:web:5d37b609d1df5b47e34186"
};

// Importações do Firebase (usando CDN via import maps)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let saveCanvas,
  saveCtx,
  isDrawingSave = false
let validateCanvas,
  validateCtx,
  isDrawingValidate = false
let referenceCanvas, referenceCtx
let allSignatures = []

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
  initializeSaveCanvas()
  initializeValidateCanvas()
  initializeReferenceCanvas()
  initializeEventListeners()
})

// ============================================
// GERENCIAMENTO DE TABS
// ============================================
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab")

      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      button.classList.add("active")
      document.getElementById(`${tabName}-tab`).classList.add("active")

      clearMessages()
    })
  })
}

// ============================================
// CONFIGURAÇÃO DO CANVAS DE SALVAR
// ============================================
function initializeSaveCanvas() {
  saveCanvas = document.getElementById("save-canvas")
  saveCtx = saveCanvas.getContext("2d")

  saveCanvas.width = saveCanvas.offsetWidth
  saveCanvas.height = 200

  saveCtx.strokeStyle = "#000"
  saveCtx.lineWidth = 2
  saveCtx.lineCap = "round"
  saveCtx.lineJoin = "round"

  saveCanvas.addEventListener("mousedown", startDrawingSave)
  saveCanvas.addEventListener("mousemove", drawSave)
  saveCanvas.addEventListener("mouseup", stopDrawingSave)
  saveCanvas.addEventListener("mouseout", stopDrawingSave)

  saveCanvas.addEventListener("touchstart", handleTouchStartSave)
  saveCanvas.addEventListener("touchmove", handleTouchMoveSave)
  saveCanvas.addEventListener("touchend", stopDrawingSave)
}

function startDrawingSave(e) {
  isDrawingSave = true
  const rect = saveCanvas.getBoundingClientRect()
  saveCtx.beginPath()
  saveCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

function drawSave(e) {
  if (!isDrawingSave) return
  const rect = saveCanvas.getBoundingClientRect()
  saveCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  saveCtx.stroke()
}

function stopDrawingSave() {
  isDrawingSave = false
}

function handleTouchStartSave(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  saveCanvas.dispatchEvent(mouseEvent)
}

function handleTouchMoveSave(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  saveCanvas.dispatchEvent(mouseEvent)
}

// ============================================
// CONFIGURAÇÃO DO CANVAS DE VALIDAÇÃO
// ============================================
function initializeValidateCanvas() {
  validateCanvas = document.getElementById("validate-canvas")
  validateCtx = validateCanvas.getContext("2d")

  validateCanvas.width = 400
  validateCanvas.height = 200

  validateCtx.strokeStyle = "#000"
  validateCtx.lineWidth = 2
  validateCtx.lineCap = "round"
  validateCtx.lineJoin = "round"

  validateCanvas.addEventListener("mousedown", startDrawingValidate)
  validateCanvas.addEventListener("mousemove", drawValidate)
  validateCanvas.addEventListener("mouseup", stopDrawingValidate)
  validateCanvas.addEventListener("mouseout", stopDrawingValidate)

  validateCanvas.addEventListener("touchstart", handleTouchStartValidate)
  validateCanvas.addEventListener("touchmove", handleTouchMoveValidate)
  validateCanvas.addEventListener("touchend", stopDrawingValidate)
}

function startDrawingValidate(e) {
  isDrawingValidate = true
  const rect = validateCanvas.getBoundingClientRect()
  validateCtx.beginPath()
  validateCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

function drawValidate(e) {
  if (!isDrawingValidate) return
  const rect = validateCanvas.getBoundingClientRect()
  validateCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  validateCtx.stroke()
}

function stopDrawingValidate() {
  isDrawingValidate = false
}

function handleTouchStartValidate(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  validateCanvas.dispatchEvent(mouseEvent)
}

function handleTouchMoveValidate(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  validateCanvas.dispatchEvent(mouseEvent)
}

// ============================================
// CONFIGURAÇÃO DO CANVAS DE REFERÊNCIA
// ============================================
function initializeReferenceCanvas() {
  referenceCanvas = document.getElementById("reference-canvas")
  referenceCtx = referenceCanvas.getContext("2d")

  referenceCanvas.width = 400
  referenceCanvas.height = 200
}

// ============================================
// EVENT LISTENERS
// ============================================
function initializeEventListeners() {
  document.getElementById("clear-save-canvas").addEventListener("click", () => {
    clearCanvas(saveCanvas, saveCtx)
  })

  document.getElementById("clear-validate-canvas").addEventListener("click", () => {
    clearCanvas(validateCanvas, validateCtx)
  })

  document.getElementById("save-signature-btn").addEventListener("click", saveSignature)

  const validateNameInput = document.getElementById("validate-name")
  validateNameInput.addEventListener("input", handleAutocomplete)
  validateNameInput.addEventListener("focus", handleAutocomplete)

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-container")) {
      document.getElementById("autocomplete-list").classList.remove("active")
    }
  })
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function clearCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function clearMessages() {
  const messages = document.querySelectorAll(".message")
  messages.forEach((msg) => {
    msg.style.display = "none"
    msg.className = "message"
    msg.textContent = ""
  })
}

function showMessage(elementId, message, type) {
  const messageEl = document.getElementById(elementId)
  messageEl.textContent = message
  messageEl.className = `message ${type}`
  messageEl.style.display = "block"
}

function isCanvasEmpty(canvas) {
  const ctx = canvas.getContext("2d")
  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  for (let i = 0; i < pixelData.length; i += 4) {
    if (pixelData[i + 3] !== 0) {
      return false
    }
  }
  return true
}

// ============================================
// SALVAR ASSINATURA NO FIRESTORE
// ============================================
async function saveSignature() {
  const name = document.getElementById("save-name").value.trim()

  if (!name) {
    showMessage("save-message", "Por favor, digite um nome.", "error")
    return
  }

  if (isCanvasEmpty(saveCanvas)) {
    showMessage("save-message", "Por favor, desenhe uma assinatura.", "error")
    return
  }

  try {
    const signatureData = saveCanvas.toDataURL("image/png")

    await addDoc(collection(db, "signatures"), {
      name: name,
      signature: signatureData,
      timestamp: new Date().toISOString(),
    })

    showMessage("save-message", "Assinatura salva com sucesso!", "success")

    document.getElementById("save-name").value = ""
    clearCanvas(saveCanvas, saveCtx)
  } catch (error) {
    console.error("Erro ao salvar assinatura:", error)
    showMessage("save-message", "Erro ao salvar assinatura. Verifique a configuração do Firebase.", "error")
  }
}

// ============================================
// AUTOCOMPLETE FUNCTIONALITY
// ============================================
async function loadAllSignatures() {
  try {
    const querySnapshot = await getDocs(collection(db, "signatures"))
    allSignatures = []
    querySnapshot.forEach((doc) => {
      allSignatures.push({
        id: doc.id,
        name: doc.data().name,
        signature: doc.data().signature,
      })
    })
  } catch (error) {
    console.error("Erro ao carregar assinaturas:", error)
  }
}

async function handleAutocomplete(e) {
  const input = e.target.value.trim().toLowerCase()
  const autocompleteList = document.getElementById("autocomplete-list")

  if (!input) {
    autocompleteList.classList.remove("active")
    autocompleteList.innerHTML = ""
    return
  }

  // Load signatures if not loaded yet
  if (allSignatures.length === 0) {
    await loadAllSignatures()
  }

  // Filter signatures by name
  const filtered = allSignatures.filter((sig) => sig.name.toLowerCase().includes(input))

  if (filtered.length === 0) {
    autocompleteList.classList.remove("active")
    autocompleteList.innerHTML = ""
    return
  }

  // Display filtered results
  autocompleteList.innerHTML = ""
  filtered.forEach((sig) => {
    const item = document.createElement("div")
    item.className = "autocomplete-item"

    // Highlight matching text
    const nameText = sig.name
    const startIndex = nameText.toLowerCase().indexOf(input)
    const beforeMatch = nameText.substring(0, startIndex)
    const match = nameText.substring(startIndex, startIndex + input.length)
    const afterMatch = nameText.substring(startIndex + input.length)

    item.innerHTML = `${beforeMatch}<strong>${match}</strong>${afterMatch}`

    item.addEventListener("click", () => {
      document.getElementById("validate-name").value = sig.name
      autocompleteList.classList.remove("active")
      loadSignatureForValidation(sig)
    })

    autocompleteList.appendChild(item)
  })

  autocompleteList.classList.add("active")
}

function loadSignatureForValidation(signatureData) {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    clearCanvas(referenceCanvas, referenceCtx)
    referenceCtx.drawImage(img, 0, 0, referenceCanvas.width, referenceCanvas.height)
  }
  img.src = signatureData.signature

  clearCanvas(validateCanvas, validateCtx)

  document.getElementById("validation-area").classList.remove("hidden")
  document.getElementById("validation-message").textContent =
    "Compare visualmente as assinaturas. Desenhe a nova assinatura à direita."

  showMessage("validate-message", "Assinatura carregada! Compare visualmente.", "success")
}
