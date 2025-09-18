import { api } from './api';
import { Problem, Workbook } from '../types';

const mapProblem = (raw: any): Problem => ({
  id: raw.id,
  displayId: raw.displayId ?? raw._id ?? String(raw.id ?? ''),
  title: raw.title ?? '제목 없음',
  description: raw.description ?? '',
  difficulty: (raw.difficulty as Problem['difficulty']) ?? 'Mid',
  timeLimit: raw.timeLimit ?? raw.time_limit ?? 0,
  memoryLimit: raw.memoryLimit ?? raw.memory_limit ?? 0,
  inputDescription: raw.inputDescription ?? raw.input_description ?? '',
  outputDescription: raw.outputDescription ?? raw.output_description ?? '',
  samples: raw.samples,
  hint: raw.hint,
  createTime: raw.createTime ?? raw.create_time ?? new Date().toISOString(),
  lastUpdateTime: raw.lastUpdateTime ?? raw.last_update_time,
  tags: raw.tags ?? [],
  languages: raw.languages ?? [],
  createdBy: raw.created_by
    ? {
        id: raw.created_by.id,
        username: raw.created_by.username,
        realName: raw.created_by.real_name ?? raw.created_by.realName,
      }
    : raw.createdBy,
});

export const workbookService = {
  // 문제집 목록 조회 (micro-service API 사용)
  getWorkbooks: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Workbook[]> => {
    const response = await fetch('http://localhost:8000/api/workbook/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const workbooks = await response.json();
    return workbooks;
  },

  // 문제집 상세 조회 (micro-service 사용)
  getWorkbook: async (id: number): Promise<Workbook> => {
    const response = await fetch(`http://localhost:8000/api/workbook/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const workbook = await response.json();
    return workbook;
  },

  // 문제집의 문제 목록 조회 (micro-service 사용)
  getWorkbookProblems: async (id: number): Promise<{
    success: boolean;
    data: any[];
    workbook: Workbook;
  }> => {
    const response = await fetch(`http://localhost:8000/api/workbook/${id}/problems`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawProblems = await response.json();

    const normalizedProblems = (Array.isArray(rawProblems) ? rawProblems : []).map((item: any) => ({
      id: item.id,
      problemId: item.problem_id ?? item.problemId,
      problem: item.problem ? mapProblem(item.problem) : undefined,
      order: item.order,
      addedTime: item.added_time ?? item.addedTime ?? '',
    })).filter((item: any) => !!item.problem);
    
    // 문제집 정보도 함께 가져오기
    const workbook = await workbookService.getWorkbook(id);
    
    return {
      success: true,
      data: normalizedProblems,
      workbook: workbook
    };
  },
};
