document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

class App {
  constructor() {
    this.state = {
      projects: [],
      filteredProjects: [],
      services: [],
      profile: null,
      activeCategory: 'All'
    };
  }

  async init() {
    this.initToast();
    this.loadOrdersFromStorage();
    await this.loadProfileData();
    await this.loadProjectsData();
    await this.loadServicesData();
    this.setupEventListeners();
  }

  initToast() {
    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      this.toast = new bootstrap.Toast(toastEl);
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }

  renderState(containerId, stateHTML) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = stateHTML;
  }

  renderSkeleton(containerId) {
    const skeletonHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">Memuat data...</span>
        </div>
        <p class="mt-2 text-muted fw-semibold">Memuat konten dinamis...</p>
      </div>`;
    this.renderState(containerId, skeletonHTML);
  }

  async loadProfileData() {
    try {
      const data = await ApiService.fetchProfile();
      this.state.profile = data;
      document.getElementById('profile-nim').textContent = `NIM: ${data.nim}`;
      document.getElementById('profile-name').textContent = data.name;
      document.getElementById('profile-title').textContent = data.title;
      document.getElementById('profile-avatar').src = data.avatar;
    } catch (err) {
      console.error('Gagal memuat profil:', err);
    }
  }

  async loadProjectsData() {
    this.renderSkeleton('projects-container');
    try {
      const projects = await ApiService.fetchProjects();
      this.state.projects = projects;
      this.state.filteredProjects = projects;
      this.renderFilterButtons();
      this.renderProjects();
    } catch (err) {
      const errorHTML = `
        <div class="col-12">
          <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
            <div><strong>Gagal memuat data portofolio!</strong> Terjadi kesalahan jaringan atau sumber data tidak ditemukan.</div>
          </div>
        </div>`;
      this.renderState('projects-container', errorHTML);
    }
  }

  renderFilterButtons() {
    const categories = ['All', ...new Set(this.state.projects.map(p => p.category))];
    const filterContainer = document.getElementById('project-filters');
    if (!filterContainer) return;

    filterContainer.innerHTML = categories.map(cat => `
      <button class="btn btn-sm ${cat === this.state.activeCategory ? 'btn-info text-dark fw-bold' : 'btn-outline-info'} me-2 mb-2 filter-btn" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.state.activeCategory = e.target.getAttribute('data-category');
        this.filterProjects();
      });
    });
  }

  filterProjects() {
    if (this.state.activeCategory === 'All') {
      this.state.filteredProjects = this.state.projects;
    } else {
      this.state.filteredProjects = this.state.projects.filter(p => p.category === this.state.activeCategory);
    }
    this.renderFilterButtons();
    this.renderProjects();
  }

  renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    // Menambahkan kelas Bootstrap justify-content-center agar kolom sisa otomatis di posisi tengah
    container.classList.add('justify-content-center');

    if (this.state.filteredProjects.length === 0) {
      const emptyHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-folder-x fs-1 text-muted"></i>
          <p class="mt-2 text-muted">Tidak ada proyek untuk kategori "${this.escapeHTML(this.state.activeCategory)}".</p>
        </div>`;
      this.renderState('projects-container', emptyHTML);
      return;
    }

    container.innerHTML = this.state.filteredProjects.map(proj => `
      <div class="col">
        <div class="card h-100 shadow-sm border-0">
          <img src="${this.escapeHTML(proj.thumbnail)}" class="card-img-top" alt="${this.escapeHTML(proj.title)}" style="height: 220px; object-fit: contain; background-color: #0d1117; padding: 12px;" onerror="this.onerror=null; this.src='assets/${this.escapeHTML(proj.thumbnail)}';">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-info text-dark mb-2 align-self-start fw-bold">${this.escapeHTML(proj.category)}</span>
            <h5 class="card-title fw-bold text-white">${this.escapeHTML(proj.title)}</h5>
            <p class="card-text text-muted flex-grow-1">${this.escapeHTML(proj.description)}</p>
            <button class="btn btn-outline-info btn-sm mt-3 btn-detail-project" data-id="${proj.id}">
              <i class="bi bi-eye me-1"></i> Detail Proyek
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-detail-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openUniversalModal(id);
      });
    });
  }

  openUniversalModal(projectId) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (!proj) return;

    document.getElementById('projectModalTitle').textContent = proj.title;
    
    const techBadges = proj.technologies.map(t => `<span class="badge bg-secondary me-1">${this.escapeHTML(t)}</span>`).join('');
    
    document.getElementById('projectModalBody').innerHTML = `
      <div class="text-center bg-dark p-3 rounded mb-3">
        <img src="${this.escapeHTML(proj.thumbnail)}" class="img-fluid rounded" alt="${this.escapeHTML(proj.title)}" style="max-height: 280px; object-fit: contain;" onerror="this.onerror=null; this.src='assets/${this.escapeHTML(proj.thumbnail)}';">
      </div>
      <div class="mb-2"><span class="badge bg-info text-dark fw-bold px-3 py-2">${this.escapeHTML(proj.category)}</span></div>
      <p class="text-light opacity-90">${this.escapeHTML(proj.description)}</p>
      <div class="mb-3 text-white">
        <strong>Teknologi:</strong><br>${techBadges}
      </div>
      <div class="modal-metric-box p-3 rounded mb-3">
        <i class="bi bi-graph-up-arrow me-2 text-info"></i><strong class="text-white">Metrik Hasil:</strong> <span class="text-light">${this.escapeHTML(proj.metrics)}</span>
      </div>
      <a href="${this.escapeHTML(proj.link)}" target="_blank" class="btn btn-sm btn-outline-info"><i class="bi bi-box-arrow-up-right me-1"></i> Buka Tautan Proyek</a>
    `;

    const modalEl = document.getElementById('universalProjectModal');
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  async loadServicesData() {
    try {
      const services = await ApiService.fetchServices();
      this.state.services = services;
      const selectEl = document.getElementById('floatingSelect');
      if (selectEl) {
        selectEl.innerHTML = '<option value="" selected disabled>Pilih Kategori...</option>' + 
          services.map(s => `<option value="${s.id}">${this.escapeHTML(s.name)}</option>`).join('');
      }
    } catch (err) {
      console.error('Gagal memuat katalog layanan:', err);
    }
  }

  setupEventListeners() {
    const form = document.getElementById('serviceOrderForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...';

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        serviceId: formData.get('serviceId'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
      };

      try {
        const response = await ApiService.submitServiceOrder(payload);
        this.saveOrderToLocalStorage(payload);
        this.showToastNotification('Berhasil!', response.message);
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        this.showToastNotification('Gagal!', 'Terjadi kesalahan saat pengiriman form.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  saveOrderToLocalStorage(order) {
    let orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    orders.push(order);
    localStorage.setItem('user_orders', JSON.stringify(orders));
    this.updateOrderBadge(orders.length);
  }

  loadOrdersFromStorage() {
    let orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    this.updateOrderBadge(orders.length);
  }

  updateOrderBadge(count) {
    const badge = document.getElementById('orderCountBadge');
    if (badge) {
      badge.textContent = `${count} Pesanan`;
      badge.classList.remove('d-none');
    }
  }

  showToastNotification(title, message, isError = false) {
    const toastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');

    if (toastEl && toastTitle && toastBody) {
      toastTitle.textContent = title;
      toastBody.textContent = message;
      toastEl.className = `toast align-items-center text-white ${isError ? 'bg-danger' : 'bg-success'} border-0`;
      this.toast.show();
    }
  }
}