import React from 'react';
import { Problem } from '../../types';
import { ProblemCard } from '../molecules/ProblemCard';
import { SearchBar } from '../molecules/SearchBar';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface ProblemListProps {
  problems: Problem[];
  onProblemClick: (problemId: number) => void;
  onSearch: (query: string) => void;
  onFilterChange: (filter: { difficulty?: string }) => void;
  currentFilter?: { difficulty?: string };
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onProblemClick,
  onSearch,
  onFilterChange,
  currentFilter = {},
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}) => {
  const difficultyOptions = [
    { value: '', label: '전체' },
    { value: 'EASY', label: '쉬움' },
    { value: 'MEDIUM', label: '보통' },
    { value: 'HARD', label: '어려움' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="space-y-4">
        <SearchBar onSearch={onSearch} />
        
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            {difficultyOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentFilter.difficulty === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ difficulty: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 문제 목록 */}
      {problems.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">문제가 없습니다.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSolve={onProblemClick}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            이전
          </Button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2);
              
              if (!showPage) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};
