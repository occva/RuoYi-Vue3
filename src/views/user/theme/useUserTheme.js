import { ref } from 'vue'

const USER_THEME_KEY = 'user-theme-mode'

export function useUserTheme() {
  const isDarkMode = ref(false)

  const applyTheme = (isDark) => {
    const root = document.documentElement
    const body = document.body
    root.setAttribute('data-user-theme', isDark ? 'dark' : 'light')
    body.setAttribute('data-user-theme', isDark ? 'dark' : 'light')
    root.classList.toggle('user-theme-dark', isDark)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem(USER_THEME_KEY)
    isDarkMode.value = savedTheme === 'dark'
    applyTheme(isDarkMode.value)
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme(isDarkMode.value)
    localStorage.setItem(USER_THEME_KEY, isDarkMode.value ? 'dark' : 'light')
  }

  const clearThemeFlags = () => {
    const root = document.documentElement
    const body = document.body
    root.removeAttribute('data-user-theme')
    body.removeAttribute('data-user-theme')
    root.classList.remove('user-theme-dark')
  }

  return {
    isDarkMode,
    initTheme,
    toggleTheme,
    clearThemeFlags
  }
}
