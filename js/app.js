/**
 * Presentation Layer: merakit DOM, menangani event, mengelola 4 UI state.
 * Data dari JSON hanya masuk lewat textContent/setAttribute (anti DOM-XSS).
 */
const el = (tag, props = {}, ...kids) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  kids.flat().forEach((c) => c && node.append(c));
  return node;
};

// Hanya izinkan http(s) atau path relatif; tolak javascript:, data:, dll.
const safeUrl = (u) => {
  if (!u) return '';
  try {
    const url = new URL(u, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? u : '';
  } catch { return ''; }
};

class App {
  static ORDER_KEY = 'user_orders';

  constructor() {
    this.state = { projects: [], services: [], profile: null, category: 'All', query: '' };
  }

  init() {
    this.toast = new bootstrap.Toast(document.getElementById('liveToast'));
    this.bindImageFallback();
    this.bindForm();
    this.bindSearch();
    this.renderOrders();
    window.addEventListener('storage', (e) => e.key === App.ORDER_KEY && this.renderOrders());
    document.getElementById('clearOrdersBtn').addEventListener('click', () => {
      localStorage.removeItem(App.ORDER_KEY);
      this.renderOrders();
    });
    // Tiga sumber data dimuat paralel; masing-masing punya state sendiri.
    this.loadProfile();
    this.loadProjects();
    this.loadServices();
  }

  /* ---------- Mesin 4 UI state, dipakai semua sumber data ---------- */
  showLoading(container, count = 3, cls = 'col') {
    container.replaceChildren(...Array.from({ length: count }, () =>
      el('div', { class: cls, 'aria-hidden': 'true' }, el('div', { class: 'skeleton-card' }))));
    container.setAttribute('aria-busy', 'true');
  }

  showEmpty(container, message, onReset) {
    container.removeAttribute('aria-busy');
    const box = el('div', { class: 'col-12 text-center py-5' },
      el('i', { class: 'bi bi-folder-x fs-1 text-muted' }),
      el('p', { class: 'mt-2 text-muted', text: message }));
    if (onReset) {
      const btn = el('button', { class: 'btn btn-outline-info btn-sm', type: 'button', text: 'Reset filter' });
      btn.addEventListener('click', onReset);
      box.append(btn);
    }
    container.replaceChildren(box);
  }

  showError(container, err, retry) {
    container.removeAttribute('aria-busy');
    const btn = el('button', { class: 'btn btn-sm btn-outline-light mt-2', type: 'button', text: 'Coba lagi' });
    btn.addEventListener('click', retry);
    container.replaceChildren(el('div', { class: 'col-12' },
      el('div', { class: 'alert alert-danger', role: 'alert' },
        el('strong', { text: 'Data gagal dimuat. ' }),
        el('span', { text: err.message || 'Terjadi kesalahan tak terduga.' }),
        el('div', {}, btn))));
  }

  /* ---------- Profil + sertifikat ---------- */
  async loadProfile() {
    const box = document.getElementById('certificates-container');
    this.showLoading(box, 2, 'col-lg-10');
    try {
      const p = await ApiService.fetchProfile();
      this.state.profile = p;
      document.getElementById('profile-nim').textContent = `NIM: ${p.nim}`;
      document.getElementById('profile-name').textContent = p.name;
      document.getElementById('profile-title').textContent = p.title;
      document.getElementById('profile-avatar').setAttribute('src', safeUrl(p.avatar) || 'profile.jpg');
      const certs = p.certificates || [];
      if (!certs.length) return this.showEmpty(box, 'Belum ada sertifikat yang ditampilkan.');
      box.removeAttribute('aria-busy');
      box.replaceChildren(...certs.map((c) => this.certCard(c)));
    } catch (err) {
      this.showError(box, err, () => this.loadProfile());
    }
  }

  certCard(c) {
    const link = safeUrl(c.link);
    const info = [c.number && ['No. Sertifikat: ', c.number], c.issued && ['Penerbitan: ', c.issued]].filter(Boolean);
    return el('div', { class: 'col-lg-10' },
      el('div', { class: 'card cert-card p-4 shadow-lg' },
        el('div', { class: 'row align-items-center gy-4' },
          el('div', { class: 'col-md-5 text-center' },
            el('img', { src: safeUrl(c.image), alt: c.title, loading: 'lazy', class: 'img-fluid rounded-3 border border-secondary shadow-sm' })),
          el('div', { class: 'col-md-7 text-white' },
            el('div', { class: 'd-flex align-items-center gap-2 mb-2' },
              el('span', { class: 'cert-badge', text: 'Terverifikasi' }),
              el('span', { class: 'text-muted small', text: c.duration })),
            el('h4', { class: 'fw-bold text-white mb-1', text: c.title }),
            el('p', { class: 'text-info fw-semibold mb-3', text: c.issuer }),
            el('p', { class: 'text-light opacity-90 small mb-3 cert-quote', text: c.description }),
            el('p', { class: 'text-muted small mb-3' }, ...info.flatMap(([k, v], i) =>
              [el('strong', { text: k }), v, i < info.length - 1 ? el('br') : null])),
            el('div', { class: 'd-flex flex-wrap gap-2 mb-3' },
              ...(c.tags || []).map((t) => el('span', { class: 'badge bg-dark border border-secondary text-light', text: t }))),
            link && el('a', { href: link, target: '_blank', rel: 'noopener noreferrer', class: 'btn btn-outline-info btn-sm rounded-pill px-3', text: 'Lihat Badge' })))));
  }

  /* ---------- Proyek: filter kategori + pencarian ---------- */
  async loadProjects() {
    const box = document.getElementById('projects-container');
    this.showLoading(box, 3);
    try {
      this.state.projects = await ApiService.fetchProjects();
      this.renderFilters();
      this.renderProjects();
    } catch (err) {
      this.showError(box, err, () => this.loadProjects());
    }
  }

  visibleProjects() {
    const { projects, category, query } = this.state;
    const q = query.trim().toLowerCase();
    return projects.filter((p) =>
      (category === 'All' || p.category === category) &&
      (!q || [p.title, p.description, ...(p.technologies || [])].join(' ').toLowerCase().includes(q)));
  }

  resetFilters() {
    this.state.category = 'All';
    this.state.query = '';
    document.getElementById('project-search').value = '';
    this.renderFilters();
    this.renderProjects();
  }

  renderFilters() {
    const wrap = document.getElementById('project-filters');
    const cats = ['All', ...new Set(this.state.projects.map((p) => p.category))];
    wrap.replaceChildren(...cats.map((cat) => {
      const active = cat === this.state.category;
      const b = el('button', { type: 'button', 'aria-pressed': String(active), text: cat,
        class: `btn btn-sm me-2 mb-2 ${active ? 'btn-info text-dark fw-bold' : 'btn-outline-info'}` });
      b.addEventListener('click', () => { this.state.category = cat; this.renderFilters(); this.renderProjects(); });
      return b;
    }));
  }

  bindSearch() {
    document.getElementById('project-search').addEventListener('input', (e) => {
      this.state.query = e.target.value;
      if (this.state.projects.length) this.renderProjects();
    });
  }

  renderProjects() {
    const box = document.getElementById('projects-container');
    if (!this.state.projects.length) return this.showEmpty(box, 'Belum ada proyek untuk ditampilkan.');
    const list = this.visibleProjects();
    if (!list.length) return this.showEmpty(box, 'Tidak ada proyek yang cocok dengan filter.', () => this.resetFilters());
    box.removeAttribute('aria-busy');
    box.replaceChildren(...list.map((p) => {
      const btn = el('button', { type: 'button', class: 'btn btn-outline-info btn-sm mt-3', 'data-id': p.id, text: 'Detail Proyek' });
      btn.addEventListener('click', () => this.openModal(p.id));
      return el('div', { class: 'col' },
        el('div', { class: 'card h-100 shadow-sm border-0' },
          el('img', { src: safeUrl(p.thumbnail), alt: p.title, loading: 'lazy', class: 'card-img-top thumb-img' }),
          el('div', { class: 'card-body d-flex flex-column' },
            el('span', { class: 'badge bg-info text-dark mb-2 align-self-start fw-bold', text: p.category }),
            el('h5', { class: 'card-title fw-bold text-white', text: p.title }),
            el('p', { class: 'card-text text-muted flex-grow-1', text: p.description }),
            btn)));
    }));
  }

  /* ---------- Satu modal universal, isi disuntik per proyek ---------- */
  openModal(id) {
    const p = this.state.projects.find((x) => x.id === id);
    if (!p) return;
    document.getElementById('projectModalTitle').textContent = p.title;
    const link = safeUrl(p.link);
    document.getElementById('projectModalBody').replaceChildren(
      el('div', { class: 'text-center bg-dark p-3 rounded mb-3' },
        el('img', { src: safeUrl(p.thumbnail), alt: p.title, class: 'img-fluid rounded modal-img' })),
      el('p', { class: 'text-light opacity-90', text: p.description }),
      el('div', { class: 'mb-3' }, el('strong', { class: 'text-white d-block mb-1', text: 'Teknologi:' }),
        ...(p.technologies || []).map((t) => el('span', { class: 'badge bg-secondary me-1', text: t }))),
      el('div', { class: 'modal-metric-box p-3 rounded mb-3' },
        el('strong', { class: 'text-white', text: 'Metrik Hasil: ' }), el('span', { class: 'text-light', text: p.metrics })),
      link && el('a', { href: link, target: '_blank', rel: 'noopener noreferrer', class: 'btn btn-sm btn-outline-info', text: 'Buka Tautan Proyek' }));
    bootstrap.Modal.getOrCreateInstance(document.getElementById('universalProjectModal')).show();
  }

  /* ---------- Katalog layanan -> dropdown form ---------- */
  async loadServices() {
    const sel = document.getElementById('floatingSelect');
    try {
      this.state.services = await ApiService.fetchServices();
      sel.replaceChildren(el('option', { value: '', selected: 'selected', disabled: 'disabled', text: 'Pilih Kategori...' }),
        ...this.state.services.map((s) => el('option', { value: s.id, text: s.name })));
    } catch (err) {
      sel.replaceChildren(el('option', { value: '', text: 'Katalog gagal dimuat, muat ulang halaman' }));
      sel.disabled = true;
    }
  }

  /* ---------- Form: POST JSON tanpa reload ---------- */
  bindForm() {
    const form = document.getElementById('serviceOrderForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.textContent;
      btn.disabled = true;
      btn.replaceChildren(el('span', { class: 'spinner-border spinner-border-sm me-2' }), 'Mengirim...');
      const f = new FormData(form);
      const service = this.state.services.find((s) => s.id === f.get('serviceId'));
      const dto = {
        title: `Order: ${service ? service.name : f.get('serviceId')}`.slice(0, 100),
        body: String(f.get('message')).slice(0, 500),
        name: String(f.get('name')).slice(0, 80),
        email: String(f.get('email')).slice(0, 120)
      };
      try {
        const res = await ApiService.submitOrder(dto);
        this.saveOrder({ ref: res.id, service: dto.title, name: dto.name, at: new Date().toISOString() });
        this.notify('Berhasil', `Pesanan terkirim (ID server: ${res.id}).`);
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        this.notify('Gagal', err.message, true);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  /* ---------- localStorage: riwayat pesanan ---------- */
  readOrders() {
    try { return JSON.parse(localStorage.getItem(App.ORDER_KEY)) || []; } catch { return []; }
  }

  saveOrder(order) {
    localStorage.setItem(App.ORDER_KEY, JSON.stringify([order, ...this.readOrders()].slice(0, 20)));
    this.renderOrders();
  }

  renderOrders() {
    const orders = this.readOrders();
    const badge = document.getElementById('orderCountBadge');
    badge.textContent = `${orders.length} Pesanan`;
    badge.classList.toggle('d-none', orders.length === 0);
    document.getElementById('clearOrdersBtn').classList.toggle('d-none', orders.length === 0);
    const ul = document.getElementById('orderHistory');
    if (!orders.length) {
      ul.replaceChildren(el('li', { class: 'list-group-item order-item text-muted', text: 'Belum ada pesanan.' }));
      return;
    }
    ul.replaceChildren(...orders.map((o) => el('li', { class: 'list-group-item order-item' },
      el('strong', { text: o.service }),
      el('div', { class: 'small text-muted', text: `${o.name} · ${new Date(o.at).toLocaleString('id-ID')} · ref #${o.ref}` }))));
  }

  notify(title, message, isError = false) {
    const t = document.getElementById('liveToast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastBody').textContent = message;
    t.classList.toggle('bg-danger', isError);
    t.classList.toggle('bg-success', !isError);
    this.toast.show();
  }

  // Pengganti onerror inline (diblokir CSP): satu listener terdelegasi di fase capture.
  bindImageFallback() {
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') e.target.classList.add('img-missing');
    }, true);
  }
}

document.addEventListener('DOMContentLoaded', () => new App().init());
