import React from 'react';
import { WorkbookProblem } from '../../types';
import { Button } from '../atoms/Button';

interface WorkbookProblemListProps {
  problems: WorkbookProblem[];
  onProblemClick?: (problemId: number) => void;
  onSolve?: (problemId: number) => void;
}

export const WorkbookProblemList: React.FC<WorkbookProblemListProps> = ({
  problems,
  onProblemClick,
  onSolve,
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Mid':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'Low':
        return 'Level1';
      case 'Mid':
        return 'Level2';
      case 'High':
        return 'Level3';
      default:
        return difficulty ?? '정보 없음';
    }
  };

  if (!problems.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 text-lg">이 문제집에는 아직 문제가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1 text-center">순서</div>
          <div className="col-span-5">문제</div>
          <div className="col-span-2 text-center">난이도</div>
          <div className="col-span-2 text-center">시간 / 메모리</div>
          <div className="col-span-2 text-center">액션</div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {problems.map((item, index) => {
          const problem = item.problem;
          if (!problem) {
            return null;
          }

          const displayOrder = index + 1;

          return (
            <div
              key={item.id ?? `${problem.id}-${index}`}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 text-sm font-medium text-gray-900 text-center">
                  {displayOrder}
                </div>
                <div className="col-span-5">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-blue-600 hover:underline"
                    onClick={() => onProblemClick?.(problem.id)}
                  >
                    {problem.title}
                  </button>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {problem.description?.replace(/<[^>]*>/g, '') || '설명이 없습니다.'}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                    {getDifficultyText(problem.difficulty)}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-500 text-center">
                  {problem.timeLimit ?? 0}ms / {problem.memoryLimit ?? 0}MB
                </div>
                <div className="col-span-2 flex justify-center">
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-4"
                    onClick={() => onSolve?.(problem.id)}
                  >
                    풀기
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
