import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import {
  adminService,
  UpdateUserPayload,
} from '../services/adminService';
import { DEPARTMENTS } from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import {
  AdminUser,
} from '../types';
import { OrganizationAdminSection } from '../components/admin/organization/OrganizationAdminSection';
import { BulkProblemManager } from '../components/admin/BulkProblemManager';
import { ProblemCreateSection } from '../components/admin/ProblemCreateSection';
import { ProblemEditSection } from '../components/admin/ProblemEditSection';
import { ServerAdminSection } from '../components/admin/ServerAdminSection';
import { WorkbookCreateSection } from '../components/admin/WorkbookCreateSection';
import { WorkbookManageSection } from '../components/admin/WorkbookManageSection';
import { ContestCreateSection } from '../components/admin/ContestCreateSection';
import { ContestEditSection } from '../components/admin/ContestEditSection';
const USER_PAGE_SIZE = 20;

const mapAdminUserToForm = (user: AdminUser): UpdateUserPayload => ({
  id: user.id,
  username: user.username ?? '',
  real_name: user.real_name ?? '',
  email: user.email ?? '',
  password: '',
  admin_type: user.admin_type ?? 'Regular User',
  problem_permission: user.problem_permission ?? 'None',
  two_factor_auth: Boolean(user.two_factor_auth),
  open_api: Boolean(user.open_api),
  is_disabled: Boolean(user.is_disabled),
});

