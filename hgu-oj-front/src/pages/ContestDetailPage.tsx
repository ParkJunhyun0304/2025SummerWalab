import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useContest,
  useContestAccess,
  useContestAnnouncements,
  useContestProblems,
  useContestRank,
} from '../hooks/useContests';
import { contestService } from '../services/contestService';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { ContestProblemList } from '../components/organisms/ContestProblemList';
import { ContestRankTable } from '../components/organisms/ContestRankTable';
import { ContestAnnouncement, ContestRankEntry, Problem } from '../types';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusLabel: Record<string, string> = {
  '1': '시작 예정',
  '0': '진행 중',
  '-1': '종료',
};

type ContestTab = 'overview' | 'announcements' | 'problems' | 'rank';

const tabs: Array<{ id: ContestTab; label: string; requiresAccess?: boolean }> = [
  { id: 'overview', label: '메인' },
  { id: 'announcements', label: '공지', requiresAccess: true },
  { id: 'problems', label: '대회 문제', requiresAccess: true },
  { id: 'rank', label: '랭크', requiresAccess: true },
];

export const ContestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const contestId = id ? parseInt(id, 10) : 0;
  const navigate = useNavigate();

  const { data: contest, isLoading, error } = useContest(contestId);
  const requiresPassword = useMemo(
    () => contest?.contestType?.toLowerCase().includes('password') ?? false,
    [contest?.contestType],
  );

  const {
    data: accessData,
    isLoading: accessLoading,
    error: accessError,
  } = useContestAccess(contestId, !!contest && requiresPassword);

  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<ContestTab>('overview');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const offsetRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('-');

  useEffect(() => {
    if (contest && !requiresPassword) {
      setHasAccess(true);
    }
  }, [contest, requiresPassword]);

  useEffect(() => {
    if (accessData?.access) {
      setHasAccess(true);
    }
  }, [accessData]);

  useEffect(() => {
    if (accessError instanceof Error) {
      setPasswordError(accessError.message);
    }
  }, [accessError]);

  useEffect(() => {
    if (!hasAccess && tabs.find((item) => item.id === activeTab && item.requiresAccess)) {
      setActiveTab('overview');
    }
  }, [hasAccess, activeTab]);

  useEffect(() => {
    if (!contest) {
      offsetRef.current = 0;
      return;
    }
    const serverNow = contest.now ? new Date(contest.now).getTime() : NaN;
    offsetRef.current = Number.isNaN(serverNow) ? 0 : serverNow - Date.now();
  }, [contest?.id, contest?.now]);

  useEffect(() => {
    if (!contest?.endTime) {
      setTimeLeft('-');
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const endTimeMs = new Date(contest.endTime).getTime();
    if (Number.isNaN(endTimeMs)) {
      setTimeLeft('-');
      return;
    }

    const update = () => {
      const now = Date.now() + offsetRef.current;
      const diff = endTimeMs - now;
      if (diff <= 0) {
        setTimeLeft('대회가 종료되었습니다.');
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const formatted = `${days ? `${days}일 ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeLeft(formatted);
    };

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    update();
    intervalRef.current = window.setInterval(update, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [contest?.endTime]);

  const {
    data: announcements = [] as ContestAnnouncement[],
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useContestAnnouncements(contestId, hasAccess);

  const {
    data: problems = [] as Problem[],
    isLoading: problemsLoading,
    error: problemsError,
    refetch: refetchProblems,
  } = useContestProblems(contestId, hasAccess);

  const {
    data: rankData,
    isLoading: rankLoading,
    error: rankError,
    refetch: refetchRank,
  } = useContestRank(contestId, hasAccess && activeTab === 'rank');

  const rankEntries: ContestRankEntry[] = rankData?.results ?? [];

  const problemSummary = useMemo(() => {
    if (!hasAccess) return '-- / --';
    if (problemsLoading) return '로딩 중...';
    const total = problems.length;
    const attempted = problems.reduce((count, problem) => (problem.myStatus ? count + 1 : count), 0);
    return `${total} / ${attempted}`;
  }, [hasAccess, problemsLoading, problems]);

  const passwordMutation = useMutation({
    mutationFn: (formPassword: string) => contestService.verifyContestPassword(contestId, formPassword),
    onSuccess: () => {
      setPassword('');
      setPasswordError(null);
      setHasAccess(true);
      refetchAnnouncements();
      refetchProblems();
      if (activeTab === 'rank') {
        refetchRank();
      }
    },
    onError: (mutError: unknown) => {
      if (mutError instanceof Error) {
        setPasswordError(mutError.message);
      } else {
        setPasswordError('비밀번호 인증에 실패했습니다.');
      }
    },
  });

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }
    passwordMutation.mutate(password.trim());
  };

  if (!contestId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">유효하지 않은 대회입니다.</div>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/contests')}>
          대회 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">대회를 불러오지 못했습니다.</div>
        <p className="text-gray-600">{error instanceof Error ? error.message : '정보를 가져오는 중 오류가 발생했습니다.'}</p>
        <Button variant="secondary" className="mt-6" onClick={() => navigate('/contests')}>
          대회 목록으로 이동
        </Button>
      </div>
    );
  }

  const contestStatus = contest.status ?? '';
  const timeLeftDisplay = timeLeft || '-';
  const timeTextClass = timeLeft.includes('종료')
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-900 dark:text-slate-100';

  const disabledTabs = (tab: ContestTab) => {
    const tabConfig = tabs.find((item) => item.id === tab);
    return !!(tabConfig?.requiresAccess && !hasAccess);
  };

  const renderOverview = () => {
    const overviewItems = [
      { label: '시작 시간', value: formatDateTime(contest.startTime) },
      { label: '종료 시간', value: formatDateTime(contest.endTime) },
      { label: '대회장', value: contest.createdBy.username },
      { label: '실시간 랭크', value: contest.realTimeRank ? '사용' : '캐시 사용' },
      { label: '규칙 유형', value: contest.ruleType },
      { label: '상태', value: (statusLabel[contestStatus] ?? contestStatus) || '-' },
    ];

    return (
      <div className="space-y-6">
        <Card className="border-0 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {contest.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                      {contest.ruleType}
                    </span>
                    {contest.contestType && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {contest.contestType === 'Password Protected' ? '비밀번호 필요' : contest.contestType}
                      </span>
                    )}
                    {contestStatus && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                        {statusLabel[contestStatus] ?? contestStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                대회의 진행 시간과 규칙, 실시간 랭크 여부 등을 한눈에 확인하고 준비하세요.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overviewItems.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl bg-slate-100/80 px-4 py-4 text-sm dark:bg-slate-800/70"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {label}
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="prose max-w-none leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-200">
              <div dangerouslySetInnerHTML={{ __html: contest.description }} />
            </div>
          </div>
        </Card>

        {requiresPassword && !hasAccess && (
          <Card className="border border-blue-200/70 bg-blue-50/70 p-6 dark:border-blue-400/40 dark:bg-blue-900/20 dark:text-blue-100">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-100 mb-3">비밀번호 인증 필요</h2>
            <p className="text-sm text-blue-700/80 dark:text-blue-200/90 mb-4">
              이 대회는 비밀번호가 필요합니다. 비밀번호를 입력해 주세요.
            </p>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordError(null);
                }}
                className="w-full sm:w-64 rounded-lg border border-blue-200 bg-white px-4 py-2 text-blue-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-400/60 dark:bg-slate-900 dark:text-blue-100"
                placeholder="비밀번호"
                disabled={passwordMutation.isLoading}
              />
              <Button
                type="submit"
                loading={passwordMutation.isLoading}
              >
                입장하기
              </Button>
            </form>
            {(passwordError || accessLoading) && (
              <div className="mt-3 text-sm text-red-600 dark:text-red-300">
                {accessLoading ? '접근 권한을 확인하는 중입니다.' : passwordError}
              </div>
            )}
          </Card>
        )}
      </div>
    );
  };

  const renderAnnouncements = () => {
    if (!hasAccess) {
      return <div className="text-sm text-gray-600">비밀번호 인증 후 공지를 확인할 수 있습니다.</div>;
    }

    if (announcementsLoading) {
      return (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (announcementsError) {
      return <div className="text-sm text-red-600">공지사항을 불러오는 중 오류가 발생했습니다.</div>;
    }

    if (!announcements.length) {
      return (
        <div className="flex min-h-[120px] items-center justify-center py-6 text-center text-base text-gray-500">
          등록된 공지가 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
              <span className="text-xs text-gray-500">{formatDateTime(announcement.createdAt)}</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderProblems = () => {
    if (!hasAccess) {
      return <div className="text-sm text-gray-600">비밀번호 인증 후 문제를 확인할 수 있습니다.</div>;
    }

    if (problemsLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (problemsError) {
      return <div className="text-sm text-red-600">문제 목록을 불러오는 중 오류가 발생했습니다.</div>;
    }

    return <ContestProblemList problems={problems} />;
  };

  const renderRank = () => {
    if (!hasAccess) {
      return <div className="text-sm text-gray-600">비밀번호 인증 후 랭크를 확인할 수 있습니다.</div>;
    }

    if (rankLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (rankError) {
      return <div className="text-sm text-red-600">랭크 정보를 불러오는 중 오류가 발생했습니다.</div>;
    }

    return <ContestRankTable entries={rankEntries} ruleType={contest.ruleType} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-stretch">
        <Button
          variant="secondary"
          onClick={() => navigate('/contests')}
          className="w-full md:w-auto md:self-start"
        >
          ← 대회 목록으로 돌아가기
        </Button>
        <div className="md:ml-auto md:w-fit">
          <Card className="border-0 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900 md:min-w-[320px]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 flex-col rounded-xl bg-blue-50 px-4 py-2.5 dark:bg-blue-900/30">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                  남은 시간
                </span>
                <span className={`mt-1 text-base font-semibold sm:text-lg ${timeTextClass} whitespace-nowrap`}>{timeLeftDisplay}</span>
              </div>
              <div className="flex flex-1 flex-col rounded-xl bg-sky-50 px-4 py-2.5 dark:bg-sky-900/30">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                  총 문제수 / 제출한 문제수
                </span>
                <span className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg whitespace-nowrap">{problemSummary}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 xl:w-64 space-y-2">
          {tabs.map((tab) => {
            const disabled = disabledTabs(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!disabled) {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'problems' && renderProblems()}
          {activeTab === 'rank' && renderRank()}
        </div>
      </div>
    </div>
  );
};
