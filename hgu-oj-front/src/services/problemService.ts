import { api } from './api';
import { Problem, PaginatedResponse, ProblemFilter } from '../types';

// 적응형 매퍼: 마이크로서비스 또는 OJ 백엔드 형태 모두 지원
const adaptProblem = (p: any): Problem => {
  if (!p) {
    return {
      id: 0,
      title: '',
      description: '',
      difficulty: 'Low',
      timeLimit: 0,
      memoryLimit: 0,
      createTime: '',
    } as Problem;
  }
  // Detect micro-service schema (snake_case)
  const isMicro = Object.prototype.hasOwnProperty.call(p, 'time_limit');
  if (isMicro) {
    return {
      id: p.id,
      title: p.title,
      description: p.description || '',
      difficulty: (p.difficulty as any) || 'Low',
      timeLimit: p.time_limit,
      memoryLimit: p.memory_limit,
      // best-effort extra stats mapping
      submissionNumber: p.submission_number,
      acceptedNumber: p.accepted_number,
      inputDescription: p.input_description || undefined,
      outputDescription: p.output_description || undefined,
      samples: undefined,
      hint: p.hint || undefined,
      createTime: p.create_time,
      lastUpdateTime: p.last_update_time,
      tags: Array.isArray(p.tags) ? p.tags.map((t: any) => t.name) : undefined,
      languages: p.languages || undefined,
      createdBy: p.created_by || undefined,
      myStatus: p.my_status || p.myStatus,
      solved: !!(p.my_status && String(p.my_status).toUpperCase() === 'AC') ||
              !!(p.myStatus && String(p.myStatus).toUpperCase() === 'AC'),
    } as Problem;
  }
  // Assume already in frontend camelCase schema
  const solved = p.my_status ? String(p.my_status).toUpperCase() === 'AC'
               : p.myStatus ? String(p.myStatus).toUpperCase() === 'AC'
               : p.solved;
  return { ...(p as Problem), myStatus: p.my_status || p.myStatus || (p as any).myStatus, solved } as Problem;
};

export const problemService = {
  // 문제 목록 조회
  getProblems: async (filter: ProblemFilter): Promise<PaginatedResponse<Problem>> => {
    // OJ 기본 시스템 API 호환: /api/problem?limit=...&keyword=...&difficulty=...
    const params: any = {};
    params.limit = filter.limit || 50;
    if (filter.search) params.keyword = filter.search;
    if (filter.difficulty) params.difficulty = filter.difficulty;

    const response = await api.get<any>('/problem', params);
    const raw = response.data as any;
    let items: any[] = [];
    let total = 0;
    if (Array.isArray(raw)) {
      items = raw;
      total = raw.length;
    } else if (raw && Array.isArray(raw.results)) {
      items = raw.results;
      total = Number(raw.total ?? raw.results.length);
    } else {
      items = [];
      total = 0;
    }
    const adapted = items.map(adaptProblem);
    const page = filter.page || 1;
    const limit = filter.limit || adapted.length || 20;
    return {
      data: adapted,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  // 문제 상세 조회
  getProblem: async (id: number): Promise<Problem> => {
    // OJ 기본 시스템은 상세 조회 시 display _id 사용. 목록에서 매핑 후 반환.
    const list = await problemService.getProblems({ page: 1, limit: 1000 });
    const found = (list.data as any[]).find((p) => p.id === id);
    if (found) return found as Problem;
    // 마이크로서비스 형태로 백업 시도
    const response = await api.get<any>(`/problem/${id}`);
    return adaptProblem(response.data);
  },

  // 문제 생성 (관리자)
  createProblem: async (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> => {
    const response = await api.post<Problem>('/problem', problem);
    return response.data;
  },

  // 문제 수정 (관리자)
  updateProblem: async (id: number, problem: Partial<Problem>): Promise<Problem> => {
    const response = await api.put<Problem>(`/problem/${id}`, problem);
    return response.data;
  },

  // 문제 삭제 (관리자)
  deleteProblem: async (id: number): Promise<void> => {
    await api.delete(`/problem/${id}`);
  },

  // 문제 검색
  searchProblems: async (query: string, filter?: Omit<ProblemFilter, 'search'>): Promise<PaginatedResponse<Problem>> => {
    // OJ에서는 /problem?keyword= 로 검색 지원
    const res = await problemService.getProblems({ ...(filter || {}), search: query, limit: 100 });
    return res;
  },
};
