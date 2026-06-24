/**
 * Minecraft Query - Main Client-Side JavaScript
 * Handles: Toast notifications, Back-to-top, Dark mode, Search autocomplete, Loading states
 */

// ============================================
// Toast Notification System
// ============================================

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    const icons = {
      success: `<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      error: `<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>`,
      warning: `<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>`,
      info: `<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    };

    toast.innerHTML = `
      ${icons[type] || icons.info}
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// ============================================
// Back to Top Button
// ============================================

const BackToTop = {
  button: null,

  init() {
    this.button = document.getElementById('back-to-top');
    if (!this.button) return;

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    });

    // Smooth scroll to top
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

// ============================================
// Dark Mode
// ============================================

const DarkMode = {
  init() {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedMode === 'true' || (!savedMode && systemPrefersDark)) {
      this.enable();
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('darkMode')) {
        if (e.matches) {
          this.enable();
        } else {
          this.disable();
        }
      }
    });
  },

  toggle() {
    if (document.documentElement.classList.contains('dark')) {
      this.disable();
    } else {
      this.enable();
    }
  },

  enable() {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
    this.updateToggleButton(true);
  },

  disable() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
    this.updateToggleButton(false);
  },

  updateToggleButton(isDark) {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = isDark
        ? `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>`
        : `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>`;
    }
  }
};

// ============================================
// Search Autocomplete
// ============================================

const SearchAutocomplete = {
  input: null,
  dropdown: null,
  debounceTimer: null,
  selectedIndex: -1,

  init() {
    this.input = document.querySelector('input[name="keyword"]');
    if (!this.input) return;

    // Create dropdown container
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg shadow-lg z-50 hidden max-h-60 overflow-y-auto';
    this.input.parentElement.style.position = 'relative';
    this.input.parentElement.appendChild(this.dropdown);

    // Event listeners
    this.input.addEventListener('input', () => this.debounceSearch());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('focus', () => {
      if (this.input.value.length >= 2) this.search();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.input.parentElement.contains(e.target)) {
        this.hide();
      }
    });
  },

  debounceSearch() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search(), 300);
  },

  async search() {
    const keyword = this.input.value.trim();
    if (keyword.length < 2) {
      this.hide();
      return;
    }

    try {
      const response = await fetch(`/api/players/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        this.showResults(data.data);
      } else {
        this.hide();
      }
    } catch (error) {
      console.error('Search autocomplete error:', error);
      this.hide();
    }
  },

  showResults(players) {
    this.selectedIndex = -1;
    this.dropdown.innerHTML = players.slice(0, 8).map((player, index) => `
      <a href="/player/${player.UUID}" class="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${index === this.selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}"
         data-index="${index}">
        <img src="https://mc-heads.net/avatar/${player.UUID}/32" alt="${player.userName}" class="h-8 w-8 rounded-full mr-3">
        <div>
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${player.userName}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${player.online ? '在线' : '离线'}</div>
        </div>
      </a>
    `).join('');

    this.show();
  },

  show() {
    this.dropdown.classList.remove('hidden');
  },

  hide() {
    this.dropdown.classList.add('hidden');
    this.selectedIndex = -1;
  },

  handleKeydown(e) {
    const items = this.dropdown.querySelectorAll('a');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        break;
      case 'Enter':
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          e.preventDefault();
          window.location.href = items[this.selectedIndex].href;
        }
        break;
      case 'Escape':
        this.hide();
        break;
    }
  },

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('bg-gray-100', 'dark:bg-gray-700');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-gray-100', 'dark:bg-gray-700');
      }
    });
  }
};

// ============================================
// Loading Progress Bar
// ============================================

const ProgressBar = {
  bar: null,
  progress: 0,

  init() {
    this.bar = document.getElementById('progress-bar');
    if (!this.bar) return;

    // Show progress on page navigation
    window.addEventListener('beforeunload', () => this.start());
    window.addEventListener('load', () => this.complete());
  },

  start() {
    if (!this.bar) return;
    this.progress = 0;
    this.bar.style.width = '0%';
    this.bar.style.opacity = '1';
    this.simulateProgress();
  },

  simulateProgress() {
    if (this.progress < 90) {
      this.progress += Math.random() * 10;
      this.bar.style.width = `${this.progress}%`;
      setTimeout(() => this.simulateProgress(), 200);
    }
  },

  complete() {
    if (!this.bar) return;
    this.progress = 100;
    this.bar.style.width = '100%';
    setTimeout(() => {
      this.bar.style.opacity = '0';
      setTimeout(() => {
        this.bar.style.width = '0%';
      }, 300);
    }, 500);
  }
};

// ============================================
// Animation Observer
// ============================================

const AnimationObserver = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
};

// ============================================
// Mobile Menu
// ============================================

const MobileMenu = {
  init() {
    const button = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (button && menu) {
      button.addEventListener('click', () => {
        menu.classList.toggle('hidden');
        // Animate menu items
        if (!menu.classList.contains('hidden')) {
          menu.querySelectorAll('a').forEach((item, index) => {
            item.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
          });
        }
      });
    }
  }
};

// ============================================
// Clipboard Copy
// ============================================

const Clipboard = {
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      Toast.success('已复制到剪贴板');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      Toast.success('已复制到剪贴板');
    }
  }
};

// ============================================
// Data Export
// ============================================

const DataExport = {
  toCSV(data, filename) {
    if (!data || data.length === 0) {
      Toast.warning('没有数据可导出');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    this.download(csv, filename, 'text/csv');
  },

  toJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    this.download(json, filename, 'application/json');
  },

  download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Toast.success('导出成功');
  }
};

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  BackToTop.init();
  DarkMode.init();
  SearchAutocomplete.init();
  ProgressBar.init();
  AnimationObserver.init();
  MobileMenu.init();

  // Add dark mode transition class after initial load
  setTimeout(() => {
    document.documentElement.classList.add('dark-mode-transition');
  }, 100);
});

// Global utility functions
window.showToast = (message, type, duration) => Toast.show(message, type, duration);
window.toggleDarkMode = () => DarkMode.toggle();
window.copyToClipboard = (text) => Clipboard.copy(text);
window.exportCSV = (data, filename) => DataExport.toCSV(data, filename);
window.exportJSON = (data, filename) => DataExport.toJSON(data, filename);
