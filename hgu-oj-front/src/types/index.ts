// 사용자 관련 타입
export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// 문제 관련 타입
export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  memoryLimit: number;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  hint?: string;
  createdAt: string;
  updatedAt: string;
}

// 제출 관련 타입
export interface Submission {
  id: number;
  userId: number;
  problemId: number;
  language: string;
  code: string;
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  executionTime?: number;
  memoryUsage?: number;
  createdAt: string;
  updatedAt: string;
}

// 대회 관련 타입
export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// IDE 관련 타입
export interface CodeExecution {
  language: string;
  code: string;
  input?: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
}

// 언어 옵션 타입
export interface LanguageOption {
  value: string;
  label: string;
  extension: string;
  monacoLanguage: string;
}

// 필터 관련 타입
export interface ProblemFilter {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  search?: string;
  page?: number;
  limit?: number;
}

// 컴포넌트 Props 타입
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 폼 관련 타입
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
