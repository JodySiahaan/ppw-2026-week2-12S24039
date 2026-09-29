class ApiService {
  static async fetchProfile() {
    try {
      const response = await fetch('./data/profile.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('[API Error - Profile]:', error);
      throw error;
    }
  }

  static async fetchProjects() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('[API Error - Projects]:', error);
      throw error;
    }
  }

  static async fetchServices() {
    try {
      const response = await fetch('./data/services.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('[API Error - Services]:', error);
      throw error;
    }
  }

  static async submitServiceOrder(payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload) {
          resolve({ status: 'success', statusCode: 201, message: 'Pesanan berhasil dikirim ke API server.', data: payload });
        } else {
          reject(new Error('Payload tidak valid'));
        }
      }, 1200);
    });
  }
}