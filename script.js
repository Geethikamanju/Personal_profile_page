/**
 * Personal Profile Interactive Script
 * Handles theme switching, mobile drawer navigation, copy-to-clipboard,
 * interactive project modals, and contact form handling with toast feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initActiveNavScroll();
  initCopyEmail();
  initProjectModals();
  initContactForm();
  updateFooterYear();
});

/* ==========================================================================
   1. Theme Toggle (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved preference or default to system preference or 'dark'
  const savedTheme = localStorage.getItem('profile_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  htmlRoot.setAttribute('data-theme', initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('profile_theme', newTheme);

      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
    });
  }
}

/* ==========================================================================
   2. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Auto-close menu when link clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   3. Active Navigation State on Scroll
   ========================================================================== */
function initActiveNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. Copy Email to Clipboard
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('btnCopyEmail');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.getAttribute('data-email') || 'alex.morgan.codes@example.com';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback for non-https or older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Visual feedback on button
      const btnText = copyBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;
      btnText.textContent = 'Copied!';
      copyBtn.style.borderColor = 'var(--color-success)';

      showToast('Email address copied to clipboard!', 'success');

      setTimeout(() => {
        btnText.textContent = originalText;
        copyBtn.style.borderColor = '';
      }, 2500);

    } catch (err) {
      showToast('Could not copy email automatically.', 'error');
    }
  });
}

/* ==========================================================================
   5. Interactive Project Details Modal
   ========================================================================== */
const projectData = {
  nova: {
    title: 'Nova Analytics Dashboard',
    tagline: 'High-frequency telemetry & metrics platform',
    description: 'Nova is a modern real-time performance analytics platform built for high-throughput microservices. It aggregates incoming WebSocket telemetry streams, rendering millions of datapoints smoothly with zero UI stutter.',
    technologies: ['TypeScript', 'Canvas API', 'WebSockets', 'CSS Grid', 'Node.js', 'Redis'],
    highlights: [
      'Sub-100ms cold start load time with optimized client bundle under 45kb gzip.',
      'Custom canvas rendering engine bypassing standard DOM chart limitations.',
      'Real-time anomaly detection triggers and automated webhook alerts.'
    ],
    liveUrl: 'https://example.com/nova-demo',
    githubUrl: 'https://github.com'
  },
  aura: {
    title: 'Aura Component Library',
    tagline: 'Enterprise-grade accessible design system',
    description: 'Aura is a zero-dependency, standards-compliant UI system engineered to power modern enterprise web applications. It includes an automated design token generator for seamless dark/light theme switching.',
    technologies: ['Vanilla JS (ESNext)', 'CSS Custom Properties', 'WCAG AAA', 'Web Components', 'Storybook'],
    highlights: [
      '30+ accessible components adhering strictly to WAI-ARIA authoring practices.',
      'Integrated theme engine with dynamic contrast calculation and font scaling.',
      'Over 95% automated unit and visual regression test coverage.'
    ],
    liveUrl: 'https://example.com/aura-system',
    githubUrl: 'https://github.com'
  },
  pulse: {
    title: 'Pulse Cloud Orchestrator',
    tagline: 'Container management & deployment dashboard',
    description: 'Pulse gives engineering teams complete visibility into container clusters across multiple regions. It features automated rollback triggers, CPU/Memory telemetry streaming, and role-based access control.',
    technologies: ['Node.js', 'Docker API', 'WebSockets', 'PostgreSQL', 'Tailored CSS', 'Vite'],
    highlights: [
      'Visual deployment pipeline inspector with step-by-step log streaming.',
      'Zero-downtime rolling update orchestrator with automatic canary verification.',
      'Designed for dark-mode first developer environments.'
    ],
    liveUrl: 'https://example.com/pulse-cloud',
    githubUrl: 'https://github.com'
  }
};

function initProjectModals() {
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalCloseBtn');
  const triggers = document.querySelectorAll('.project-modal-trigger');

  if (!modal || !modalBody) return;

  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    modalBody.innerHTML = `
      <div class="modal-project-badge">${data.tagline}</div>
      <h3 class="modal-project-title" id="modalTitle">${data.title}</h3>
      <p class="modal-desc">${data.description}</p>
      
      <div class="modal-highlights">
        <h4>Key Engineering Highlights</h4>
        <ul>
          ${data.highlights.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-tech-list">
        ${data.technologies.map(tech => `<span class="chip">${tech}</span>`).join('')}
      </div>

      <div class="modal-actions" style="display: flex; gap: 12px; margin-top: 20px;">
        <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <span>Live Demo</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
        </a>
        <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          <span>GitHub Repo</span>
        </a>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const projectId = trigger.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. Contact Form Validation & Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('senderName');
  const emailInput = document.getElementById('senderEmail');
  const messageInput = document.getElementById('senderMessage');
  const submitBtn = document.getElementById('submitFormBtn');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function clearErrors() {
    form.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let hasError = false;

    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      emailInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    if (!messageInput.value.trim()) {
      messageInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    if (hasError) {
      showToast('Please fill in the required fields correctly.', 'error');
      return;
    }

    // Simulate sending state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      form.reset();
      showToast('Thank you! Your message has been sent successfully.', 'success');
    }, 1000);
  });
}

/* ==========================================================================
   7. Toast Notification Utility
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3500);
}

/* ==========================================================================
   8. Footer Year Auto-Update
   ========================================================================== */
function updateFooterYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
