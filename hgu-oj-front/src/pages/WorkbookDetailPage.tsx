import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { ProblemList } from '../components/organisms/ProblemList';
import { SearchBar } from '../components/molecules/SearchBar';
import { useWorkbook, useWorkbookProblems } from '../hooks/useWorkbooks';
import { Problem } from '../types';

export const WorkbookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workbookId = id ? parseInt(id, 10) : 0;

  const { data: workbook, isLoading: workbookLoading, error: workbookError } = useWorkbook(workbookId);
  const { data: problemsData, isLoading: problemsLoading, error: problemsError } = useWorkbookProblems(workbookId);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');

  const handleProblemClick = (problemId: number) => {
    navigate(`/problems/${problemId}`);
  };

  const handleBackClick = () => {
    navigate('/workbooks');
  };

  if (workbookLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (workbookError || !workbook) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">
          문제집을 찾을 수 없습니다.
        </div>
        <Button onClick={handleBackClick} className="bg-blue-600 hover:bg-blue-700 text-white">
          문제집 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const problems = problemsData?.data || [];

  const normalizedProblems: Problem[] = useMemo(() => {
    return problems
      .map((item) => item.problem)
      .filter((problem): problem is Problem => Boolean(problem));
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return normalizedProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.description && problem.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = difficultyFilter ? problem.difficulty === difficultyFilter : true;
      return matchesSearch && matchesDifficulty;
    });
  }, [normalizedProblems, searchQuery, difficultyFilter]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: { difficulty?: string }) => {
    setDifficultyFilter(filter.difficulty ?? '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Button
          onClick={handleBackClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          ← 문제집 목록으로 돌아가기
        </Button>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{workbook.title}</h1>
            <span className="text-lg font-semibold text-blue-600">
              {workbook.problemCount ?? filteredProblems.length}문제
            </span>
          </div>
          <div className="text-gray-600 text-sm mb-4 space-y-1">
            <p>
              작성자: User {workbook.created_by_id || 'Unknown'}
            </p>
            <p>
              생성일: {workbook.created_at ? new Date(workbook.created_at).toLocaleDateString() : '정보 없음'}
            </p>
          </div>
          <div className="prose max-w-none">
            {workbook.description ? (
              <div dangerouslySetInnerHTML={{ __html: workbook.description }} />
            ) : (
              <p className="text-gray-500">설명이 없습니다.</p>
            )}
          </div>
        </Card>

        {problemsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : problemsError ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">문제 목록을 불러오는 중 오류가 발생했습니다.</div>
            <p className="text-gray-600">{problemsError.message}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-2">
                <div className="text-sm text-gray-500">총 문제 수</div>
                <div className="text-2xl font-bold text-blue-600">{filteredProblems.length}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="max-w-md">
                  <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="문제 검색..."
                  />
                </div>
                <div>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => handleFilterChange({ difficulty: e.target.value })}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="Low">Level1</option>
                    <option value="Mid">Level2</option>
                    <option value="High">Level3</option>
                  </select>
                </div>
              </div>
            </div>

            <ProblemList
              problems={filteredProblems}
              onProblemClick={handleProblemClick}
              onSearch={() => {}}
              onFilterChange={handleFilterChange}
              currentFilter={{ difficulty: difficultyFilter }}
              isLoading={false}
              totalPages={1}
              currentPage={1}
              showStats={false}
            />
          </>
        )}
      </div>
    </div>
  );
};
