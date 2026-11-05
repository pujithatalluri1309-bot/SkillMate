export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const ApiService = {
  // Authentication
  async register(params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    role: 'student' | 'mentor';
    department?: string;
    yearOfStudy?: string;
  }): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async forgotPassword(email: string, newPassword?: string): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Mentors
  async getMentors(filters?: { search?: string; category?: string; maxPrice?: number }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));

      const res = await fetch(`/api/mentors?${params.toString()}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  // Video Upload (Multipart FormData)
  async uploadTeachingVideo(formData: FormData): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');
      return { success: true, data: data.video, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Mentorship Requests
  async createRequest(reqData: {
    studentId: string;
    mentorId: string;
    subject: string;
    topicRequirements: string;
    preferredDate: string;
    preferredTime: string;
    offeredPrice: number;
  }): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateRequestStatus(requestId: string, status: 'Accepted' | 'Rejected', reason?: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request');
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Complete Session & Credit Earnings
  async completeSession(sessionId: string): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete session');
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Database Engine Status Probe
  async getDbStatus(): Promise<any> {
    try {
      const res = await fetch('/api/db-status');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },
};
