document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const res = await fetch('projects.json', { cache: 'no-store' });
  const projects = await res.json();

  projects.forEach(p => {
    const el = document.createElement('article');
    el.innerHTML = `
      <img src="${p.image || ''}" alt="${p.title || 'project'}" style="max-width:100%;border-radius:10px">
      <h3>${p.title}</h3>
      <p>${p.description || ''}</p>
      <p><em>${(p.stack || []).join(' • ')}</em></p>
      <div style="display:flex;gap:8px">
        ${p.demo ? `<a href="${p.demo}" target="_blank">Live</a>` : ''}
        ${p.code ? `<a href="${p.code}" target="_blank">Code</a>` : ''}
      </div>
    `;
    grid.appendChild(el);
  });
});
