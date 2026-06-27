import { login } from './api'
import { saveSession, getSession } from './session'

const session = getSession()
if (session) {
  window.location.href = '/home.html'
}

const params = new URLSearchParams(window.location.search)
const email = params.get('email')

if (!email) {
  window.location.href = '/'
}

const form = document.getElementById('login-form') as HTMLFormElement
const emailDisplay = document.getElementById('login-email') as HTMLElement
const passwordInput = document.getElementById('login-password') as HTMLInputElement
const error = document.getElementById('login-error') as HTMLElement
const submitBtn = document.getElementById('login-submit') as HTMLButtonElement

emailDisplay.textContent = decodeURIComponent(email!)

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const password = passwordInput.value
  if (!password) return

  submitBtn.disabled = true
  error.textContent = ''

  try {
    const user = await login({ email: decodeURIComponent(email!), password })
    saveSession(user)
    window.location.href = '/home.html'
  } catch (err) {
    error.textContent = err instanceof Error ? err.message : 'Error al iniciar sesión'
    submitBtn.disabled = false
  }
})
