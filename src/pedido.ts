import './auth'
import type { OrderData } from './types'

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const params = new URLSearchParams(window.location.search)
const orderFromLink = params.get("order")
let savedOrder: OrderData | null = null
const finalSummaryItems = document.querySelector<HTMLElement>("#final-summary-items")!
const finalSummaryTotal = document.querySelector<HTMLElement>("#final-summary-total")!
const finalDetails = document.querySelector<HTMLElement>("#final-details")!
const receiptLink = document.querySelector<HTMLAnchorElement>("#receipt-link")!

if (orderFromLink) {
  try {
    savedOrder = JSON.parse(orderFromLink)
  } catch {
    savedOrder = null
  }
}

function addDetail(label: string, value: string): void {
  const line = document.createElement("p")
  const strong = document.createElement("strong")
  strong.textContent = `${label}:`
  line.append(strong, ` ${value || "-"}`)
  finalDetails.append(line)
}

if (savedOrder && savedOrder.items && savedOrder.items.length > 0) {
  finalSummaryItems.innerHTML = ""

  savedOrder.items.forEach((item) => {
    const line = document.createElement("div")
    line.className = "summary-line"
    line.innerHTML = `<span>${item.quantity} x ${item.name}</span><strong>${currency.format(item.subtotal)}</strong>`
    finalSummaryItems.append(line)
  })

  if (savedOrder.subtotal) {
    const subtotalLine = document.createElement("div")
    subtotalLine.className = "summary-line"
    subtotalLine.innerHTML = `<span>Subtotal</span><strong>${currency.format(savedOrder.subtotal)}</strong>`
    finalSummaryItems.append(subtotalLine)
  }

  if (savedOrder.discount > 0) {
    const discountLine = document.createElement("div")
    discountLine.className = "summary-line discount-line"
    discountLine.innerHTML = `<span>Descuento 10%</span><strong>-${currency.format(savedOrder.discount)}</strong>`
    finalSummaryItems.append(discountLine)
  }

  finalSummaryTotal.textContent = currency.format(savedOrder.total)
  finalDetails.innerHTML = ""
  addDetail("Nombre", savedOrder.name)
  addDetail("Cantidad", `${savedOrder.itemCount || 0} cookies`)
  addDetail("Teléfono", savedOrder.phone)
  addDetail("Email", savedOrder.email)
  addDetail("Pickup", savedOrder.pickup)

  const subject = encodeURIComponent("Comprobante Grumfy Cookies")
  const body = encodeURIComponent(
    `Hola! Te mando el comprobante de mi pedido Grumfy.\n\nCantidad: ${savedOrder.itemCount || 0} cookies\nSubtotal: ${currency.format(savedOrder.subtotal || savedOrder.total)}\nDescuento: ${currency.format(savedOrder.discount || 0)}\nTotal: ${currency.format(savedOrder.total)}\nPickup: ${savedOrder.pickup || "-"}\nTelefono: ${savedOrder.phone || "-"}\nEmail: ${savedOrder.email || "-"}`
  )
  receiptLink.href = `mailto:santigarciarosselli@gmail.com?subject=${subject}&body=${body}`
}
