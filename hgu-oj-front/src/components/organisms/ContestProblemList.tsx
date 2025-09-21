import React from 'react';
import { Problem } from '../../types';

interface ContestProblemListProps {
  problems: Problem[];
}

export const ContestProblemList: React.FC<ContestProblemListProps> = ({ problems }) => {
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
        <div className="text-gray-600 text-lg">공개된 문제가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-2 text-center">문제 번호</div>
          <div className="col-span-5">제목</div>
          <div className="col-span-2 text-center">난이도</div>
          <div className="col-span-3 text-center">제출 / 정답률</div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {problems.map((problem) => {
          const submissions = problem.submissionNumber ?? 0;
          const accepted = problem.acceptedNumber ?? 0;
          const ratio = submissions > 0 ? `${Math.round((accepted / submissions) * 100)}%` : '0%';

          return (
            <div key={problem.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2 text-sm font-medium text-gray-900 text-center">
                  {problem.displayId ?? problem.id}
                </div>
                <div className="col-span-5">
                  <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {problem.description?.replace(/<[^>]*>/g, '') || '설명이 없습니다.'}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                    {getDifficultyText(problem.difficulty)}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-gray-500 text-center">
                  {submissions}회 / {ratio}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
