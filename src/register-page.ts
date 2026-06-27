import { register } from './api'
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

const form = document.getElementById('register-form') as HTMLFormElement
const emailDisplay = document.getElementById('register-email') as HTMLElement
const nameInput = document.getElementById('register-name') as HTMLInputElement
const phoneInput = document.getElementById('register-phone') as HTMLInputElement
const passwordInput = document.getElementById('register-password') as HTMLInputElement
const confirmInput = document.getElementById('register-confirm') as HTMLInputElement
const error = document.getElementById('register-error') as HTMLElement
const submitBtn = document.getElementById('register-submit') as HTMLButtonElement

emailDisplay.textContent = decodeURIComponent(email!)

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = nameInput.value.trim()
  const phone = phoneInput.value.trim()
  const password = passwordInput.value
  const confirm = confirmInput.value

  if (!name || !phone || !password) return
  if (password !== confirm) {
    error.textContent = 'Las contraseñas no coinciden'
    return
  }

  submitBtn.disabled = true
  error.textContent = ''

  try {
    const user = await register({
      name,
      email: decodeURIComponent(email!),
      password,
      phone,
    })
    saveSession(user)
    window.location.href = '/home.html'
  } catch (err) {
    error.textContent = err instanceof Error ? err.message : 'Error al registrarse'
    submitBtn.disabled = false
  }
})
