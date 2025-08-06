# 문제집(Workbook) 기능 구현 문서

## 📋 개요
OnlineJudge 시스템에 문제집(Workbook) 기능을 추가하여, 관리자가 문제들을 그룹화하여 관리할 수 있도록 구현했습니다.

## 🎯 구현 목표
1. **문제집 데이터베이스 설계 및 구현**
2. **문제집 CRUD 기능 구현**
3. **문제 생성 시 문제집 선택 기능 추가**
4. **관리자 페이지에 문제집 관리 메뉴 추가**

## 🗄️ 데이터베이스 설계

### Workbook 모델
```python
# OnlineJudge/workbook/models.py
class Workbook(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, db_column='created_by_id')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workbook"
        ordering = ('-created_at',)
```

### Problem 모델 수정
```python
# OnlineJudge/problem/models.py
class Problem(models.Model):
    # ... 기존 필드들 ...
    workbook = models.ForeignKey('workbook.Workbook', on_delete=models.SET_NULL, null=True, blank=True)
```

## 🔧 백엔드 구현

### 1. Django 앱 설정
```python
# OnlineJudge/oj/settings.py
LOCAL_APPS = [
    # ... 기존 앱들 ...
    'workbook',
]
```

### 2. URL 설정
```python
# OnlineJudge/oj/urls.py
urlpatterns = [
    # ... 기존 URL 패턴들 ...
    url(r"^api/admin/", include("workbook.urls")),
]

# OnlineJudge/workbook/urls.py
from django.conf.urls import url
from .views import WorkbookAPI

urlpatterns = [
    url(r'^workbook$', WorkbookAPI.as_view(), name='workbook_api'),
]
```

### 3. API 구현
```python
# OnlineJudge/workbook/views.py
class WorkbookAPI(APIView):
    http_method_names = ['get', 'post', 'put', 'delete']
    
    def get(self, request):
        """문제집 목록 조회 또는 특정 문제집 조회"""
        workbook_id = request.GET.get('id')
        
        if workbook_id:
            # 특정 문제집 조회
            try:
                workbook = Workbook.objects.get(id=workbook_id)
                serializer = WorkbookSerializer(workbook, context={'request': request})
                return JsonResponse({
                    'error': None,
                    'data': serializer.data
                })
            except Workbook.DoesNotExist:
                return JsonResponse({
                    'error': 'error',
                    'data': 'Workbook not found'
                }, status=404)
        else:
            # 문제집 목록 조회 (페이징, 검색 지원)
            # ... 구현 내용 ...
    
    def post(self, request):
        """문제집 생성"""
        # ... 구현 내용 ...
    
    def put(self, request):
        """문제집 수정"""
        # ... 구현 내용 ...
    
    def delete(self, request):
        """문제집 삭제"""
        # ... 구현 내용 ...
```

### 4. Serializer 구현
```python
# OnlineJudge/workbook/serializers.py
class WorkbookSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Workbook
        fields = [
            'id', 'title', 'description', 'category', 
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_created_by(self, obj):
        if obj.created_by:
            return obj.created_by.username
        return None
```

### 5. Admin 설정
```python
# OnlineJudge/workbook/admin.py
@admin.register(Workbook)
class WorkbookAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_by_id', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'description', 'category')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('title', 'description', 'category')
        }),
        ('생성자', {
            'fields': ('created_by_id',)
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # 새로 생성하는 경우
            obj.created_by_id = request.user
        super().save_model(request, obj, form, change)
```

## 🎨 프론트엔드 구현

### 1. API 클라이언트
```javascript
// OnlineJudgeFE/src/pages/admin/api.js
export default {
  // ... 기존 API 메서드들 ...
  
  // 문제집 관련 API
  getWorkbookList (offset, limit, keyword) {
    let params = {paging: true, offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    return ajax('admin/workbook', 'get', {
      params: params
    })
  },
  getWorkbook (id) {
    return ajax('admin/workbook', 'get', {
      params: { id }
    })
  },
  createWorkbook (data) {
    return ajax('admin/workbook', 'post', {
      data
    })
  },
  editWorkbook (data) {
    return ajax('admin/workbook', 'put', {
      data
    })
  },
  deleteWorkbook (id) {
    return ajax('admin/workbook', 'delete', {
      params: { id }
    })
  }
}
```

