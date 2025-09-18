import { api, apiClient } from './api';
import { ApiResponse, Workbook } from '../types';

export interface CreateProblemPayload {
  _id: string;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  samples: Array<{ input: string; output: string }>;
  test_case_id: string;
  test_case_score: Array<{ input_name: string; output_name: string; score: number }>;
  time_limit: number;
  memory_limit: number;
  languages: string[];
  template: Record<string, string>;
  rule_type: 'ACM' | 'OI';
  io_mode: { io_mode: string; input: string; output: string };
  spj: boolean;
  spj_language: string | null;
  spj_code: string | null;
  spj_compile_ok: boolean;
  visible: boolean;
  difficulty: 'High' | 'Mid' | 'Low';
  tags: string[];
  hint?: string | null;
  source?: string | null;
  share_submission: boolean;
}

export interface CreateContestPayload {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  rule_type: 'ACM' | 'OI';
  password?: string;
  visible: boolean;
  real_time_rank: boolean;
  allowed_ip_ranges: string[];
}

export interface CreateWorkbookPayload {
  title: string;
  description?: string;
  category?: string;
  is_public?: boolean;
}

export interface TestCaseUploadResponse {
  id: string;
  info: unknown;
  spj: boolean;
}

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    const message = response.message || '요청이 실패했습니다.';
    throw new Error(message);
  }
  return response.data;
};

export const adminService = {
  uploadProblemTestCases: async (file: File, spj: boolean): Promise<TestCaseUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('spj', spj ? 'true' : 'false');

    const response = await apiClient.post('/admin/test_case/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const body = response.data;
    const hasWrapper = body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'error');
    const success = hasWrapper ? body.error === null : true;

    if (!success) {
      const detail = body?.data ?? '테스트케이스 업로드에 실패했습니다.';
      throw new Error(typeof detail === 'string' ? detail : '테스트케이스 업로드에 실패했습니다.');
    }

    return (hasWrapper ? body.data : body) as TestCaseUploadResponse;
  },

  createProblem: async (payload: CreateProblemPayload) => {
    const response = await api.post<any>('/admin/problem/', payload);
    return unwrap(response);
  },

  bulkImportProblems: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/api/problem', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `문제 대량 등록에 실패했습니다. (status ${response.status})`);
    }

    return response.json();
  },

  createContest: async (payload: CreateContestPayload) => {
    const response = await api.post<any>('/admin/contest/', payload);
    return unwrap(response);
  },

  createWorkbook: async (payload: CreateWorkbookPayload): Promise<Workbook> => {
    const response = await fetch('http://localhost:8000/api/workbook/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `문제집 등록에 실패했습니다. (status ${response.status})`);
    }

    return response.json();
  },

  getWorkbooks: async (): Promise<Workbook[]> => {
    const response = await fetch('http://localhost:8000/api/workbook/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `문제집 목록을 가져오지 못했습니다. (status ${response.status})`);
    }

    return response.json();
  },

  deleteWorkbook: async (id: number): Promise<void> => {
    const response = await fetch(`http://localhost:8000/api/workbook/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `문제집 삭제에 실패했습니다. (status ${response.status})`);
    }
  },
};
