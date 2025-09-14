import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { LanguageOption, ExecutionResult } from '../../types';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import codeTemplates from '../../config/codeTemplates.json';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  problemId?: number;
  samples?: Array<{ input: string; output: string }>;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  onExecute?: (code: string, language: string, input?: string) => void;
  onSubmit?: (code: string, language: string) => void;
  executionResult?: ExecutionResult;
  isExecuting?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

const languageOptions: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript', extension: 'js', monacoLanguage: 'javascript' },
  { value: 'python', label: 'Python', extension: 'py', monacoLanguage: 'python' },
  { value: 'java', label: 'Java', extension: 'java', monacoLanguage: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp', monacoLanguage: 'cpp' },
  { value: 'c', label: 'C', extension: 'c', monacoLanguage: 'c' },
];

const defaultCode: Record<string, string> = codeTemplates as Record<string, string>;

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  initialLanguage = 'javascript',
  problemId,
  samples,
  onCodeChange,
  onLanguageChange,
  onExecute,
  onSubmit,
  executionResult,
  isExecuting = false,
  isSubmitting = false,
  className = '',
}) => {
  // Storage keys
  const codeKey = useMemo(() => `oj:code:${problemId ?? 'global'}:`, [problemId]);
  const langKey = useMemo(() => `oj:lang:${problemId ?? 'global'}`, [problemId]);
  const themeKey = 'oj:editorTheme';

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(langKey);
    return saved || initialLanguage;
  });
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(codeKey + language);
    if (saved != null) return saved;
    if (initialCode) return initialCode;
    return defaultCode[language] || '';
  });

  const [input, setInput] = useState('');
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(themeKey) as 'light' | 'dark') || 'dark');

  // Layout: vertical split top (editor) / bottom (IO)
  const [ioHeightPct, setIoHeightPct] = useState<number>(() => {
    const saved = localStorage.getItem('oj:layout:ioHeightPct');
    return saved ? Number(saved) : 35; // percentage of component for IO panel
  });
  const [draggingIO, setDraggingIO] = useState(false);
  const [ioCollapsed, setIoCollapsed] = useState(false);
  // Inner IO split (input|output side-by-side)
  const [ioSplitPct, setIoSplitPct] = useState<number>(() => {
    const saved = localStorage.getItem('oj:layout:ioInnerSplitPct');
    return saved ? Number(saved) : 50;
  });
  const [draggingIOSplit, setDraggingIOSplit] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!draggingIO || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pctBottom = Math.max(16, Math.min(84, ((rect.height - y) / rect.height) * 100));
    setIoHeightPct(pctBottom);
  }, [draggingIO]);

  const stopResize = useCallback(() => setDraggingIO(false), []);

  useEffect(() => {
    if (draggingIO) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', stopResize);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', stopResize);
      };
    }
  }, [draggingIO, handleResizeMove, stopResize]);

  useEffect(() => {
    localStorage.setItem('oj:layout:ioHeightPct', String(ioHeightPct));
  }, [ioHeightPct]);

  // IO inner split listeners
  const handleIOSplitMove = useCallback((e: MouseEvent) => {
    if (!draggingIOSplit) return;
    const pane = document.getElementById('oj-io-pane');
    if (!pane) return;
    const rect = pane.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
    setIoSplitPct(pct);
  }, [draggingIOSplit]);

  const stopIOSplit = useCallback(() => setDraggingIOSplit(false), []);

  useEffect(() => {
    if (draggingIOSplit) {
      window.addEventListener('mousemove', handleIOSplitMove);
      window.addEventListener('mouseup', stopIOSplit);
      return () => {
        window.removeEventListener('mousemove', handleIOSplitMove);
        window.removeEventListener('mouseup', stopIOSplit);
      };
    }
  }, [draggingIOSplit, handleIOSplitMove, stopIOSplit]);

  useEffect(() => {
    localStorage.setItem('oj:layout:ioInnerSplitPct', String(ioSplitPct));
  }, [ioSplitPct]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const saved = localStorage.getItem(codeKey + newLanguage);
    setCode(saved ?? defaultCode[newLanguage] ?? '');
    onLanguageChange?.(newLanguage);
    localStorage.setItem(langKey, newLanguage);
  };

  const handleExecute = () => {
    onExecute?.(code, language, input);
  };

  const handleSubmit = () => {
    onSubmit?.(code, language);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Autosave to localStorage with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(codeKey + language, code);
    }, 400);
    return () => clearTimeout(t);
  }, [code, language, codeKey]);

  // Keyboard shortcuts: Run (Ctrl/Cmd+Enter), Save (Ctrl/Cmd+S)
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        onExecute?.(code, language, input);
      }
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        localStorage.setItem(codeKey + language, code);
        // lightweight visual flash by toggling a data attribute
        const el = document.getElementById('oj-save-indicator');
        if (el) {
          el.style.opacity = '1';
          setTimeout(() => { if (el) el.style.opacity = '0'; }, 600);
        }
      }
      if (e.key.toLowerCase() === 'i' && e.shiftKey) {
        e.preventDefault();
        setIoCollapsed(v => !v);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [code, language, input, onExecute, codeKey]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem(themeKey, editorTheme);
  }, [editorTheme]);

  return (
    <div ref={containerRef} className={`relative flex flex-col h-full min-h-0 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A0C8] text-sm"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-sm">
            <label className="text-gray-600">테마</label>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value as 'light' | 'dark')}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A0C8] text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div id="oj-save-indicator" className="text-xs text-green-600 opacity-0 transition-opacity">Saved</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('현재 언어의 기본 템플릿으로 초기화할까요?')) {
                const def = defaultCode[language] || '';
                setCode(def);
              }
            }}
          >초기화</Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting}
            loading={isExecuting}
          >
            실행 (Ctrl/Cmd+Enter)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            제출
          </Button>
        </div>
      </div>

      {/* Editor / IO Split */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Editor Area */}
        <div style={{ height: ioCollapsed ? 'calc(100% - 6px)' : `calc(100% - ${ioHeightPct}%)` }} className="min-h-[84px]">
          <Editor
            height="100%"
            language={languageOptions.find(opt => opt.value === language)?.monacoLanguage || 'javascript'}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme={editorTheme === 'dark' ? 'vs-dark' : 'vs'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Resizer: minimal hairline with centered handle */}
        <div
          role="separator"
          aria-orientation="horizontal"
          className="oj-resizer-h select-none"
          onMouseDown={() => !ioCollapsed && setDraggingIO(true)}
        >
          <button
            aria-label={ioCollapsed ? 'I/O 패널 펼치기' : 'I/O 패널 접기'}
            className="oj-handle-h blend"
            onClick={(e) => { e.stopPropagation(); setIoCollapsed(v => !v); }}
            title={ioCollapsed ? 'I/O 펼치기' : 'I/O 접기'}
          >
            {ioCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
        </div>

        {/* IO Panel */}
        {!ioCollapsed && (
          <div style={{ height: `${ioHeightPct}%` }} className="min-h-[140px] border-t bg-gray-50 flex flex-col">
            <div id="oj-io-pane" className="flex-1 overflow-hidden p-3 flex items-stretch gap-3">
              {/* 입력 패널 */}
              <div style={{ width: `${ioSplitPct}%` }} className="min-w-[180px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">입력</label>
                  <div className="flex gap-2">
                    {samples && samples.length > 0 && (
                      <select
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          if (!isNaN(idx)) setInput(samples[idx].input || '');
                          e.currentTarget.selectedIndex = 0;
                        }}
                        defaultValue=""
                        title="샘플 입력 적용"
                      >
                        <option value="" disabled>샘플</option>
                        {samples.map((s, i) => (
                          <option key={i} value={i}>예제 {i + 1}</option>
                        ))}
                      </select>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setInput('')}>지우기</Button>
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(input)}>복사</Button>
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full flex-1 p-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                  placeholder="표준 입력에 전달할 값을 입력하세요"
                />
              </div>

              {/* 수직 리사이저 */}
              <div
                role="separator"
                aria-orientation="vertical"
                className="oj-resizer-v"
                onMouseDown={() => setDraggingIOSplit(true)}
                title="I/O 폭 조절"
              />

              {/* 출력 패널 */}
              <div style={{ width: `${100 - ioSplitPct}%` }} className="min-w-[180px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">출력</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(`${executionResult?.output || ''}${executionResult?.error ? `\n${executionResult.error}` : ''}`)}
                    >복사</Button>
                  </div>
                </div>
                <Card className="flex-1">
                  <div className="h-full overflow-auto space-y-2">
                    {executionResult ? (
                      <>
                        <div className="text-sm text-gray-700">
                          <span className="mr-3">상태: <span className={`font-mono ${executionResult.status === 'SUCCESS' ? 'text-green-600' : executionResult.status === 'TIMEOUT' ? 'text-orange-600' : 'text-red-600'}`}>{executionResult.status}</span></span>
                          <span className="mr-3">시간: <span className="font-mono">{executionResult.executionTime}ms</span></span>
                          <span>메모리: <span className="font-mono">{executionResult.memoryUsage}KB</span></span>
                        </div>
                        {executionResult.output && (
                          <div>
                            <div className="text-sm font-medium mb-1">stdout</div>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">{executionResult.output}</pre>
                          </div>
                        )}
                        {executionResult.error && (
                          <div>
                            <div className="text-sm font-medium text-red-600 mb-1">stderr</div>
                            <pre className="mt-1 p-2 bg-red-50 rounded text-sm font-mono whitespace-pre-wrap text-red-700">{executionResult.error}</pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-8">실행 결과가 여기에 표시됩니다.</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
