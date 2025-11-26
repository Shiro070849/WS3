import { ref } from 'vue';
import { systemSettingsAPI, getFullImageUrl } from '@/services/api';

const currentTheme = ref(null);
const isThemeLoaded = ref(false);

export function useTheme() {
  /**
   * Calculate if text should be white or black based on background brightness
   */
  const getContrastColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';

    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? '#1A202C' : '#FFFFFF';
  };

  /**
   * Apply theme settings to the application
   */
  const applyTheme = (settings) => {
    const root = document.documentElement;

    // Apply CSS Variables
    root.style.setProperty('--primary-color', settings.primary_color || '#0090D3');
    root.style.setProperty('--primary-color-light', adjustColorBrightness(settings.primary_color || '#0090D3', 15));
    root.style.setProperty('--secondary-color', settings.secondary_color || '#6B7280');
    root.style.setProperty('--accent-color', settings.accent_color || '#10B981');
    root.style.setProperty('--background-color', settings.background_color || '#FFFFFF');
    root.style.setProperty('--text-color', settings.text_color || '#1A202C');

    // Calculate contrast colors for buttons
    root.style.setProperty('--secondary-text-color', getContrastColor(settings.secondary_color || '#6B7280'));

    // Apply Sidebar Colors (for company theme)
    root.style.setProperty('--sidebar-bg-start', settings.primary_color || '#1a4d7e');
    root.style.setProperty('--sidebar-bg-middle', adjustColorBrightness(settings.primary_color || '#1a4d7e', -10));
    root.style.setProperty('--sidebar-bg-end', adjustColorBrightness(settings.primary_color || '#1a4d7e', -20));

    // Apply Logo
    if (settings.logo_url) {
      updateLogo(settings.logo_url);
    }

    // Apply Favicon
    if (settings.favicon_url) {
      updateFavicon(settings.favicon_url);
    }

    currentTheme.value = settings;
    isThemeLoaded.value = true;
  };

  /**
   * Load theme from API for specific company
   */
  const loadTheme = async (companyId) => {
    if (!companyId) {
      console.warn('[INFO] No companyId provided, using default theme');
      applyTheme(getDefaultTheme());
      return;
    }

    try {
      const response = await systemSettingsAPI.getAppearance(companyId);

      if (response.data.success) {
        const settings = response.data.data;
        applyTheme(settings);

        // Save to localStorage for faster loading next time
        localStorage.setItem(`theme_${companyId}`, JSON.stringify(settings));
        localStorage.setItem(`theme_${companyId}_timestamp`, Date.now().toString());
      } else {
        console.error('[ERROR] Failed to load theme:', response.data);
        applyTheme(getDefaultTheme());
      }
    } catch (error) {
      console.error('[ERROR] Error loading theme:', error);

      // Try to load from localStorage cache
      const cached = localStorage.getItem(`theme_${companyId}`);
      if (cached) {
        applyTheme(JSON.parse(cached));
      } else {
        applyTheme(getDefaultTheme());
      }
    }
  };

  /**
   * Update logo images in the application
   */
  const updateLogo = (url) => {
    if (!url) return;

    const fullUrl = getFullImageUrl(url);

    // Update all elements with class 'app-logo'
    const logoElements = document.querySelectorAll('.app-logo');
    logoElements.forEach(img => {
      img.src = fullUrl;
      img.onerror = () => {
        console.warn('[INFO] Failed to load logo, using fallback');
        img.src = '/logo.png'; // Fallback logo
      };
    });
  };

  /**
   * Update favicon
   */
  const updateFavicon = (url) => {
    if (!url) return;

    const fullUrl = getFullImageUrl(url);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = fullUrl;

    link.onerror = () => {
      console.warn('[INFO] Failed to load favicon');
    };
  };

  /**
   * Adjust color brightness
   */
  const adjustColorBrightness = (hex, percent) => {
    if (!hex || !hex.startsWith('#')) return hex;

    // Remove # and parse RGB
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
    const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(2.55 * percent)));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  /**
   * Get default theme settings
   */
  const getDefaultTheme = () => ({
    logo_url: '',
    favicon_url: '',
    primary_color: '#0090D3',
    secondary_color: '#6B7280',
    accent_color: '#10B981',
    background_color: '#FFFFFF',
    text_color: '#1A202C'
  });

  /**
   * Clear theme cache for specific company
   */
  const clearThemeCache = (companyId) => {
    if (companyId) {
      localStorage.removeItem(`theme_${companyId}`);
      localStorage.removeItem(`theme_${companyId}_timestamp`);
    }
  };

  /**
   * NEW: ล้าง Theme ทั้งหมด (ใช้หลัง Logout)
   * Reset ทุกอย่างกลับไปเป็น Default Theme
   */
  const clearAllThemes = () => {
    // 1. ล้าง localStorage ทั้งหมดที่เกี่ยวกับ theme
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('theme_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 2. Reset CSS Variables กลับไปเป็น Default
    const defaultTheme = getDefaultTheme();
    applyTheme(defaultTheme);

    // 3. ล้าง currentTheme state
    currentTheme.value = null;
    isThemeLoaded.value = false;
  };

  /**
   * Reload theme (useful after settings update)
   */
  const reloadTheme = async (companyId) => {
    clearThemeCache(companyId);
    await loadTheme(companyId);
  };

  return {
    currentTheme,
    isThemeLoaded,
    applyTheme,
    loadTheme,
    reloadTheme,
    clearThemeCache,
    clearAllThemes,  // NEW: Export function ใหม่
    getDefaultTheme
  };
}
