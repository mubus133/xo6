/**
 * Sx06 Luxe — SUSTAINX06 LUXURY
 * Main JavaScript File
 * 
 * Handles global functionality across all pages
 */

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  apiEndpoints: {
    // Add your API endpoints here when ready
    contact: 'YOUR_CONTACT_API_ENDPOINT',
    newsletter: 'YOUR_NEWSLETTER_API_ENDPOINT',
    chatbot: 'YOUR_CHATBOT_API_ENDPOINT'
  },
  animation: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  lazyLoad: {
    rootMargin: '50px',
    threshold: 0.01
  }
};


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Debounce function to limit function calls
 */
const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls
 */
const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Get current timestamp
 */
const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Validate email address
 */
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Smooth scroll to element
 */
const smoothScrollTo = (target, offset = 80) => {
  const element = document.querySelector(target);
  if (!element) return;
  
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
};


// ==========================================
// NAVBAR FUNCTIONALITY
// ==========================================

class Navigation {
  constructor() {
    this.navbar = document.getElementById('mainNav');
    this.lastScrollTop = 0;
    this.init();
  }
  
  init() {
    if (!this.navbar) return;
    
    // Scroll effect
    window.addEventListener('scroll', throttle(() => {
      this.handleScroll();
    }, 100));
    
    // Mobile menu
    this.setupMobileMenu();
  }
  
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
    
    this.lastScrollTop = scrollTop;
  }
  
  setupMobileMenu() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
          });
          bsCollapse.hide();
        }
      });
    });
  }
}


// ==========================================
// INTERSECTION OBSERVER (Reveal on Scroll)
// ==========================================

class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('[data-observe]');
    this.init();
  }
  
  init() {
    if (!this.elements.length) return;
    
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: stop observing after reveal
          // observer.unobserve(entry.target);
        }
      });
    }, options);
    
    this.elements.forEach(el => observer.observe(el));
  }
}


// ==========================================
// LAZY LOADING IMAGES
// ==========================================

class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }
  
  init() {
    if (!this.images.length) return;
    
    // Browser native lazy loading fallback
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      return;
    }
    
    // Fallback: Use IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, CONFIG.lazyLoad);
    
    this.images.forEach(img => observer.observe(img));
  }
}


// ==========================================
// NEWSLETTER FORM
// ==========================================

class Newsletter {
  constructor() {
    this.form = document.getElementById('newsletterForm');
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(e);
    });
  }
  
  async handleSubmit(e) {
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validate
    if (!validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';
    
    try {
      // Mock API call - Replace with actual endpoint
      await this.subscribe(email);
      
      this.showMessage(`Thank you for subscribing! We'll send exclusive updates to ${email}`, 'success');
      e.target.reset();
    } catch (error) {
      this.showMessage('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  }
  
  async subscribe(email) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    /*
     * PRODUCTION: Replace with actual API call
     * 
     * const response = await fetch(CONFIG.apiEndpoints.newsletter, {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ email })
     * });
     * 
     * if (!response.ok) throw new Error('Subscription failed');
     * return await response.json();
     */
    
    return { success: true };
  }
  
  showMessage(message, type = 'success') {
    // Create or update message element
    let messageEl = this.form.querySelector('.form-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'form-message';
      this.form.appendChild(messageEl);
    }
    
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.cssText = `
      margin-top: 1rem;
      padding: 0.8rem;
      border-radius: 8px;
      font-size: 0.9rem;
      background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
      color: ${type === 'success' ? '#155724' : '#721c24'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
}


// ==========================================
// DATA FETCHING UTILITIES
// ==========================================

class DataFetcher {
  /**
   * Fetch JSON data from local files
   */
  static async fetchJSON(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Load gallery data
   */
  static async loadGallery() {
    const data = await this.fetchJSON('data/gallery.json');
    return data?.items || [];
  }
  
  /**
   * Load reviews data
   */
  static async loadReviews() {
    const data = await this.fetchJSON('data/reviews.json');
    return data?.reviews || [];
  }
  
  /**
   * Load links data
   */
  static async loadLinks() {
    const data = await this.fetchJSON('data/links.json');
    return data?.links || [];
  }
}


// ==========================================
// ANALYTICS (Optional)
// ==========================================

class Analytics {
  static trackPageView(pageName) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }
  
  static trackEvent(category, action, label = null, value = null) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }
  
  static trackClick(elementName) {
    this.trackEvent('engagement', 'click', elementName);
  }
}


// ==========================================
// LOCAL STORAGE UTILITIES
// ==========================================

class Storage {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }
  
  static get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }
}


// ==========================================
// PERFORMANCE MONITORING
// ==========================================

class Performance {
  static logPageLoad() {
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - 
                      window.performance.timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    }
  }
  
  static observeWebVitals() {
    // Core Web Vitals monitoring
    // Requires web-vitals library or manual implementation
    if (typeof webVitals !== 'undefined') {
      webVitals.getCLS(console.log);
      webVitals.getFID(console.log);
      webVitals.getLCP(console.log);
    }
  }
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core modules
  new Navigation();
  new ScrollReveal();
  new LazyLoader();
  new Newsletter();
  
  // Log page load performance (dev only)
  if (window.location.hostname === 'localhost') {
    Performance.logPageLoad();
  }
  
  // Track page view (if analytics enabled)
  // Analytics.trackPageView(document.title);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    debounce,
    throttle,
    validateEmail,
    smoothScrollTo,
    DataFetcher,
    Analytics,
    Storage
  };
}