### 2. 사이드바 메뉴 추가
```vue
<!-- OnlineJudgeFE/src/pages/admin/components/SideMenu.vue -->
<el-submenu index="workbook" v-if="hasProblemPermission">
  <template slot="title"><i class="el-icon-fa-book"></i>문제집</template>
  <el-menu-item index="/workbooks">문제집 목록</el-menu-item>
  <el-menu-item index="/workbook/create">문제집 생성</el-menu-item>
</el-submenu>
```

### 3. 문제집 목록 페이지
```vue
<!-- OnlineJudgeFE/src/pages/admin/views/workbook/WorkbookList.vue -->
<template>
  <div class="workbook-list">
    <div class="header">
      <h2>문제집 목록</h2>
      <el-button type="primary" @click="$router.push('/workbook/create')">
        문제집 생성
      </el-button>
    </div>
    
    <el-table :data="workbooks" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="제목"></el-table-column>
      <el-table-column prop="category" label="카테고리"></el-table-column>
      <el-table-column prop="created_by" label="생성자"></el-table-column>
      <el-table-column prop="created_at" label="생성일"></el-table-column>
      <el-table-column label="작업" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="editWorkbook(scope.row.id)">수정</el-button>
          <el-button size="mini" type="danger" @click="deleteWorkbook(scope.row.id)">삭제</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

### 4. 문제집 생성 페이지
```vue
<!-- OnlineJudgeFE/src/pages/admin/views/workbook/WorkbookCreate.vue -->
<template>
  <div class="workbook-create">
    <div class="header">
      <h2>문제집 생성</h2>
    </div>

    <el-form ref="form" :model="workbook" :rules="rules" label-width="120px">
      <el-form-item label="제목" prop="title">
        <el-input v-model="workbook.title" placeholder="문제집 제목을 입력하세요"></el-input>
      </el-form-item>

      <el-form-item label="설명" prop="description">
        <el-input
          type="textarea"
          :rows="4"
          v-model="workbook.description"
          placeholder="문제집 설명을 입력하세요">
        </el-input>
      </el-form-item>

      <el-form-item label="카테고리" prop="category">
        <el-input v-model="workbook.category" placeholder="카테고리를 입력하세요"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="createWorkbook" :loading="loading">생성</el-button>
        <el-button @click="$router.push('/workbooks')">취소</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

### 5. 문제집 수정 페이지
```vue
<!-- OnlineJudgeFE/src/pages/admin/views/workbook/WorkbookEdit.vue -->
<template>
  <div class="workbook-edit">
    <div class="header">
      <h2>문제집 수정</h2>
    </div>

    <el-form ref="form" :model="workbook" :rules="rules" label-width="120px">
      <el-form-item label="제목" prop="title">
        <el-input v-model="workbook.title" placeholder="문제집 제목을 입력하세요"></el-input>
      </el-form-item>

      <el-form-item label="설명" prop="description">
        <el-input
          type="textarea"
          :rows="4"
          v-model="workbook.description"
          placeholder="문제집 설명을 입력하세요">
        </el-input>
      </el-form-item>

      <el-form-item label="카테고리" prop="category">
        <el-input v-model="workbook.category" placeholder="카테고리를 입력하세요"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="updateWorkbook" :loading="loading">수정</el-button>
        <el-button @click="$router.push('/workbooks')">취소</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

### 6. 문제 생성 페이지 수정
```vue
<!-- OnlineJudgeFE/src/pages/admin/views/problem/Problem.vue -->
<template>
  <!-- ... 기존 폼 필드들 ... -->
  <el-form-item label="문제집" prop="workbook">
    <el-select v-model="problem.workbook" placeholder="문제집을 선택하세요" clearable>
      <el-option
        v-for="workbook in workbooks"
        :key="workbook.id"
        :label="workbook.title"
        :value="workbook.id">
      </el-option>
    </el-select>
  </el-form-item>
  <!-- ... 기존 폼 필드들 ... -->
</template>

<script>
export default {
  data() {
    return {
      // ... 기존 데이터 ...
      workbooks: [],
    }
  },
  mounted() {
    this.getWorkbooks()
  },
  methods: {
    getWorkbooks() {
      api.getWorkbookList(0, 1000).then(res => {
        this.workbooks = res.data.data.results
      })
    }
  }
}
</script>
```

### 7. 라우터 설정
```javascript
// OnlineJudgeFE/src/pages/admin/router.js
import WorkbookList from './views/workbook/WorkbookList.vue'
import WorkbookCreate from './views/workbook/WorkbookCreate.vue'
import WorkbookEdit from './views/workbook/WorkbookEdit.vue'

