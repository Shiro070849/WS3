import { computed } from 'vue'

/**
 * Composable for managing theme colors
 * ตอนนี้ใช้ default blue color
 * Future: สามารถเซ็ต primary color จาก database/settings ได้
 */
export const useThemeColor = () => {
  // Default blue color (Admin หลัก)
  const primaryColor = '#0090D3'

  // Color palette based on primary color
  const colorPalette = computed(() => {
    return {
      primary: primaryColor,
      light: '#e0f0ff',
      lighter: '#f0f8ff',
      dark: '#0078b7',
      darker: '#005a8a',
      text: '#1a202c',
      border: '#e2e8f0',
      hover: '#0078b7'
    }
  })

  /**
   * Generate lighter shade of a color
   * @param {string} hex - hex color code
   * @param {number} percent - percentage (0-100)
   * @returns {string} lighter hex color
   */
  const lightenColor = (hex, percent = 20) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
  }

  /**
   * Generate darker shade of a color
   * @param {string} hex - hex color code
   * @param {number} percent - percentage (0-100)
   * @returns {string} darker hex color
   */
  const darkenColor = (hex, percent = 20) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt)
    const B = Math.max(0, (num & 0x0000FF) - amt)
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
  }

  return {
    primaryColor,
    colorPalette,
    lightenColor,
    darkenColor
  }
}
