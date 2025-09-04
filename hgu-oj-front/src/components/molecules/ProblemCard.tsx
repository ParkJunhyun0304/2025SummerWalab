import React from 'react';
import { Problem } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface ProblemCardProps {
  problem: Problem;
  onSolve?: (problemId: number) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onSolve }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HARD':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      default:
        return difficulty;
    }
  };

  return (
    <Card hover className="cursor-pointer" onClick={() => onSolve?.(problem.id)}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {problem.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
          {getDifficultyText(problem.difficulty)}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {problem.description}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex gap-4">
          <span>시간 제한: {problem.timeLimit}ms</span>
          <span>메모리 제한: {problem.memoryLimit}MB</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onSolve?.(problem.id);
          }}
        >
          풀기
        </Button>
      </div>
    </Card>
  );
};
