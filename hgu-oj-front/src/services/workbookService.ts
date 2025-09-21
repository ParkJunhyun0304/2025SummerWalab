import { Problem, Workbook } from '../types';
import { mapProblem } from '../utils/problemMapper';

export const workbookService = {
  getWorkbooks: async () => {
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
    return workbooks as Workbook[];
  },

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

  getWorkbookProblems: async (id: number): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      problemId?: number;
      problem: Problem;
      order: number;
      addedTime: string;
    }>;
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

    const normalizedProblems = (Array.isArray(rawProblems) ? rawProblems : [])
      .map((item: any) => ({
        id: item.id,
        problemId: item.problem_id ?? item.problemId,
        problem: item.problem ? mapProblem(item.problem) : undefined,
        order: item.order,
        addedTime: item.added_time ?? item.addedTime ?? '',
      }))
      .filter((item: any) => !!item.problem) as Array<{
        id: number;
        problemId?: number;
        problem: Problem;
        order: number;
        addedTime: string;
      }>;

    const workbook = await workbookService.getWorkbook(id);

    return {
      success: true,
      data: normalizedProblems,
      workbook,
    };
  },
};
