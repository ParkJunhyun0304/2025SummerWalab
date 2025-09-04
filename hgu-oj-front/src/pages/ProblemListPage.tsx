import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import { ProblemList } from '../components/organisms/ProblemList';
import { useProblemStore } from '../stores/problemStore';

export const ProblemListPage: React.FC = () => {
  const navigate = useNavigate();
  const { filter, setFilter } = useProblemStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useProblems(filter);

  const handleProblemClick = (problemId: number) => {
    navigate(`/problems/${problemId}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter({ search: query, page: 1 });
  };

  const handleFilterChange = (newFilter: { difficulty?: string }) => {
    setFilter({
      ...newFilter,
      difficulty: (newFilter.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || undefined,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setFilter({ page });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">문제 목록</h1>
        <p className="text-gray-600">다양한 알고리즘 문제를 풀어보세요</p>
      </div>

      <ProblemList
        problems={data?.data || []}
        onProblemClick={handleProblemClick}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        currentFilter={filter}
        isLoading={isLoading}
        totalPages={data?.totalPages || 1}
        currentPage={filter.page || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
