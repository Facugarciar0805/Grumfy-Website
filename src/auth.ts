import { GRUMFY_AUTH_CONFIG } from './auth-config'

const INSTITUTION_DOMAIN = GRUMFY_AUTH_CONFIG.institutionDomain
const MEMBER_EMAIL_KEY = GRUMFY_AUTH_CONFIG.memberEmailKey
const EMAIL_NAME_PATTERN = /^[A-Za-z0-9._%+-]+$/

function isInstitutionEmail(email: string | null): boolean {
  if (!email) return false

  const normalizedEmail = email.toLowerCase()
  const suffix = `@${INSTITUTION_DOMAIN}`
  const emailName = normalizedEmail.endsWith(suffix)
    ? normalizedEmail.slice(0, -suffix.length)
    : ""

  return emailName.length > 0 && EMAIL_NAME_PATTERN.test(emailName)
}

function readSavedEmail(): string | null {
  try {
    const savedEmail = localStorage.getItem(MEMBER_EMAIL_KEY)
    if (!isInstitutionEmail(savedEmail)) {
      localStorage.removeItem(MEMBER_EMAIL_KEY)
      return null
    }
    return savedEmail
  } catch {
    return null
  }
}

function saveEmail(email: string): boolean {
  try {
    localStorage.setItem(MEMBER_EMAIL_KEY, email)
    return true
  } catch {
    return false
  }
}

function clearSavedEmail(): boolean {
  try {
    localStorage.removeItem(MEMBER_EMAIL_KEY)
    return true
  } catch {
    return false
  }
}

function buildLoginOverlay(): HTMLElement {
  const overlay = document.createElement("section")
  overlay.className = "login-gate"
  overlay.setAttribute("aria-labelledby", "login-title")
  overlay.innerHTML = `
    <form class="login-card" id="member-login">
      <p class="eyebrow">Acceso exclusivo</p>
      <h2 id="login-title">Ingresá con tu mail institucional</h2>
      <p>Esta página es solo para miembros de la institución.</p>
      <label class="email-lock-label" for="member-email-name">Mail institucional</label>
      <div class="locked-email">
        <input id="member-email-name" name="member-email-name" type="text" autocomplete="username" required
          pattern="[A-Za-z0-9._%+-]+" placeholder="tu.nombre">
        <span>@${INSTITUTION_DOMAIN}</span>
      </div>
      <p class="login-error" id="login-error" aria-live="polite"></p>
      <button class="button primary login-button" type="submit">Entrar</button>
    </form>
  `
  return overlay
}

function showMemberAccount(email: string): void {
  document.querySelectorAll(".member-account").forEach((account) => account.remove())

  const nav = document.querySelector(".nav-links")
  if (!nav) return

  const account = document.createElement("span")
  account.className = "member-account"
  account.innerHTML = `
    <span class="member-email">${email}</span>
    <button class="member-logout" type="button">Salir</button>
  `
  nav.append(account)

  account.querySelector(".member-logout")!.addEventListener("click", () => {
    clearSavedEmail()
    document.body.classList.add("auth-locked")
    account.remove()
    showLoginGate()
  })
}

function unlockPage(email: string): void {
  document.body.classList.remove("auth-locked")
  document.querySelector(".login-gate")?.remove()
  showMemberAccount(email)
}

function showLoginGate(): void {
  const overlay = buildLoginOverlay()
  document.body.append(overlay)

  const form = overlay.querySelector<HTMLFormElement>("#member-login")!
  const input = overlay.querySelector<HTMLInputElement>("#member-email-name")!
  const error = overlay.querySelector<HTMLElement>("#login-error")!

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault()
    const emailName = input.value.trim()

    if (!input.checkValidity() || emailName.length === 0 || !EMAIL_NAME_PATTERN.test(emailName)) {
      error.textContent = "Escribí la parte de tu mail antes del @."
      input.focus()
      return
    }

    const fullEmail = `${emailName}@${INSTITUTION_DOMAIN}`.toLowerCase()
    saveEmail(fullEmail)
    unlockPage(fullEmail)
  })
}

function requireInstitutionLogin(): void {
  const savedEmail = readSavedEmail()

  if (savedEmail) {
    unlockPage(savedEmail)
    return
  }

  showLoginGate()
}

requireInstitutionLogin()
