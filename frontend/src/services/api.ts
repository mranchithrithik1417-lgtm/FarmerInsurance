const API_BASE = '/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'farmer' | 'officer' | 'admin';
  profile?: any;
}

export interface DigipinEncodeResponse {
  digipin: string;
  display_format: string;
  latitude: number;
  longitude: number;
}

export interface DigipinDecodeResponse {
  valid: boolean;
  digipin: string;
  display_format: string;
  center_lat: number;
  center_lon: number;
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
  cell_size_lat_deg: number;
  cell_size_lon_deg: number;
  cell_height_m_approx: number;
  cell_width_m_approx: number;
}

export interface HierarchyLevel {
  level: number;
  title: string;
  char: string;
  row: number;
  col: number;
  accumulated_prefix: string;
  grid_cells: Array<Array<{
    char: string;
    row: number;
    col: number;
    is_selected: boolean;
    bounds: { min_lat: number; max_lat: number; min_lon: number; max_lon: number; }
  }>>;
  current_bounds: { min_lat: number; max_lat: number; min_lon: number; max_lon: number; };
  selected_bounds: { min_lat: number; max_lat: number; min_lon: number; max_lon: number; };
  lat_step_deg: number;
  lon_step_deg: number;
  explanation: string;
}

export interface DigipinHierarchyResponse {
  digipin: string;
  display_format: string;
  target_lat: number;
  target_lon: number;
  levels: HierarchyLevel[];
}

export interface Farm {
  id: number;
  farmer_id: number;
  name: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  address?: string;
  fields_count: number;
}

export interface Field {
  id: number;
  farm_id: number;
  farm_name?: string;
  name: string;
  crop: string;
  crop_variety?: string;
  sowing_date?: string;
  cultivation_season: string;
  area_acres: number;
  polygon_geojson: string;
  centroid_lat: number;
  centroid_lon: number;
  digipin: string;
  digipin_display: string;
}

export interface Claim {
  id: number;
  claim_number: string;
  farmer_id: number;
  farmer_name: string;
  field_id: number;
  field_name: string;
  farm_name: string;
  crop: string;
  area_acres: number;
  digipin: string;
  digipin_display: string;
  centroid_lat: number;
  centroid_lon: number;
  polygon_geojson: string;
  disaster_type: string;
  incident_date: string;
  duration_days: number;
  description?: string;
  status: string;
  created_at: string;
  evidence: Array<{
    id: number;
    filename: string;
    file_size_bytes: number;
    sha256_hash: string;
    exif_lat?: number;
    exif_lon?: number;
    exif_timestamp?: string;
    exif_camera?: string;
    distance_to_field_m?: number;
  }>;
  satellite?: {
    pre_disaster_date: string;
    post_disaster_date: string;
    pre_ndvi: number;
    post_ndvi: number;
    ndvi_delta: number;
    ndvi_change_pct: number;
    valid_pixel_pct: number;
    cloud_cover_pct: number;
    provider: string;
  };
  weather?: {
    start_date: string;
    end_date: string;
    total_rainfall_mm: number;
    max_daily_rainfall_mm: number;
    historical_avg_rainfall_mm: number;
    rainfall_anomaly_pct: number;
    daily_records: Array<{
      date: string;
      rainfall_mm: number;
      temp_max_c: number;
      temp_min_c: number;
    }>;
    provider: string;
  };
  assessment?: {
    finding_category: string;
    severity_score: number;
    confidence_level: string;
    summary: string;
    rules_triggered: Array<{
      rule_id: string;
      name: string;
      status: string;
      details: string;
    }>;
    methodology_version: string;
  };
  report?: {
    report_uuid: string;
    sha256_hash: string;
    verification_qr_data: string;
    download_url: string;
  };
  reviews: Array<{
    id: number;
    officer_name: string;
    decision: string;
    remarks: string;
    evidence_requested?: string;
    created_at: string;
  }>;
}

export const api = {
  getToken: () => localStorage.getItem('kisan_token'),
  setToken: (t: string) => localStorage.setItem('kisan_token', t),
  clearToken: () => localStorage.removeItem('kisan_token'),

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API request failed');
    }

    return res.json();
  },

  // Auth
  login: (data: any) => api.request<{ access_token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data: any) => api.request<{ access_token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMe: () => api.request<User>('/auth/me'),

  // DIGIPIN
  encodeDigipin: (lat: number, lon: number) => api.request<DigipinEncodeResponse>('/digipin/encode', {
    method: 'POST',
    body: JSON.stringify({ latitude: lat, longitude: lon })
  }),
  decodeDigipin: (code: string) => api.request<DigipinDecodeResponse>('/digipin/decode', {
    method: 'POST',
    body: JSON.stringify({ digipin: code })
  }),
  getDigipinHierarchy: (lat: number, lon: number) => api.request<DigipinHierarchyResponse>(`/digipin/hierarchy?lat=${lat}&lon=${lon}`),

  // Farms & Fields
  getFarms: () => api.request<Farm[]>('/farms'),
  createFarm: (data: any) => api.request<Farm>('/farms', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getFields: (farmId?: number) => api.request<Field[]>(farmId ? `/fields?farm_id=${farmId}` : '/fields'),
  createField: (data: any) => api.request<Field>('/fields', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Claims
  getClaims: (status?: string) => api.request<Claim[]>(status ? `/claims?status_filter=${status}` : '/claims'),
  getClaim: (id: number) => api.request<Claim>(`/claims/${id}`),
  createClaim: (data: any) => api.request<Claim>('/claims', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  uploadEvidence: (claimId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.request<any>(`/claims/${claimId}/evidence`, {
      method: 'POST',
      body: formData
    });
  },
  generateReport: (claimId: number) => api.request<any>(`/claims/${claimId}/generate-report`, {
    method: 'POST'
  }),
  reviewClaim: (claimId: number, data: any) => api.request<any>(`/claims/${claimId}/review`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin
  getAdminStats: () => api.request<any>('/admin/stats'),
  getAdminUsers: () => api.request<any[]>('/admin/users'),
  getAdminLogs: () => api.request<any[]>('/admin/audit-logs'),
};
