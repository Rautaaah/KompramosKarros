const themeType = {
  obc2016: 'obc2016',
  light: 'light',
  dark: 'dark', // dark mode sucks and is janky asf
  default: 'light',
};

const isLocalStorageAvailable = (() => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return true;
})();

const getTheme = () => {
  if (!isLocalStorageAvailable) return themeType.default;
  const savedTheme = localStorage.getItem('rbx_theme_v1');
  return Object.values(themeType).includes(savedTheme) ? savedTheme : themeType.default;
};

const darkmode = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'rbx-dark-mode-styles';
  let style = document.getElementById(styleId);

  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  
  style.textContent = `
    html.dark {
      background: #141922 !important;
      color: #f2f4f8 !important;
    }

    html.dark body {
      background: #141922 !important;
      color: #f2f4f8 !important;
    }

    html.dark .card,
    html.dark .modal-content,
    html.dark .dropdown-menu,
    html.dark .table,
    html.dark .gamesContainer,
    html.dark .friendsContainer {
      background: #1b2230 !important;
      color: #f2f4f8 !important;
      border-color: #2d3748 !important;
      box-shadow: 0 1px 4px 0 rgb(0 0 0 / 35%) !important;
    }

    html.dark p,
    html.dark h1,
    html.dark h2,
    html.dark h3,
    html.dark h4,
    html.dark h5,
    html.dark h6,
    html.dark span,
    html.dark label,
    html.dark td,
    html.dark th,
    html.dark li,
    html.dark div {
      color: inherit;
    }

    html.dark a {
      color: #4dabf7 !important;
    }

    html.dark input, 
    html.dark textarea, 
    html.dark select {
      background: #1e1e1e !important;
      color: #ffffff !important;
      border-color: #444 !important;
    }

    html.dark .divider-top,
    html.dark .divider-bottom,
    html.dark hr {
      border-color: #2d3748 !important;
    }

    html.dark .text-dark,
    html.dark .text-muted {
      color: #f2f4f8 !important;
    }
  `;
};

const nodarkmode = () => {
  if (typeof document === 'undefined') return;
  const style = document.getElementById('rbx-dark-mode-styles');
  if (style) style.remove();
};

const setTheme = (theme) => {
  if (!isLocalStorageAvailable || !Object.values(themeType).includes(theme)) return;
  
  localStorage.setItem('rbx_theme_v1', theme);
  apply(theme);
};

const apply = (theme) => {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;

  Object.values(themeType).forEach((t) => html.classList.remove(t));
  
  html.classList.add(theme);
  
  if (theme === 'dark') {
    darkmode();
  } else {
    nodarkmode();
  }
};

if (isLocalStorageAvailable && typeof window !== 'undefined') {
  apply(getTheme());
}

export { themeType, getTheme, setTheme, apply };
