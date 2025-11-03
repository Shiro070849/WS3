import { ref } from 'vue';
import { systemSettingsAPI, getBackendBaseUrl } from '@/services/api';

const currentTheme = ref(null);
const isThemeLoaded = ref(false);

export function useTheme() {
  /**
   * Apply theme settings to the application
   */
  const applyTheme = (settings) => {
    const root = document.documentElement;

    console.log('🎨 Applying theme:', settings);

    // Apply CSS Variables
    root.style.setProperty('--primary-color', settings.primary_color || '#0090D3');
    root.style.setProperty('--primary-color-light', adjustColorBrightness(settings.primary_color || '#0090D3', 15));
    root.style.setProperty('--secondary-color', settings.secondary_color || '#6B7280');
    root.style.setProperty('--accent-color', settings.accent_color || '#10B981');
    root.style.setProperty('--background-color', settings.background_color || '#FFFFFF');
    root.style.setProperty('--text-color', settings.text_color || '#1A202C');
    root.style.setProperty('--font-family', settings.font_family || 'Prompt');
    root.style.setProperty('--border-radius', (settings.border_radius || '8') + 'px');
    root.style.setProperty('--base-font-size', (settings.base_font_size || '14') + 'px');
    root.style.setProperty('--header-height', (settings.header_height || '64') + 'px');

    // Apply Sidebar Colors (for company theme)
    root.style.setProperty('--sidebar-bg-start', settings.primary_color || '#1a4d7e');
    root.style.setProperty('--sidebar-bg-middle', adjustColorBrightness(settings.primary_color || '#1a4d7e', -10));
    root.style.setProperty('--sidebar-bg-end', adjustColorBrightness(settings.primary_color || '#1a4d7e', -20));

    // Apply Theme Mode (Dark/Light)
    if (settings.theme_mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply Compact Mode
    if (settings.compact_mode === 'true') {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }

    // Apply Logo
    if (settings.logo_url) {
      updateLogo(settings.logo_url);
    }

    // Apply Favicon
    if (settings.favicon_url) {
      updateFavicon(settings.favicon_url);
    }

    // Apply Font Family to body
    document.body.style.fontFamily = `${settings.font_family || 'Prompt'}, sans-serif`;

    currentTheme.value = settings;
    isThemeLoaded.value = true;

    console.log('✅ Theme applied successfully');
  };

  /**
   * Load theme from API for specific company
   */
  const loadTheme = async (companyId) => {
    if (!companyId) {
      console.warn('⚠️ No companyId provided, using default theme');
      applyTheme(getDefaultTheme());
      return;
    }

    try {
      console.log(`📥 Loading theme for company ID: ${companyId}`);
      const response = await systemSettingsAPI.getAppearance(companyId);

      if (response.data.success) {
        const settings = response.data.data;
        applyTheme(settings);

        // Save to localStorage for faster loading next time
        localStorage.setItem(`theme_${companyId}`, JSON.stringify(settings));
        localStorage.setItem(`theme_${companyId}_timestamp`, Date.now().toString());
      } else {
        console.error('❌ Failed to load theme:', response.data);
        applyTheme(getDefaultTheme());
      }
    } catch (error) {
      console.error('❌ Error loading theme:', error);

      // Try to load from localStorage cache
      const cached = localStorage.getItem(`theme_${companyId}`);
      if (cached) {
        console.log('📦 Loading theme from cache');
        applyTheme(JSON.parse(cached));
      } else {
        console.log('🎨 Using default theme');
        applyTheme(getDefaultTheme());
      }
    }
  };

  /**
   * Helper: แปลง relative path เป็น full URL
   */
  const getFullImageUrl = (url) => {
    if (!url) return '';
    // ถ้าเป็น full URL (http/https) ใช้ตรงๆ
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // ถ้าเป็น relative path ให้เติม backend base URL
    return `${getBackendBaseUrl()}${url}`;
  };

  /**
   * Update logo images in the application
   */
  const updateLogo = (url) => {
    if (!url) return;

    const fullUrl = getFullImageUrl(url);
    console.log('🖼️ Updating logo:', fullUrl);

    // Update all elements with class 'app-logo'
    const logoElements = document.querySelectorAll('.app-logo');
    logoElements.forEach(img => {
      img.src = fullUrl;
      img.onerror = () => {
        console.warn('⚠️ Failed to load logo, using fallback');
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
    console.log('🔖 Updating favicon:', fullUrl);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = fullUrl;

    link.onerror = () => {
      console.warn('⚠️ Failed to load favicon');
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
    text_color: '#1A202C',
    font_family: 'Prompt',
    border_radius: '8',
    base_font_size: '14',
    header_height: '64',
    theme_mode: 'light',
    compact_mode: 'false'
  });

  /**
   * Clear theme cache for specific company
   */
  const clearThemeCache = (companyId) => {
    if (companyId) {
      localStorage.removeItem(`theme_${companyId}`);
      localStorage.removeItem(`theme_${companyId}_timestamp`);
      console.log('🗑️ Theme cache cleared for company:', companyId);
    }
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
    getDefaultTheme
  };
}
