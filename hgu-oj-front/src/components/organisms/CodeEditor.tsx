import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { LanguageOption, ExecutionResult } from '../../types';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
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

const defaultCode = {
  javascript: `function solution() {
    // 코드를 작성하세요
    return 0;
}`,
  python: `def solution():
    # 코드를 작성하세요
    return 0`,
  java: `public class Solution {
    public static void main(String[] args) {
        // 코드를 작성하세요
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // 코드를 작성하세요
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // 코드를 작성하세요
    return 0;
}`,
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  initialLanguage = 'javascript',
  onCodeChange,
  onLanguageChange,
  onExecute,
  onSubmit,
  executionResult,
  isExecuting = false,
  isSubmitting = false,
  className = '',
}) => {
  const [code, setCode] = useState(initialCode || defaultCode[initialLanguage as keyof typeof defaultCode]);
  const [language, setLanguage] = useState(initialLanguage);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const editorRef = useRef<any>(null);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage as keyof typeof defaultCode]);
    onLanguageChange?.(newLanguage);
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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 상단 컨트롤 */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(!showInput)}
          >
            {showInput ? '입력 숨기기' : '입력 보기'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting}
            loading={isExecuting}
          >
            실행
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

      <div className="flex-1 flex">
        {/* 코드 에디터 */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={languageOptions.find(opt => opt.value === language)?.monacoLanguage || 'javascript'}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
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

        {/* 입력/출력 패널 */}
        <div className="w-80 border-l bg-gray-50 flex flex-col">
          {showInput && (
            <div className="p-4 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입력
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                placeholder="입력을 입력하세요..."
              />
            </div>
          )}

          <div className="flex-1 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              실행 결과
            </label>
            <Card className="h-full">
              <div className="h-full overflow-auto">
                {executionResult ? (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">상태: </span>
                      <span className={`font-mono ${
                        executionResult.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {executionResult.status === 'SUCCESS' ? '성공' : '실패'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">실행 시간: </span>
                      <span className="font-mono">{executionResult.executionTime}ms</span>
                    </div>
                    <div>
                      <span className="font-medium">메모리 사용량: </span>
                      <span className="font-mono">{executionResult.memoryUsage}KB</span>
                    </div>
                    {executionResult.output && (
                      <div>
                        <span className="font-medium">출력:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
                          {executionResult.output}
                        </pre>
                      </div>
                    )}
                    {executionResult.error && (
                      <div>
                        <span className="font-medium text-red-600">오류:</span>
                        <pre className="mt-1 p-2 bg-red-50 rounded text-sm font-mono whitespace-pre-wrap text-red-600">
                          {executionResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    실행 결과가 여기에 표시됩니다.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
