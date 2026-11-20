const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('docora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`Docora API Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
  updateProfile: (data) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/api/auth/password', { method: 'PUT', body: JSON.stringify(data) }),

  // Documents
  getDocuments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/documents${qs ? `?${qs}` : ''}`);
  },
  getDocument: (id) => request(`/api/documents/${id}`),
  createDocument: (data) => request('/api/documents', { method: 'POST', body: JSON.stringify(data) }),
  updateDocument: (id, data) => request(`/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleStar: (id) => request(`/api/documents/${id}/star`, { method: 'PATCH' }),
  toggleArchive: (id) => request(`/api/documents/${id}/archive`, { method: 'PATCH' }),
  deleteDocument: (id) => request(`/api/documents/${id}`, { method: 'DELETE' }),
  restoreDocument: (id) => request(`/api/documents/${id}/restore`, { method: 'POST' }),
  permanentDeleteDocument: (id) => request(`/api/documents/${id}/permanent`, { method: 'DELETE' }),
  duplicateDocument: (id) => request(`/api/documents/${id}/duplicate`, { method: 'POST' }),
  getExportUrl: (id, format) => `${API_BASE}/api/documents/${id}/export/${format}`,

  // Folders
  getFolders: () => request('/api/folders'),
  createFolder: (data) => request('/api/folders', { method: 'POST', body: JSON.stringify(data) }),
  updateFolder: (id, data) => request(`/api/folders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFolder: (id) => request(`/api/folders/${id}`, { method: 'DELETE' }),

  // Workspaces
  getWorkspace: () => request('/api/workspaces/current'),
  updateWorkspace: (data) => request('/api/workspaces/current', { method: 'PUT', body: JSON.stringify(data) }),
  inviteMember: (data) => request('/api/workspaces/current/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (userId, role) => request(`/api/workspaces/current/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  removeMember: (userId) => request(`/api/workspaces/current/members/${userId}`, { method: 'DELETE' }),

  // Comments
  getComments: (docId) => request(`/api/comments/${docId}`),
  createComment: (docId, data) => request(`/api/comments/${docId}`, { method: 'POST', body: JSON.stringify(data) }),
  replyComment: (docId, commentId, data) => request(`/api/comments/${docId}/${commentId}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  resolveComment: (docId, commentId) => request(`/api/comments/${docId}/${commentId}/resolve`, { method: 'PATCH' }),
  deleteComment: (docId, commentId) => request(`/api/comments/${docId}/${commentId}`, { method: 'DELETE' }),

  // Versions
  getVersions: (docId) => request(`/api/versions/${docId}`),
  createVersion: (docId, data) => request(`/api/versions/${docId}`, { method: 'POST', body: JSON.stringify(data) }),
  restoreVersion: (docId, versionId) => request(`/api/versions/${docId}/restore/${versionId}`, { method: 'POST' }),

  // Files & Uploads
  getFiles: () => request('/api/files'),
  uploadFiles: async (formData) => {
    const token = localStorage.getItem('docora_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/api/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },
  deleteFile: (id) => request(`/api/files/${id}`, { method: 'DELETE' }),

  // AI Assistant
  aiGenerate: (data) => request('/api/ai/generate', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => request('/api/analytics'),

  // Sharing
  getShareSettings: (id) => request(`/api/share/${id}`),
  updateShareSettings: (id, data) => request(`/api/share/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPublicDocument: (token) => request(`/api/share/public/${token}`),

  // Search
  search: (query) => request(`/api/search?q=${encodeURIComponent(query)}`),

  // Settings & Billing
  getBilling: () => request('/api/settings/billing'),
  updatePlan: (planId) => request('/api/settings/billing/plan', { method: 'POST', body: JSON.stringify({ planId }) }),
};

export default api;