type AdminSection =
  | 'problem'
  | 'problem-edit'
  | 'bulk'
  | 'contest'
  | 'contest-edit'
  | 'workbook'
  | 'workbook-manage'
  | 'user'
  | 'server'
  | 'organization';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const isAdmin = useMemo(() => {
    const flag = user?.admin_type;
    return flag === 'Admin' || flag === 'Super Admin';
  }, [user?.admin_type]);

  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListError, setUserListError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const userSearchTimerRef = useRef<number | null>(null);
  const userSearchKeywordRef = useRef('');
  const selectedUserIdRef = useRef<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<UpdateUserPayload | null>(null);
  const [userFormMessage, setUserFormMessage] = useState<{ success?: string; error?: string }>({});
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userDeleteLoading, setUserDeleteLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msUserInfo, setMsUserInfo] = useState<{
    user_id: number;
    name: string;
    student_id: string;
    major_id: number;
  } | null>(null);

  const [activeSection, setActiveSection] = useState<AdminSection>('server');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('server');

  const fetchUsers = useCallback(
    async (page: number = 1, keyword?: string) => {
      const normalizedKeyword = typeof keyword === 'string' ? keyword : userSearchKeywordRef.current;
      setUserListError(null);
      setUserListLoading(true);
      try {
        const response = await adminService.getUsers({
          page,
          limit: USER_PAGE_SIZE,
          keyword: normalizedKeyword.trim().length > 0 ? normalizedKeyword.trim() : undefined,
        });
        setUserList(response.results);
        setUserTotal(response.total);
        setUserPage(page);

        if (response.results.length === 0) {
          setSelectedUser(null);
          selectedUserIdRef.current = null;
        } else {
          // Do not auto-select user on list fetch to avoid opening modal automatically
          // const currentId = selectedUserIdRef.current;
          // const next = response.results.find((item) => item.id === currentId) ?? response.results[0];
          // setSelectedUser(next);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '사용자 목록을 불러오지 못했습니다.';
        setUserListError(message);
        setUserList([]);
        setSelectedUser(null);
        selectedUserIdRef.current = null;
      } finally {
        setUserListLoading(false);
      }
    },
    [],
  );

  const handleSelectUser = async (user: AdminUser) => {
    selectedUserIdRef.current = user.id;
    setSelectedUser(user);
    setUserFormMessage({});
    setIsModalOpen(true);

    try {
      const msData = await adminService.getUserDetailFromMS(user.id);
      setMsUserInfo(msData);
    } catch (error) {
      console.error('Failed to fetch MS user info:', error);
      setMsUserInfo(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserForm(null);
    setMsUserInfo(null);
  };

  const handleUserSearchInputChange = (value: string) => {
    setUserSearchKeyword(value);
    userSearchKeywordRef.current = value;
    if (userSearchTimerRef.current) {
      window.clearTimeout(userSearchTimerRef.current);
    }
    userSearchTimerRef.current = window.setTimeout(() => {
      fetchUsers(1, value);
    }, 300);
  };

  const handleUserSearchSubmit = () => {
    if (userSearchTimerRef.current) {
      window.clearTimeout(userSearchTimerRef.current);
      userSearchTimerRef.current = null;
    }
    fetchUsers(1, userSearchKeywordRef.current);
  };

  const handleUserPageChange = (direction: 'prev' | 'next') => {
    const totalPages = Math.max(1, Math.ceil(userTotal / USER_PAGE_SIZE));
    let nextPage = userPage;
    if (direction === 'prev' && userPage > 1) {
      nextPage = userPage - 1;
    }
    if (direction === 'next' && userPage < totalPages) {
      nextPage = userPage + 1;
    }
    if (nextPage !== userPage) {
      fetchUsers(nextPage, userSearchKeywordRef.current);
    }
  };

  const handleUserFormChange = <K extends keyof UpdateUserPayload>(field: K, value: UpdateUserPayload[K]) => {
    setUserForm((prev) => {
      if (!prev) {
        return prev;
      }
      const next = { ...prev, [field]: value };
      setUserFormMessage({});
      return next;
    });
  };

  const handleUserUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userForm) {
      return;
    }

    const payload: UpdateUserPayload = {
      // Validation for real_name removed
      ...userForm,
      username: userForm.username.trim(),
      real_name: userForm.real_name?.trim() ?? '',
      email: userForm.email?.trim() ?? '',
      // Set default problem_permission based on admin_type if not present
      problem_permission: userForm.problem_permission || 'None',
      two_factor_auth: userForm.two_factor_auth ?? false,
      open_api: userForm.open_api ?? false,
    };

    // Auto-assign problem_permission based on admin_type rules
    if (payload.admin_type === 'Super Admin') {
      payload.problem_permission = 'All';
    } else if (payload.admin_type === 'Regular User') {
      payload.problem_permission = 'None';
    } else if (payload.admin_type === 'Admin' && payload.problem_permission === 'None') {
      // Default for Admin if not specified
      payload.problem_permission = 'Own';
    }

    if (!payload.username) {
      setUserFormMessage({ error: '사용자 이름을 입력하세요.' });
      return;
    }


    if (!payload.email) {
      setUserFormMessage({ error: '이메일을 입력하세요.' });
      return;
    }

    if (!payload.password || payload.password.trim().length === 0) {
      delete payload.password;
    } else {
      payload.password = payload.password.trim();
    }

    setUserFormLoading(true);
    setUserFormMessage({});
    try {
      const updated = await adminService.updateUser(payload);
      setSelectedUser(updated);
      setUserForm(mapAdminUserToForm(updated));
      selectedUserIdRef.current = updated.id;
      setUserList((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setUserFormMessage({ success: '사용자 정보를 수정했습니다.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '사용자 정보를 수정하지 못했습니다.';
      setUserFormMessage({ error: message });
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleUserDelete = async () => {
    if (!selectedUser) {
      return;
    }

    const confirmed = window.confirm(
      `${selectedUser.username} 사용자를 삭제하면 해당 사용자가 생성한 문제, 대회 등이 함께 삭제될 수 있습니다. 계속하시겠습니까?`,
    );
    if (!confirmed) {
      return;
    }

    const nextPage = userList.length <= 1 && userPage > 1 ? userPage - 1 : userPage;

    setUserDeleteLoading(true);
    try {
      await adminService.deleteUser(selectedUser.id);
      setUserFormMessage({ success: `${selectedUser.username} 사용자를 삭제했습니다.` });
      await fetchUsers(nextPage, userSearchKeywordRef.current);
    } catch (error) {
      const message = error instanceof Error ? error.message : '사용자를 삭제하지 못했습니다.';
      setUserFormMessage({ error: message });
    } finally {
      setUserDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUser) {
      setUserForm(null);
      selectedUserIdRef.current = null;
      return;
    }

    if (selectedUserIdRef.current !== selectedUser.id) {
      setUserFormMessage({});
    }

    setUserForm(mapAdminUserToForm(selectedUser));
    selectedUserIdRef.current = selectedUser.id;
  }, [selectedUser]);



  useEffect(() => {
    if (activeSection === 'user') {
      fetchUsers(1, userSearchKeywordRef.current);
    }
  }, [activeSection, fetchUsers]);

  useEffect(() => {
    return () => {
      if (userSearchTimerRef.current) {
        window.clearTimeout(userSearchTimerRef.current);
      }
    };
  }, []);



  const renderActiveSection = () => {
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

    switch (activeSection) {
      case 'organization':
        return <OrganizationAdminSection />;
      case 'server':
        return <ServerAdminSection />;

      case 'problem':
        return <ProblemCreateSection />;
      case 'bulk':
        return <BulkProblemManager />;
      case 'problem-edit':
        return <ProblemEditSection />;
      case 'contest':
        return <ContestCreateSection />;
      case 'contest-edit':
        return <ContestEditSection />;
      case 'user': {
        const totalPages = Math.max(1, Math.ceil(userTotal / USER_PAGE_SIZE));
        const canPrev = userPage > 1;
        const canNext = userPage < totalPages;

        return (
          <Card padding="lg">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
                <p className="text-sm text-gray-500">검색으로 계정을 찾고, 아래에서 권한과 상태를 수정하세요.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:flex-1">
                  <Input
                    type="search"
                    label="검색"
                    placeholder="아이디, 이름, 이메일"
                    value={userSearchKeyword}
                    onChange={(e) => handleUserSearchInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUserSearchSubmit();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleUserSearchSubmit}
                  className="w-full sm:w-auto bg-[#113F67] text-white hover:bg-[#34699A] focus:ring-[#58A0C8]"
                >
                  검색
                </Button>
              </div>

              <section className="space-y-4">
                {/* User List Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {userListLoading ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              사용자 목록을 불러오는 중입니다...
                            </td>
                          </tr>
                        ) : userListError ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-600">{userListError}</td>
                          </tr>
                        ) : userList.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => handleSelectUser(item)}
                            className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedUser?.id === item.id ? 'bg-blue-50' : ''
                              }`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.username}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.real_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.admin_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_disabled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                  }`}
                              >
                                {item.is_disabled ? '비활성' : '활성'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {userList.length === 0 && !userListLoading && !userListError && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              사용자가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        전체 <span className="font-medium">{userTotal}</span>명 · 현재 {userList.length}명 표시 중
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserPageChange('prev')}
                          disabled={userPage === 1}
                        >
                          이전
                        </Button>
                        <span className="flex items-center px-2 text-sm text-gray-700">
                          {userPage} / {Math.max(1, Math.ceil(userTotal / USER_PAGE_SIZE))}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserPageChange('next')}
                          disabled={userPage >= Math.ceil(userTotal / USER_PAGE_SIZE)}
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Detail Modal */}
                {isModalOpen && selectedUser && userForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" aria-hidden="true" onClick={handleCloseModal}></div>

                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                      <div className="inline-block w-full overflow-hidden text-left align-bottom transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8 sm:align-middle sm:max-w-2xl">
                        <div className="px-4 pt-5 pb-4 bg-white sm:p-8">
                          <div className="sm:flex sm:items-start">
                            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                              <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-6" id="modal-title">
                                계정 상세 정보
                              </h3>

                              {userFormMessage.error && (
                                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                  {userFormMessage.error}
                                </div>
                              )}
                              {userFormMessage.success && (
                                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
                                  {userFormMessage.success}
                                </div>
                              )}

                              <div className="grid gap-6 sm:grid-cols-2">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-900 border-b pb-2">기본 정보</h4>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                                    <div className="text-sm font-bold text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {selectedUser.username}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                                    <div className="text-sm text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {selectedUser.email}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">마지막 로그인</label>
                                    <div className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : '-'}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Extra Info (MS Data) */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-900 border-b pb-2">상세 정보 (MS)</h4>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                    <div className="text-sm text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {msUserInfo?.name || '-'}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
                                    <div className="text-sm text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {msUserInfo?.student_id || '-'}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">학부 (전공)</label>
                                    <div className="text-sm text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                                      {msUserInfo?.major_id !== undefined ? DEPARTMENTS[msUserInfo.major_id] : '-'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 space-y-4">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">권한 및 설정</h4>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">사용자 유형</label>
                                    <select
                                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#58A0C8]"
                                      value={userForm.admin_type}
                                      onChange={(e) => handleUserFormChange('admin_type', e.target.value)}
                                    >
                                      <option value="Regular User">Regular User</option>
                                      <option value="Admin">Admin</option>
                                      <option value="Super Admin">Super Admin</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="isDisabled"
                                    checked={userForm.is_disabled}
                                    onChange={(e) => handleUserFormChange('is_disabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#58A0C8] focus:ring-[#58A0C8]"
                                  />
                                  <label htmlFor="isDisabled" className="text-sm text-gray-700">
                                    계정 비활성화
                                  </label>
                                </div>
                              </div>

                              <div className="mt-8 flex justify-between pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={handleUserDelete}
                                  disabled={userFormLoading || userDeleteLoading}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  {userDeleteLoading ? '삭제 중...' : '사용자 삭제'}
                                </Button>
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={handleCloseModal}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    variant="primary"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleUserUpdate(e as any);
                                    }}
                                    disabled={userFormLoading}
                                  >
                                    {userFormLoading ? '저장 중...' : '정보 저장'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </Card>
        );
      }
      case 'workbook-manage':
        return <WorkbookManageSection />;
      case 'workbook':
      default:
        return <WorkbookCreateSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 도구</h1>
          <p className="mt-2 text-sm text-gray-600">좌측 메뉴에서 원하는 기능을 선택하면 관련 폼이 표시됩니다.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 flex-none space-y-3">
            {/* 서버 관리 (단일 메뉴) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${activeSection === 'server' ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'server';
                  setExpandedCategory(isExpanded ? null : 'server');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none border-b border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${activeSection === 'server' ? 'text-[#113F67]' : 'text-gray-900'}`}>서버 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'server' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">채점 서버와 서비스 상태 모니터링</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'server' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('server')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'server' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    서버 대시보드
                  </button>
                </div>
              </div>
            </div>

            {/* 문제 관리 (아코디언) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${['problem', 'problem-edit', 'bulk'].includes(activeSection) ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'problem';
                  setExpandedCategory(isExpanded ? null : 'problem');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none border-b border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${['problem', 'problem-edit', 'bulk'].includes(activeSection) ? 'text-[#113F67]' : 'text-gray-900'}`}>문제 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'problem' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">문제 등록, 수정 및 일괄 관리</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'problem' ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('problem')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'problem' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    문제 등록
                  </button>
                  <button
                    onClick={() => setActiveSection('problem-edit')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'problem-edit' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    문제 수정
                  </button>
                  <button
                    onClick={() => setActiveSection('bulk')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'bulk' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    문제 일괄 관리
                  </button>
                </div>
              </div>
            </div>

            {/* 대회 관리 (아코디언) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${['contest', 'contest-edit'].includes(activeSection) ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'contest';
                  setExpandedCategory(isExpanded ? null : 'contest');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${['contest', 'contest-edit'].includes(activeSection) ? 'text-[#113F67]' : 'text-gray-900'}`}>대회 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'contest' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">대회 생성 및 설정 수정</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'contest' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('contest')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'contest' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    대회 등록
                  </button>
                  <button
                    onClick={() => setActiveSection('contest-edit')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'contest-edit' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    대회 수정
                  </button>
                </div>
              </div>
            </div>

            {/* 문제집 관리 (아코디언) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${['workbook', 'workbook-manage'].includes(activeSection) ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'workbook';
                  setExpandedCategory(isExpanded ? null : 'workbook');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${['workbook', 'workbook-manage'].includes(activeSection) ? 'text-[#113F67]' : 'text-gray-900'}`}>문제집 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'workbook' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">문제집 구성 및 관리</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'workbook' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('workbook')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'workbook' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    문제집 등록
                  </button>
                  <button
                    onClick={() => setActiveSection('workbook-manage')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'workbook-manage' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    문제집 수정
                  </button>
                </div>
              </div>
            </div>

            {/* 사용자 관리 (단일) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${activeSection === 'user' ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'user';
                  setExpandedCategory(isExpanded ? null : 'user');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none border-b border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${activeSection === 'user' ? 'text-[#113F67]' : 'text-gray-900'}`}>사용자 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'user' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">사용자 권한 및 계정 관리</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'user' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('user')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'user' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    사용자 목록
                  </button>
                </div>
              </div>
            </div>

            {/* 조직 관리 (단일) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${activeSection === 'organization' ? 'border-[#113F67] bg-white ring-1 ring-[#113F67]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <button
                onClick={() => {
                  const isExpanded = expandedCategory === 'organization';
                  setExpandedCategory(isExpanded ? null : 'organization');
                }}
                className="w-full px-4 py-3 text-left focus:outline-none border-b border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${activeSection === 'organization' ? 'text-[#113F67]' : 'text-gray-900'}`}>조직 관리</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedCategory === 'organization' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-gray-500">조직 및 구성원 관리</div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategory === 'organization' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 px-2 py-2 space-y-1 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSection('organization')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'organization' ? 'bg-[#113F67] text-white font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    조직 목록
                  </button>
                </div>
              </div>
            </div>
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
