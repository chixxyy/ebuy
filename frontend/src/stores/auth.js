import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const router = useRouter()

  function login(username, password) {
    // Mock login
    if (username && password) {
      user.value = { username, name: 'Demo User' }
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  function register(username, password, email) {
    // Mock register
    if (username && password && email) {
      user.value = { username, name: 'New User' }
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
    // We'll handle redirection in the component or here if we have router instance
  }

  return { user, login, register, logout }
})
