import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import codeTemplates from '../config/codeTemplates.json';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import {
  adminService,
  CreateContestPayload,
  CreateProblemPayload,
  CreateWorkbookPayload,
} from '../services/adminService';
import { useAuthStore } from '../stores/authStore';
import { Workbook } from '../types';

const templateMap = codeTemplates as Record<string, string>;
const availableLanguages = Object.keys(templateMap);

type ProblemFormState = {
  displayId: string;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  difficulty: 'Low' | 'Mid' | 'High';
  timeLimit: string;
  memoryLimit: string;
  ruleType: 'ACM' | 'OI';
  tags: string;
  visible: boolean;
  shareSubmission: boolean;
  source: string;
  hint: string;
  ioInput: string;
  ioOutput: string;
};

type ContestFormState = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  ruleType: 'ACM' | 'OI';
  password: string;
  visible: boolean;
  realTimeRank: boolean;
  allowedIpRanges: string;
};

type WorkbookFormState = {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
};

type AdminSection = 'problem' | 'bulk' | 'contest' | 'workbook' | 'workbook-manage';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const isAdmin = useMemo(() => {
    const flag = user?.admin_type;
    return flag === 'Admin' || flag === 'Super Admin';
  }, [user?.admin_type]);

  const [problemForm, setProblemForm] = useState<ProblemFormState>({
    displayId: '',
    title: '',
    description: '',
    inputDescription: '',
    outputDescription: '',
    difficulty: 'Mid',
    timeLimit: '1000',
    memoryLimit: '256',
    ruleType: 'ACM',
    tags: '',
    visible: true,
    shareSubmission: false,
    source: '',
    hint: '',
    ioInput: 'input.txt',
    ioOutput: 'output.txt',
  });

  const [samples, setSamples] = useState<Array<{ input: string; output: string }>>([
    { input: '', output: '' },
  ]);

  const [problemLanguages, setProblemLanguages] = useState<string[]>([...availableLanguages]);
  const [testCaseFile, setTestCaseFile] = useState<File | null>(null);
  const [testCaseId, setTestCaseId] = useState('');
  const [isUploadingTestCases, setIsUploadingTestCases] = useState(false);
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemMessage, setProblemMessage] = useState<{ success?: string; error?: string }>({});

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ success?: string; error?: string }>({});

  const [contestForm, setContestForm] = useState<ContestFormState>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    ruleType: 'ACM',
    password: '',
    visible: true,
    realTimeRank: true,
    allowedIpRanges: '',
  });
  const [contestLoading, setContestLoading] = useState(false);
  const [contestMessage, setContestMessage] = useState<{ success?: string; error?: string }>({});

  const [workbookForm, setWorkbookForm] = useState<WorkbookFormState>({
    title: '',
    description: '',
    category: '',
    isPublic: false,
  });
  const [workbookLoading, setWorkbookLoading] = useState(false);
  const [workbookMessage, setWorkbookMessage] = useState<{ success?: string; error?: string }>({});

  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [isWorkbookListLoading, setIsWorkbookListLoading] = useState(false);
  const [workbookListError, setWorkbookListError] = useState<string | null>(null);
  const [deletingWorkbookId, setDeletingWorkbookId] = useState<number | null>(null);

  const [activeSection, setActiveSection] = useState<AdminSection>('problem');

  const loadWorkbooks = useCallback(async () => {
    setWorkbookListError(null);
    setIsWorkbookListLoading(true);
    try {
      const list = await adminService.getWorkbooks();
      setWorkbooks(Array.isArray(list) ? list : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제집 정보를 불러오는 중 오류가 발생했습니다.';
      setWorkbookListError(message);
    } finally {
      setIsWorkbookListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'workbook-manage') {
      loadWorkbooks();
    }
  }, [activeSection, loadWorkbooks]);

  const handleRefreshWorkbooks = async () => {
    await loadWorkbooks();
  };

  const handleDeleteWorkbook = async (id: number) => {
    setWorkbookListError(null);
    setDeletingWorkbookId(id);
    try {
      await adminService.deleteWorkbook(id);
      setWorkbooks((prev) => prev.filter((workbook) => workbook.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제집 삭제 중 오류가 발생했습니다.';
      setWorkbookListError(message);
    } finally {
      setDeletingWorkbookId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-semibold text-gray-900">로그인이 필요합니다</h1>
            <p className="text-sm text-gray-600">관리자 기능을 사용하려면 먼저 로그인하세요.</p>
            <Button onClick={() => navigate('/login')}>
              로그인 페이지로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-semibold text-gray-900">권한이 없습니다</h1>
            <p className="text-sm text-gray-600">관리자 전용 페이지입니다. 권한이 필요하면 운영자에게 문의해주세요.</p>
            <Button variant="outline" onClick={() => navigate('/')}>메인으로 돌아가기</Button>
          </div>
        </Card>
      </div>
    );
  }

  const sections: Array<{ key: AdminSection; label: string; helper: string }> = [
    { key: 'problem', label: '문제 등록', helper: '단일 문제 생성 및 메타데이터 관리' },
    { key: 'bulk', label: '문제 대량 등록', helper: 'JSON ZIP 업로드로 여러 문제 처리' },
    { key: 'contest', label: '대회 등록', helper: '대회 일정과 옵션 생성' },
    { key: 'workbook', label: '문제집 등록', helper: '마이크로서비스 문제집 관리' },
    { key: 'workbook-manage', label: '문제집 관리', helper: '문제집 목록 확인 및 삭제' },
  ];

  const handleSampleChange = (index: number, field: 'input' | 'output', value: string) => {
    setSamples((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSample = () => {
    setSamples((prev) => [...prev, { input: '', output: '' }]);
  };

  const handleRemoveSample = (index: number) => {
    setSamples((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleLanguage = (language: string) => {
    setProblemLanguages((prev) => {
      if (prev.includes(language)) {
        return prev.filter((lang) => lang !== language);
      }
      return [...prev, language];
    });
  };

  const handleUploadTestCases = async () => {
    if (!testCaseFile) {
      setProblemMessage({ error: '업로드할 테스트케이스 ZIP 파일을 선택하세요.' });
      return;
    }
    try {
      setIsUploadingTestCases(true);
      setProblemMessage({});
      const result = await adminService.uploadProblemTestCases(testCaseFile, false);
      setTestCaseId(result.id);
      setProblemMessage({ success: `테스트케이스 업로드 완료 (ID: ${result.id})` });
    } catch (error) {
      const message = error instanceof Error ? error.message : '테스트케이스 업로드 중 오류가 발생했습니다.';
      setProblemMessage({ error: message });
    } finally {
      setIsUploadingTestCases(false);
    }
  };

  const handleProblemSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProblemMessage({});

    if (!problemForm.displayId.trim()) {
      setProblemMessage({ error: '표시 ID를 입력하세요.' });
      return;
    }

    if (!testCaseId) {
      setProblemMessage({ error: '먼저 테스트케이스를 업로드해 ID를 확보하세요.' });
      return;
    }

    const cleanedSamples = samples
      .map((sample) => ({ input: sample.input.trim(), output: sample.output.trim() }))
      .filter((sample) => sample.input || sample.output);

    if (cleanedSamples.length === 0) {
      setProblemMessage({ error: '최소 한 개 이상의 예제를 입력하세요.' });
      return;
    }

    const tagList = problemForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagList.length === 0) {
      setProblemMessage({ error: '태그를 최소 한 개 이상 입력하세요.' });
      return;
    }

    if (problemLanguages.length === 0) {
      setProblemMessage({ error: '최소 한 개 이상의 언어를 선택하세요.' });
      return;
    }

    const payload: CreateProblemPayload = {
      _id: problemForm.displayId.trim(),
      title: problemForm.title.trim(),
      description: problemForm.description,
      input_description: problemForm.inputDescription,
      output_description: problemForm.outputDescription,
      samples: cleanedSamples,
      test_case_id: testCaseId,
      test_case_score: [] as Array<{ input_name: string; output_name: string; score: number }>,
      time_limit: Number(problemForm.timeLimit) || 1000,
      memory_limit: Number(problemForm.memoryLimit) || 256,
      languages: problemLanguages,
      template: problemLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang] = templateMap[lang] || '';
        return acc;
      }, {}),
      rule_type: problemForm.ruleType,
      io_mode: {
        io_mode: 'Standard IO',
        input: problemForm.ioInput.trim() || 'input.txt',
        output: problemForm.ioOutput.trim() || 'output.txt',
      },
      spj: false,
      spj_language: null,
      spj_code: null,
      spj_compile_ok: false,
      visible: problemForm.visible,
      difficulty: problemForm.difficulty,
      tags: tagList,
      hint: problemForm.hint.trim() || null,
      source: problemForm.source.trim() || null,
      share_submission: problemForm.shareSubmission,
    };

    try {
      setProblemLoading(true);
      await adminService.createProblem(payload);
      setProblemMessage({ success: '문제가 성공적으로 등록되었습니다.' });
      setProblemForm({
        displayId: '',
        title: '',
        description: '',
        inputDescription: '',
        outputDescription: '',
        difficulty: 'Mid',
        timeLimit: '1000',
        memoryLimit: '256',
        ruleType: 'ACM',
        tags: '',
        visible: true,
        shareSubmission: false,
        source: '',
        hint: '',
        ioInput: 'input.txt',
        ioOutput: 'output.txt',
      });
      setSamples([{ input: '', output: '' }]);
      setProblemLanguages([...availableLanguages]);
      setTestCaseFile(null);
      setTestCaseId('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제 등록 중 오류가 발생했습니다.';
      setProblemMessage({ error: message });
    } finally {
      setProblemLoading(false);
    }
  };

  const handleBulkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBulkMessage({});

    if (!bulkFile) {
      setBulkMessage({ error: '업로드할 ZIP 파일을 선택하세요.' });
      return;
    }

    try {
      setBulkLoading(true);
      const result = await adminService.bulkImportProblems(bulkFile);
      const count = Array.isArray(result) ? result.length : 0;
      setBulkMessage({ success: `총 ${count}개의 문제를 처리했습니다.` });
      setBulkFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제 대량 등록 중 오류가 발생했습니다.';
      setBulkMessage({ error: message });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleContestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContestMessage({});

    if (!contestForm.startTime || !contestForm.endTime) {
      setContestMessage({ error: '대회 시작/종료 시간을 모두 입력하세요.' });
      return;
    }

    const start = new Date(contestForm.startTime);
    const end = new Date(contestForm.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setContestMessage({ error: '유효한 날짜와 시간을 입력하세요.' });
      return;
    }

    const allowedIpRanges = contestForm.allowedIpRanges
      .split(/[\n,]+/)
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    const payload: CreateContestPayload = {
      title: contestForm.title.trim(),
      description: contestForm.description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      rule_type: contestForm.ruleType,
      password: contestForm.password,
      visible: contestForm.visible,
      real_time_rank: contestForm.realTimeRank,
      allowed_ip_ranges: allowedIpRanges,
    };

    try {
      setContestLoading(true);
      await adminService.createContest(payload);
      setContestMessage({ success: '대회가 성공적으로 등록되었습니다.' });
      setContestForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        ruleType: 'ACM',
        password: '',
        visible: true,
        realTimeRank: true,
        allowedIpRanges: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '대회 등록 중 오류가 발생했습니다.';
      setContestMessage({ error: message });
    } finally {
      setContestLoading(false);
    }
  };

  const handleWorkbookSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorkbookMessage({});

    if (!workbookForm.title.trim()) {
      setWorkbookMessage({ error: '문제집 제목을 입력하세요.' });
      return;
    }

    const payload: CreateWorkbookPayload = {
      title: workbookForm.title.trim(),
      description: workbookForm.description.trim() || undefined,
      category: workbookForm.category.trim() || undefined,
      is_public: workbookForm.isPublic,
    };

    try {
      setWorkbookLoading(true);
      const workbook = await adminService.createWorkbook(payload);
      setWorkbookMessage({ success: `문제집(ID: ${workbook.id})이 등록되었습니다.` });
      setWorkbookForm({
        title: '',
        description: '',
        category: '',
        isPublic: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제집 등록 중 오류가 발생했습니다.';
      setWorkbookMessage({ error: message });
    } finally {
      setWorkbookLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'problem':
        return (
          <Card padding="lg">
            <form onSubmit={handleProblemSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">문제 등록</h2>
                <p className="text-sm text-gray-500">ZIP 테스트케이스 업로드 후 메타데이터를 입력하세요. SPJ는 현재 지원하지 않습니다.</p>
              </div>

              {problemMessage.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{problemMessage.error}</div>
              )}
              {problemMessage.success && (
                <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">{problemMessage.success}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="표시 ID"
                  value={problemForm.displayId}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, displayId: e.target.value }))}
                  required
                />
                <Input
                  label="제목"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
                <Input
                  label="시간 제한 (ms)"
                  type="number"
                  value={problemForm.timeLimit}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, timeLimit: e.target.value }))}
                />
                <Input
                  label="메모리 제한 (MB)"
                  type="number"
                  value={problemForm.memoryLimit}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, memoryLimit: e.target.value }))}
                />
                <Input
                  label="태그 (쉼표로 구분)"
                  value={problemForm.tags}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="dp, greedy"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm((prev) => ({ ...prev, difficulty: e.target.value as ProblemFormState['difficulty'] }))}
                  >
                    <option value="Low">Level1</option>
                    <option value="Mid">Level2</option>
                    <option value="High">Level3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">룰 타입</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    value={problemForm.ruleType}
                    onChange={(e) => setProblemForm((prev) => ({ ...prev, ruleType: e.target.value as ProblemFormState['ruleType'] }))}
                  >
                    <option value="ACM">ACM</option>
                    <option value="OI">OI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공개/풀이 공유</label>
                  <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={problemForm.visible}
                        onChange={(e) => setProblemForm((prev) => ({ ...prev, visible: e.target.checked }))}
                      />
                      <span>공개</span>
                    </label>
                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={problemForm.shareSubmission}
                        onChange={(e) => setProblemForm((prev) => ({ ...prev, shareSubmission: e.target.checked }))}
                      />
                      <span>풀이 공유 허용</span>
                    </label>
                  </div>
                </div>
                <Input
                  label="출처"
                  value={problemForm.source}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, source: e.target.value }))}
                />
                <Input
                  label="힌트"
                  value={problemForm.hint}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, hint: e.target.value }))}
                />
                <Input
                  label="IO 입력 파일명"
                  value={problemForm.ioInput}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, ioInput: e.target.value }))}
                />
                <Input
                  label="IO 출력 파일명"
                  value={problemForm.ioOutput}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, ioOutput: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                  rows={4}
                  value={problemForm.description}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">입력 설명</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    rows={3}
                    value={problemForm.inputDescription}
                    onChange={(e) => setProblemForm((prev) => ({ ...prev, inputDescription: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출력 설명</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    rows={3}
                    value={problemForm.outputDescription}
                    onChange={(e) => setProblemForm((prev) => ({ ...prev, outputDescription: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">예제 입력/출력</h3>
                  <Button type="button" variant="outline" onClick={handleAddSample}>
                    예제 추가
                  </Button>
                </div>
                <div className="space-y-4">
                  {samples.map((sample, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">예제 입력 #{index + 1}</label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                          rows={3}
                          value={sample.input}
                          onChange={(e) => handleSampleChange(index, 'input', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">예제 출력 #{index + 1}</label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                          rows={3}
                          value={sample.output}
                          onChange={(e) => handleSampleChange(index, 'output', e.target.value)}
                        />
                      </div>
                      {samples.length > 1 && (
                        <div className="md:col-span-2 flex justify-end">
                          <Button type="button" variant="ghost" onClick={() => handleRemoveSample(index)}>
                            예제 삭제
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">지원 언어</h3>
                <div className="flex flex-wrap gap-3">
                  {availableLanguages.map((language) => (
                    <label key={language} className="inline-flex items-center space-x-2 text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-1">
                      <input
                        type="checkbox"
                        checked={problemLanguages.includes(language)}
                        onChange={() => toggleLanguage(language)}
                      />
                      <span>{language}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">테스트케이스 업로드</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setTestCaseFile(e.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                  <Button type="button" variant="outline" loading={isUploadingTestCases} onClick={handleUploadTestCases}>
                    테스트케이스 업로드
                  </Button>
                  {testCaseId && (
                    <span className="text-sm text-green-600">현재 ID: {testCaseId}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={problemLoading}>문제 등록</Button>
              </div>
            </form>
          </Card>
        );
      case 'bulk':
        return (
          <Card padding="lg">
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">문제 대량 등록 (Micro-service)</h2>
                <p className="text-sm text-gray-500">JSON 기반 ZIP 파일을 업로드하면 문제를 일괄 등록합니다.</p>
              </div>

              {bulkMessage.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{bulkMessage.error}</div>
              )}
              {bulkMessage.success && (
                <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">{bulkMessage.success}</div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
                {bulkFile && <span className="text-sm text-gray-600">선택된 파일: {bulkFile.name}</span>}
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={bulkLoading}>대량 등록</Button>
              </div>
            </form>
          </Card>
        );
      case 'contest':
        return (
          <Card padding="lg">
            <form onSubmit={handleContestSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">대회 등록</h2>
                <p className="text-sm text-gray-500">대회 기본 정보를 입력한 뒤 등록할 수 있습니다.</p>
              </div>

              {contestMessage.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{contestMessage.error}</div>
              )}
              {contestMessage.success && (
                <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">{contestMessage.success}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="대회 제목"
                  value={contestForm.title}
                  onChange={(e) => setContestForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
                <Input
                  label="대회 비밀번호 (선택)"
                  value={contestForm.password}
                  onChange={(e) => setContestForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    value={contestForm.startTime}
                    onChange={(e) => setContestForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    value={contestForm.endTime}
                    onChange={(e) => setContestForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">룰 타입</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                    value={contestForm.ruleType}
                    onChange={(e) => setContestForm((prev) => ({ ...prev, ruleType: e.target.value as ContestFormState['ruleType'] }))}
                  >
                    <option value="ACM">ACM</option>
                    <option value="OI">OI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">표시 설정</label>
                  <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={contestForm.visible}
                        onChange={(e) => setContestForm((prev) => ({ ...prev, visible: e.target.checked }))}
                      />
                      <span>공개</span>
                    </label>
                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={contestForm.realTimeRank}
                        onChange={(e) => setContestForm((prev) => ({ ...prev, realTimeRank: e.target.checked }))}
                      />
                      <span>실시간 랭크</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대회 설명</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                  rows={4}
                  value={contestForm.description}
                  onChange={(e) => setContestForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">허용 IP CIDR (쉼표 또는 줄바꿈 구분)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                  rows={2}
                  value={contestForm.allowedIpRanges}
                  onChange={(e) => setContestForm((prev) => ({ ...prev, allowedIpRanges: e.target.value }))}
                  placeholder="127.0.0.1/32, 10.0.0.0/24"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={contestLoading}>대회 등록</Button>
              </div>
            </form>
          </Card>
        );
      case 'workbook-manage':
        return (
          <Card padding="lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">문제집 관리</h2>
                <p className="text-sm text-gray-500">등록된 문제집을 확인하고 필요 시 삭제할 수 있습니다.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                loading={isWorkbookListLoading}
                onClick={handleRefreshWorkbooks}
              >
                새로고침
              </Button>
            </div>

            {workbookListError && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{workbookListError}</div>
            )}

            {isWorkbookListLoading && workbooks.length === 0 && !workbookListError && (
              <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                문제집 정보를 불러오는 중입니다...
              </div>
            )}

            {!isWorkbookListLoading && workbooks.length === 0 && !workbookListError && (
              <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                등록된 문제집이 없습니다. 문제집을 먼저 생성해 보세요.
              </div>
            )}

            {workbooks.length > 0 && (
              <ul className="mt-4 space-y-4">
                {workbooks.map((workbook) => (
                  <li key={workbook.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">{workbook.title}</h3>
                          <span className={`text-xs font-medium ${workbook.is_public ? 'text-green-600' : 'text-gray-500'}`}>
                            {workbook.is_public ? '공개' : '비공개'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">ID: {workbook.id}{workbook.category ? ` · 카테고리: ${workbook.category}` : ''}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          생성: {formatDate(workbook.created_at)} · 수정: {formatDate(workbook.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          loading={deletingWorkbookId === workbook.id}
                          onClick={() => handleDeleteWorkbook(workbook.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                    {workbook.description && (
                      <p className="mt-3 text-sm text-gray-700">{workbook.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      case 'workbook':
      default:
        return (
          <Card padding="lg">
            <form onSubmit={handleWorkbookSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">문제집 등록 (Micro-service)</h2>
                <p className="text-sm text-gray-500">문제집 메타데이터를 입력하면 마이크로서비스에 등록합니다.</p>
              </div>

              {workbookMessage.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{workbookMessage.error}</div>
              )}
              {workbookMessage.success && (
                <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">{workbookMessage.success}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="문제집 제목"
                  value={workbookForm.title}
                  onChange={(e) => setWorkbookForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
                <Input
                  label="카테고리"
                  value={workbookForm.category}
                  onChange={(e) => setWorkbookForm((prev) => ({ ...prev, category: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={workbookForm.isPublic}
                      onChange={(e) => setWorkbookForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <span>공개 문제집으로 설정</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                  rows={4}
                  value={workbookForm.description}
                  onChange={(e) => setWorkbookForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={workbookLoading}>문제집 등록</Button>
              </div>
            </form>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 도구</h1>
          <p className="mt-2 text-sm text-gray-600">좌측 메뉴에서 원하는 기능을 선택하면 관련 폼이 표시됩니다.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 flex-none">
            <Card padding="lg">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const active = activeSection === section.key;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full rounded-md border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113F67] min-h-[88px] ${
                        active
                          ? 'border-[#113F67] bg-[#113F67] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-[#113F67] hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-semibold">{section.label}</div>
                      <div className={`mt-1 text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                        {section.helper}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
