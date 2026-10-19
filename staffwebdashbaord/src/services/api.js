const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api/v1';

export function getStoredToken() {
  return localStorage.getItem('rama_staff_token') || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('rama_staff_token', token);
  } else {
    localStorage.removeItem('rama_staff_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('rama_staff_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('rama_staff_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('rama_staff_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  requestOtp: (phoneNumber, purpose = 'login') =>
    request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, purpose }),
    }),

  verifyOtp: (phoneNumber, code, purpose = 'login') =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code, purpose, role: 'staff' }),
    }),

  getMe: () => request('/auth/me'),

  // Roles
  getPermissions: () => request('/roles/permissions'),
  getAllRoles: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/roles${searchParams ? `?${searchParams}` : ''}`);
  },
  getRoleById: (id) => request(`/roles/${id}`),
  createRole: (roleData) =>
    request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    }),
  updateRole: (id, roleData) =>
    request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    }),
  deleteRole: (id) =>
    request(`/roles/${id}`, {
      method: 'DELETE',
    }),

  // Staffs
  getDepartments: () => request('/staffs/departments'),
  getStaffMe: () => request('/staffs/me'),
  getAllStaffs: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/staffs${searchParams ? `?${searchParams}` : ''}`);
  },
  getStaffById: (id) => request(`/staffs/${id}`),
  createStaff: (staffData) =>
    request('/staffs', {
      method: 'POST',
      body: JSON.stringify(staffData),
    }),
  updateStaff: (id, staffData) =>
    request(`/staffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    }),
  updateStaffStatus: (id, status) =>
    request(`/staffs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteStaff: (id) =>
    request(`/staffs/${id}`, {
      method: 'DELETE',
    }),
};

export default api;
