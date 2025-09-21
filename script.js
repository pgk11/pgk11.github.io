// ---------- Helpers ----------
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Theme toggle ----------
const themeBtn = $('#theme-btn');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
  }
}
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
themeBtn?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

// ---------- Mobile nav ----------
const nav = $('#site-nav');
const navToggle = $('.nav-toggle');
navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
$$('#site-nav a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));

// ---------- Scroll progress bar ----------
const bar = $('.scrollbar .bar');
if (bar) {
  addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = `${scrolled}%`;
  });
}

// ---------- Built-in project data (fallback if no projects.json) ----------
const BUILT_IN_PROJECTS = [
  {
    title: "PQC_Kyber",
    description: "ML-KEM-512 key exchange over MQTT (ESP32 sim + Python client) with perf stats and shared secret exchange.",
    stack: ["Python", "MQTT", "Kyber"],
    image: "assets/pqc_kyber.png",
    code: "https://github.com/pgk11/PQC_Kyber",
    demo: "",
    highlights: ["IoT-ready flow", "Latency/RAM measurements"]
  },
  {
    title: "Phishing detection using AI / NLP (DistilBERT)",
    description: "Phishing classifier using DistilBERT with explainable outputs and robust preprocessing.",
    stack: ["Python", "DistilBERT", "NLP"],
    image: "assets/phishing_nlp.png",
    code: "https://github.com/pgk11/Phishing-detection-using-DistilBERT",
    demo: "",
    highlights: ["Transformer model", "Explainability hooks"]
  },
  {
    title: "PG management website",
    description: "Full-stack PG management portal with tenant onboarding, rent tracking, and admin analytics.",
    stack: ["React", "Node", "PostgreSQL"],
    image: "assets/pg_management.png",
    code: "https://github.com/pgk11/PG-management-website",
    demo: "",
    highlights: ["Role-based access", "Receipts & reminders"]
  },
  {
    title: "Stock prediction — candlestick pattern scanner",
    description: "Pattern scanner + predictive signals dashboard using candlesticks; alerts for key formations.",
    stack: ["Python", "Pandas", "TA"],
    image: "assets/stock_candlestick.png",
    code: "https://github.com/pgk11/Stock-prediction-using-candlestick-pattern-scanner",
    demo: "",
    highlights: ["Scanner + signals", "Alerting workflow"]
  }
];

// Show total count on the hero (index only)
const projectCountEl = $('#projectCount');
if (projectCountEl) projectCountEl.textContent = String(BUILT_IN_PROJECTS.length);

// ---------- Projects page logic ----------
const state = { query: '', activeTags: new Set(), data: [] };

const searchEl = $('#search');
const filtersEl = $('#filters');
const gridEl = $('#projects-grid');

if (gridEl) {
  loadProjects().then(() => {
    initFilters(state.data);
    renderProjects(state.data);
  });

  searchEl?.addEventListener('input', (e) => {
    state.query = e.target.value.toLowerCase();
    renderProjects(state.data);
  });
}

async function loadProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    const ok = res.ok && res.headers.get('content-type')?.includes('application/json');
    state.data = ok ? await res.json() : BUILT_IN_PROJECTS;
  } catch {
    state.data = BUILT_IN_PROJECTS;
  }
}

function initFilters(data) {
  if (!filtersEl) return;
  const tags = new Set(data.flatMap(p => p.stack || []));
  filtersEl.innerHTML = '';

  const allChip = makeChip('All', true);
  filtersEl.appendChild(allChip);
  [...tags].sort().forEach(tag => filtersEl.appendChild(makeChip(tag, false)));

  function makeChip(label, pressed) {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', String(pressed));
    btn.addEventListener('click', () => {
      if (label === 'All') {
        state.activeTags.clear();
        [...filtersEl.children].forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
      } else {
        const isOn = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!isOn));
        if (isOn) state.activeTags.delete(label); else state.activeTags.add(label);
        filtersEl.firstElementChild.setAttribute('aria-pressed', String(state.activeTags.size === 0));
      }
      renderProjects(state.data);
    });
    return btn;
  }
}

function renderProjects(projects) {
  if (!gridEl) return;
  const q = state.query;
  const tags = state.activeTags;

  const filtered = projects.filter(p => {
    const hitText =
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.stack || []).some(s => s.toLowerCase().includes(q));
    const hitTags = tags.size === 0 || (p.stack || []).some(s => tags.has(s));
    return hitText && hitTags;
  });

  gridEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card will-animate';
    card.innerHTML = `
      <div class="glow"></div>
      <img src="${p.image || ''}" alt="${p.title || 'Project'} preview">
      <h3>${p.title || ''}</h3>
      <p>${p.description || ''}</p>
      <p class="stack">${(p.stack || []).join(' • ')}</p>
      <div class="badges">${(p.highlights || []).map(h => `<span>${h}</span>`).join('')}</div>
      <div class="card-actions">
        ${p.demo ? `<a class="btn" href="${p.demo}" target="_blank" rel="noopener">Live</a>` : ''}
        ${p.code ? `<a class="btn ghost" href="${p.code}" target="_blank" rel="noopener">Code</a>` : ''}
      </div>
    `;
    // Tilt / spotlight
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width) - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      card.style.setProperty('--mx', `${(x / r.width) * 100}%`);
      card.style.setProperty('--my', `${(y / r.height) * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });

    frag.appendChild(card);
  });

  gridEl.appendChild(frag);
  revealOnScroll($$('.will-animate', gridEl));
}

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

// ---------- Contact form ----------
const form = $('#contact-form');
const formStatus = $('#form-status');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const action = form.getAttribute('action') || '';
  if (action.includes('yourformid')) {
    formStatus.textContent = 'Tip: Replace the form action with your real Formspree endpoint.';
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

// ---------- Back to top ----------
const toTop = $('#toTop');
const toggleTop = () => {
  if (window.scrollY > 300) toTop?.classList.add('show');
  else toTop?.classList.remove('show');
};
toggleTop();
addEventListener('scroll', toggleTop);
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