export default [
  // ... 기존 라우트들 ...
  {
    path: '/workbooks',
    name: 'workbook-list',
    component: WorkbookList
  },
  {
    path: '/workbook/create',
    name: 'workbook-create',
    component: WorkbookCreate
  },
  {
    path: '/workbook/edit/:id',
    name: 'workbook-edit',
    component: WorkbookEdit
  }
]
```

## 🗃️ 데이터베이스 마이그레이션

### 1. 마이그레이션 생성
```bash
docker exec onlinejudge-oj-backend-1 python manage.py makemigrations workbook
docker exec onlinejudge-oj-backend-1 python manage.py makemigrations problem
```

### 2. 마이그레이션 적용
```bash
docker exec onlinejudge-oj-backend-1 python manage.py migrate
```

## 🐛 주요 문제 해결 과정

### 1. Docker 볼륨 마운트 문제
**문제:** 로컬 코드 변경이 컨테이너에 반영되지 않음
**해결:** `docker-compose.yml`에 볼륨 마운트 추가
```yaml
volumes:
  - .:/app
```

### 2. created_by_id null constraint 문제
**문제:** 문제집 생성 시 `created_by_id`가 null로 저장됨
**해결:** 백엔드에서 직접 `created_by_id` 설정
```python
workbook = Workbook.objects.create(
    title=data.get('title'),
    description=data.get('description'),
    category=data.get('category'),
    created_by_id=request.user.id  # 직접 설정
)
```

### 3. PUT 요청 404 에러
**문제:** 문제집 수정 시 PUT 요청이 404 에러 발생
**해결:** URL 패턴을 Django 3.2 호환 방식으로 수정
```python
# path 대신 url 패턴 사용
url(r'^workbook$', WorkbookAPI.as_view(), name='workbook_api'),
```

### 4. API 응답 형식 불일치
**문제:** 백엔드 응답 형식이 프론트엔드 기대 형식과 다름
**해결:** 모든 API 응답을 통일된 형식으로 변경
```python
return JsonResponse({
    'error': None,
    'data': serializer.data
})
```

### 5. getWorkbook API 문제
**문제:** 특정 문제집 조회 시 잘못된 데이터 구조 반환
**해결:** `id` 파라미터 처리 로직 추가
```python
workbook_id = request.GET.get('id')
if workbook_id:
    # 특정 문제집 조회
    workbook = Workbook.objects.get(id=workbook_id)
    return JsonResponse({
        'error': None,
        'data': serializer.data
    })
```

## ✅ 최종 기능 목록

### 백엔드 기능
- [x] Workbook 모델 생성 및 마이그레이션
- [x] Problem 모델에 workbook 필드 추가
- [x] Workbook CRUD API 구현
- [x] Django Admin 설정
- [x] Serializer 구현

### 프론트엔드 기능
- [x] 문제집 목록 페이지
- [x] 문제집 생성 페이지
- [x] 문제집 수정 페이지
- [x] 문제집 삭제 기능
- [x] 사이드바 메뉴 추가
- [x] 문제 생성 시 문제집 선택 기능
- [x] 라우터 설정

### 통합 기능
- [x] Docker 환경에서 정상 작동
- [x] 데이터베이스 마이그레이션 완료
- [x] API 응답 형식 통일
- [x] 에러 처리 및 사용자 피드백

## 🚀 사용 방법

### 1. 문제집 생성
1. 관리자 페이지 접속
2. 사이드바에서 "문제집" → "문제집 생성" 클릭
3. 제목, 설명, 카테고리 입력
4. "생성" 버튼 클릭

### 2. 문제집 관리
1. 사이드바에서 "문제집" → "문제집 목록" 클릭
2. 문제집 목록에서 "수정" 또는 "삭제" 버튼 사용

### 3. 문제에 문제집 할당
1. 문제 생성 페이지에서 "문제집" 드롭다운 선택
2. 원하는 문제집 선택 후 문제 생성

## 📝 참고사항

- 문제집은 선택사항이며, 문제를 문제집에 할당하지 않아도 됩니다
- 문제집 삭제 시 해당 문제집에 할당된 문제들은 문제집 연결이 해제됩니다
- 생성자는 자동으로 현재 로그인한 사용자로 설정됩니다 