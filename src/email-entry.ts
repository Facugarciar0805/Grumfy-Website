import { checkEmail } from './api'
import { getSession } from './session'

const session = getSession()
if (session) {
  window.location.href = '/home.html'
}

const form = document.getElementById('email-form') as HTMLFormElement
const input = document.getElementById('email-name') as HTMLInputElement
const error = document.getElementById('email-error') as HTMLElement
const submitBtn = document.getElementById('email-submit') as HTMLButtonElement

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = input.value.trim()
  if (!name || !input.checkValidity()) return

  submitBtn.disabled = true
  error.textContent = ''

  const fullEmail = `${name}@santamariapilar.edu.ar`

  try {
    const { exists } = await checkEmail(fullEmail)
    const page = exists ? 'login' : 'register'
    window.location.href = `/${page}.html?email=${encodeURIComponent(fullEmail)}`
  } catch (err) {
    error.textContent = err instanceof Error ? err.message : 'Error al verificar email'
    submitBtn.disabled = false
  }
})
