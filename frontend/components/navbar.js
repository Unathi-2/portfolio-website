class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { inline-size: 100%; display: block; position: sticky; inset-block-start: 0; z-index: 100; }
        nav {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-block-end: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        /* Manual dark mode check since :host-context is not fully supported in all browsers */
        /* We rely on the JS below to pass the class, or use CSS variables inherited from body */
        
        .nav-container { max-inline-size: 1280px; margin: 0 auto; padding: 0 1.5rem; }
        .nav-content { display: flex; justify-content: space-between; block-size: 4.5rem; align-items: center; }
        
        .logo {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 1.25rem;
          text-decoration: none;
          color: var(--text-primary, #0f172a);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .logo span { color: #06b6d4; }
        
        .nav-links { display: flex; gap: 2rem; }
        .nav-link {
          color: var(--text-secondary, #64748b);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .nav-link:hover, .nav-link.active { color: #06b6d4; }

        .theme-toggle {
            background: transparent;
            border: 1px solid var(--text-secondary, #cbd5e1);
            color: var(--text-secondary, #64748b);
            padding: 0.4rem;
            border-radius: 0.5rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        
        @media (max-inline-size: 768px) { .nav-links { display: none; } }
      </style>
      <nav>
        <div class="nav-container">
          <div class="nav-content">
            <a href="index.html" class="logo"><span>./</span>KB</a>
            <div class="nav-links">
              <a href="index.html" class="nav-link">Home</a>
              <a href="projects.html" class="nav-link">Data Lab</a>
              <a href="contact.html" class="nav-link">Contact</a>
            </div>
            <button class="theme-toggle" aria-label="Toggle Theme">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
            </button>
          </div>
        </div>
      </nav>
    `;

    // Highlight active link
    const currentPath = window.location.pathname;
    const links = this.shadowRoot.querySelectorAll('.nav-link');
    links.forEach(link => {
        if(link.getAttribute('href') === currentPath.split('/').pop() || (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Ensure styles update with theme (CSS variables approach)
    const updateStyles = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const nav = this.shadowRoot.querySelector('nav');
        const logo = this.shadowRoot.querySelector('.logo');
        const links = this.shadowRoot.querySelectorAll('.nav-link');
        const toggle = this.shadowRoot.querySelector('.theme-toggle');
        
        if(isDark) {
            nav.style.background = 'rgba(15, 23, 42, 0.8)';
            nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
            logo.style.color = '#f1f5f9';
            links.forEach(l => l.style.color = l.classList.contains('active') ? '#06b6d4' : '#94a3b8');
            toggle.style.borderColor = '#334155';
            toggle.style.color = '#94a3b8';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.8)';
            nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
            logo.style.color = '#0f172a';
            links.forEach(l => l.style.color = l.classList.contains('active') ? '#06b6d4' : '#64748b');
            toggle.style.borderColor = '#cbd5e1';
            toggle.style.color = '#64748b';
        }
    };
    
    // Initial run & Observer for class changes on <html>
    updateStyles();
    const observer = new MutationObserver(updateStyles);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
}
customElements.define('custom-navbar', CustomNavbar);
