/**
 * useDarkMode.js
 * Composable สำหรับจัดการ Dark Mode (User Preference)
 * - บันทึกใน localStorage
 * - ไม่เกี่ยวกับ Company Theme
 */

import { ref } from 'vue'

// Global state (shared across components)
const isDark = ref(false)

export function useDarkMode() {
  /**
   * โหลด Dark Mode preference จาก localStorage
   */
  const initDarkMode = () => {
    const saved = localStorage.getItem('theme_mode')

    // ถ้าไม่เคยตั้งค่า → ใช้ light mode (default)
    if (!saved) {
      isDark.value = false
      applyDarkMode(false)
      return
    }

    // ถ้ามีการตั้งค่าไว้แล้ว → โหลดกลับมา
    isDark.value = saved === 'dark'
    applyDarkMode(isDark.value)

    console.log('[DARK MODE] Loaded preference:', isDark.value ? 'Dark' : 'Light')
  }

  /**
   * Toggle Dark Mode (เปิด/ปิด)
   */
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)

    // บันทึกใน localStorage
    localStorage.setItem('theme_mode', isDark.value ? 'dark' : 'light')

    console.log('[DARK MODE] Toggled to:', isDark.value ? 'Dark' : 'Light')
  }

  /**
   * Apply Dark Mode (เพิ่ม/ลบ class "dark" บน <html>)
   */
  const applyDarkMode = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    isDark,
    toggleDarkMode,
    initDarkMode
  }
}
