import { api } from './api';
import { Contest, PaginatedResponse } from '../types';

const mapContest = (raw: any): Contest => ({
  id: raw.id,
  title: raw.title,
  description: raw.description,
  startTime: raw.start_time ?? raw.startTime,
  endTime: raw.end_time ?? raw.endTime,
  createTime: raw.create_time ?? raw.createTime,
  ruleType: raw.rule_type ?? raw.ruleType,
  visible: raw.visible,
  createdBy: raw.created_by
    ? {
        id: raw.created_by.id,
        username: raw.created_by.username,
        realName: raw.created_by.real_name ?? raw.created_by.realName,
      }
    : raw.createdBy ?? {
        id: 0,
        username: '알 수 없음',
      },
  now: raw.now,
});

export const contestService = {
  // 대회 목록 조회
  getContests: async (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    ruleType?: string;
    status?: string;
  }): Promise<PaginatedResponse<Contest>> => {
    const response = await api.get<{results: any[], total: number}>('/contests/', params);
    return {
      data: response.data.results.map(mapContest),
      total: response.data.total,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: Math.ceil(response.data.total / (params?.limit || 20))
    };
  },

  // 대회 상세 조회
  getContest: async (id: number): Promise<Contest> => {
    const response = await api.get<any>('/contest/', { id });
    return mapContest(response.data);
  },
};
