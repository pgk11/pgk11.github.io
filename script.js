// ----- Helpers -----
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

// Year
$('#year').textContent = new Date().getFullYear();

// ----- Theme toggle -----
const themeBtn = $('#theme-btn');
const applyTheme = (t) => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
  themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
};
// Initialize from <html data-theme> set early in <head>
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

// ----- Mobile nav -----
const nav = $('#site-nav');
const navToggle = $('.nav-toggle');
navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close menu on link click (mobile)
$$('#site-nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Smooth scroll for in-page links
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      $(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ----- Projects loader with graceful fallback -----
const defaultProjects = [
  {
    title: "Deepfake Video Detector",
    description: "Video-only deepfake detection pipeline with Streamlit UI and Grad-CAM.",
    stack: ["PyTorch", "OpenCV", "Streamlit"],
    image: "assets/proj1.png",
    code: "https://github.com/pgk11",      // replace with repo
    demo: "",
    highlights: ["Frame extraction pipeline", "Explainability via Grad-CAM"]
  },
  {
    title: "Malware Classification from API Calls",
    description: "Classifies files as benign/malicious using CNN, BiLSTM, and hybrid models.",
    stack: ["TensorFlow", "Keras", "Pandas"],
    image: "assets/proj2.png",
    code: "https://github.com/pgk11",      // replace with repo
    demo: "",
    highlights: ["F1 ~0.95 (example placeholder)", "ROC curves & confusion matrix"]
  },
  {
    title: "Post-Quantum MQTT Handshake (Kyber)",
    description: "ML-KEM-512 key exchange over MQTT between ESP32 (sim) and Python client.",
    stack: ["Python", "paho-mqtt", "pqcrypto"],
    image: "assets/proj3.png",
    code: "https://github.com/pgk11",      // replace with repo
    demo: "",
    highlights: ["Shared secret exchange", "Perf stats (RAM & latency)"]
  }
];

async function loadProjects() {
  const grid = $('#projects-grid');
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    const ok = res.ok && res.headers.get('content-type')?.includes('application/json');
    const data = ok ? await res.json() : defaultProjects;
    renderProjects(grid, data);
  } catch {
    renderProjects(grid, defaultProjects);
  }
}

function renderProjects(grid, projects) {
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();

  projects.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card will-animate';

    card.innerHTML = `
      <img src="${p.image || ''}" alt="${p.title || 'Project'} preview">
      <h3>${p.title || ''}</h3>
      <p>${p.description || ''}</p>
      <p class="stack">${(p.stack || []).join(' • ')}</p>
      <div class="badges">
        ${(p.highlights || []).map(h => `<span>${h}</span>`).join('')}
      </div>
      <div class="card-actions">
        ${p.demo ? `<a class="btn" href="${p.demo}" target="_blank" rel="noopener">Live</a>` : ''}
        ${p.code ? `<a class="btn ghost" href="${p.code}" target="_blank" rel="noopener">Code</a>` : ''}
      </div>
    `;
    frag.appendChild(card);
  });

  grid.appendChild(frag);
  revealOnScroll($$('.will-animate', grid));
}

// Fancy reveal on scroll
function revealOnScroll(items) {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.animate(
          [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
        );
        e.target.classList.remove('will-animate');
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => obs.observe(el));
}

loadProjects();

// ----- Contact form (Formspree or gentle reminder) -----
const form = $('#contact-form');
const formStatus = $('#form-status');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const action = form.getAttribute('action') || '';
  if (action.includes('yourformid')) {
    formStatus.textContent = 'Tip: Add your real Formspree endpoint in the form action.';
    formStatus.style.color = 'var(--warn)';
    return;
  }

  const data = new FormData(form);
  try {
    const res = await fetch(action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      form.reset();
      formStatus.textContent = 'Thanks! Your message has been sent.';
      formStatus.style.color = 'var(--ok)';
    } else {
      formStatus.textContent = 'Something went wrong. Please email me directly.';
      formStatus.style.color = 'var(--warn)';
    }
  } catch {
    formStatus.textContent = 'Network error. Please try again later.';
    formStatus.style.color = 'var(--warn)';
  }
});

// ----- Back to top button -----
const toTop = $('#toTop');
const toggleTop = () => {
  if (window.scrollY > 300) toTop.classList.add('show');
  else toTop.classList.remove('show');
};
toggleTop();
window.addEventListener('scroll', toggleTop);
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
