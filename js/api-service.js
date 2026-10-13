/**
 * Data Access Layer: satu-satunya pintu keluar jaringan.
 * Tidak menyentuh DOM; hanya mengembalikan data atau melempar ApiError.
 */
class ApiError extends Error {
  constructor(message, kind) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'http' | 'network' | 'timeout' | 'simulated'
  }
}

class ApiService {
  static DATA_BASE = './data/';
  static ORDER_URL = 'https://jsonplaceholder.typicode.com/posts';
  static TIMEOUT_MS = 8000;
  static query = new URLSearchParams(window.location.search);

  static async request(url, options = {}, simulateKey = '') {
    // Mode demo: ?simulate=projects memicu Error, ?delay=2000 memperlama Loading
    if (simulateKey && this.query.get('simulate') === simulateKey) {
      throw new ApiError('Kegagalan disimulasikan lewat parameter URL.', 'simulated');
    }
    const delay = Number(this.query.get('delay')) || 0;
    if (delay > 0) await new Promise((r) => setTimeout(r, Math.min(delay, 10000)));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new ApiError(`Server menjawab HTTP ${res.status}.`, 'http');
      return await res.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err.name === 'AbortError') {
        throw new ApiError(`Permintaan melebihi batas ${this.TIMEOUT_MS / 1000} detik.`, 'timeout');
      }
      throw new ApiError('Jaringan terputus atau data tidak dapat dijangkau.', 'network');
    } finally {
      clearTimeout(timer);
    }
  }

  static fetchProfile()  { return this.request(`${this.DATA_BASE}profile.json`, {}, 'profile'); }
  static fetchProjects() { return this.request(`${this.DATA_BASE}projects.json`, {}, 'projects'); }
  static fetchServices() { return this.request(`${this.DATA_BASE}services.json`, {}, 'services'); }

  static submitOrder(dto) {
    if (this.query.get('simulate') === 'order') {
      return Promise.reject(new ApiError('Pengiriman pesanan disimulasikan gagal.', 'simulated'));
    }
    return this.request(this.ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(dto)
    });
  }
}
