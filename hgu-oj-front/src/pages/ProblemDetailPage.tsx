import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblem } from '../hooks/useProblems';
import { CodeEditor } from '../components/organisms/CodeEditor';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { ExecutionResult } from '../types';
import { executionService } from '../services/executionService';

export const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problemId = id ? parseInt(id, 10) : 0;

  const { data: problem, isLoading, error } = useProblem(problemId);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | undefined>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Layout states: left/right resizable and collapsible
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftWidthPct, setLeftWidthPct] = useState<number>(() => {
    const saved = localStorage.getItem('oj:layout:leftWidthPct');
    return saved ? Number(saved) : 45; // percentage
  });
  const [isDraggingLR, setIsDraggingLR] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('oj:layout:leftCollapsed');
    return saved === '1';
  });
  // Right editor is always visible; no collapse state

  const onMouseMoveLR = useCallback((e: MouseEvent) => {
    if (!isDraggingLR || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(15, Math.min(85, (x / rect.width) * 100));
    setLeftWidthPct(pct);
  }, [isDraggingLR]);

  const onMouseUpLR = useCallback(() => setIsDraggingLR(false), []);

  useEffect(() => {
    if (isDraggingLR) {
      window.addEventListener('mousemove', onMouseMoveLR);
      window.addEventListener('mouseup', onMouseUpLR);
      return () => {
        window.removeEventListener('mousemove', onMouseMoveLR);
        window.removeEventListener('mouseup', onMouseUpLR);
      };
    }
  }, [isDraggingLR, onMouseMoveLR, onMouseUpLR]);

  useEffect(() => {
    localStorage.setItem('oj:layout:leftWidthPct', String(leftWidthPct));
  }, [leftWidthPct]);

  useEffect(() => {
    localStorage.setItem('oj:layout:leftCollapsed', leftCollapsed ? '1' : '0');
  }, [leftCollapsed]);

  // Keyboard shortcut: Ctrl/Cmd+B to toggle left panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setLeftCollapsed(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleExecute = async (code: string, language: string, input?: string) => {
    setIsExecuting(true);
    try {
      const raw = await executionService.run({ language, code, input });
      // Normalize to ExecutionResult (support diverse shapes)
      // Prefer the last record in data[] when present
      const dataArr = Array.isArray((raw as any).data) ? (raw as any).data as any[] : [];
      const last = dataArr.length > 0 ? dataArr[dataArr.length - 1] : undefined;

      const output = (last?.output ?? last?.stdout ?? (raw as any).output ?? (raw as any).stdout ?? '') as string;
      const stderr = (last?.stderr ?? (raw as any).stderr) as string | undefined;
      const errField = (raw as any).err;
      const apiErrorField = (raw as any).error;
      let errorMsg = typeof apiErrorField === 'string' ? apiErrorField : stderr;
      if (!errorMsg && typeof errField === 'string') {
        const detail = typeof (raw as any).data === 'string' ? (raw as any).data : undefined;
        errorMsg = detail ? `${errField}: ${detail}` : errField;
      }
      const time = (last?.cpu_time ?? last?.real_time ?? (raw as any).time ?? (raw as any).cpu_time ?? (raw as any).real_time ?? 0) as number;
      let memory = Number(last?.memory ?? (raw as any).memory ?? 0);
      // Heuristic: if memory looks like bytes, convert to KB
      if (memory > 0 && memory > 10_000) {
        memory = Math.round(memory / 1024);
      }
      const status: ExecutionResult['status'] = errorMsg ? 'ERROR' : ((last?.exit_code ?? 0) === 0 ? 'SUCCESS' : 'ERROR');
      const finalOutput = output || (!errorMsg ? JSON.stringify(raw, null, 2) : '');
      setExecutionResult({
        output: finalOutput,
        error: errorMsg,
        executionTime: Math.max(0, Math.round(time)),
        memoryUsage: Math.max(0, Math.round(memory)),
        status,
      });
    } catch (err: any) {
      setExecutionResult({
        output: '',
        error: err?.message || '실행 중 오류가 발생했습니다.',
        executionTime: 0,
        memoryUsage: 0,
        status: 'ERROR',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async (code: string, language: string) => {
    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출로 대체
      // await submitSolution({ problemId, code, language });
      
      // 임시 처리
      setTimeout(() => {
        alert('제출이 완료되었습니다!');
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      alert('제출 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">문제를 찾을 수 없습니다</h1>
          <Button onClick={() => navigate('/problems')}>
            문제 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-0">
      <div
        ref={containerRef}
        className="relative flex gap-0 h-screen overflow-visible"
      >
        {/* Left: Problem */}
        <div
          className="flex flex-col bg-white"
          style={{ width: leftCollapsed ? 0 : `${leftWidthPct}%` }}
        >
          {/* Scrollable problem content - headerless, edge-to-edge */}
          <div className="flex-1 overflow-auto no-scrollbar">
            <div className="px-6 py-4 space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {problem.title}
                  {problem.solved && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">Solved</span>
                  )}
                </h1>
                <span className="text-xs text-gray-600">시간 {problem.timeLimit}ms · 메모리 {problem.memoryLimit}MB</span>
              </div>

              <section>
                <h2 className="text-lg font-semibold mb-3">문제 설명</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                </div>
              </section>

              {problem.inputDescription && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">입력 형식</h2>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: problem.inputDescription }} />
                  </div>
                </section>
              )}

              {problem.outputDescription && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">출력 형식</h2>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: problem.outputDescription }} />
                  </div>
                </section>
              )}

              {problem.samples && problem.samples.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">입출력 예제</h2>
                  <div className="space-y-4">
                    {problem.samples.map((sample, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">입력 {index + 1}</h3>
                          <pre className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
                            {sample.input}
                          </pre>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">출력 {index + 1}</h3>
                          <pre className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
                            {sample.output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {problem.hint && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">힌트</h2>
                  <p className="whitespace-pre-wrap">{problem.hint}</p>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Vertical resizer with collapse/expand toggle (minimal visual line, wide hit area) */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={() => !leftCollapsed && setIsDraggingLR(true)}
          className="oj-resizer-v flex items-center justify-center select-none"
          style={{ userSelect: 'none' }}
        >
          <button
            aria-label={leftCollapsed ? '좌측 패널 펼치기' : '좌측 패널 접기'}
            className="oj-side-handle small blend"
            onClick={(e) => { e.stopPropagation(); setLeftCollapsed(v => !v); }}
            title={leftCollapsed ? '펼치기' : '접기'}
          >
            {leftCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
          </button>
        </div>

        {/* Right: Editor + I/O split */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center px-4 py-2 border-b bg-gray-50">
            <div className="text-sm text-gray-700">코드 편집</div>
          </div>
          <CodeEditor
            problemId={problemId}
            samples={problem.samples}
            onExecute={handleExecute}
            onSubmit={handleSubmit}
            executionResult={executionResult}
            isExecuting={isExecuting}
            isSubmitting={isSubmitting}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};
