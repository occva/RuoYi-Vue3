<template>
  <div class="activities-page">
    <!-- 页面头部 Hero Section -->
    <header class="page-header">
      <div class="header-content container">
        <div class="header-text">
          <h1 class="page-title">校园<span class="highlight">活动</span>中心</h1>
          <p class="page-subtitle">探索丰富多彩的校园生活，发现不一样的精彩</p>
        </div>
        
        <div class="hero-search">
          <div class="search-container">
            <el-icon class="search-icon"><Search /></el-icon>
            <input 
              v-model="queryParams.activityTitle"
              type="text" 
              placeholder="搜索你感兴趣的活动..."
              class="search-input"
              @keyup.enter="handleQuery"
            />
            <button class="search-button" @click="handleQuery">
              <el-icon><Search /></el-icon>
              <span>搜索</span>
            </button>
          </div>
        </div>
      </div>
      <div class="header-bg-decoration">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>
    </header>

    <div class="main-content container">
      <!-- 筛选工具栏 -->
      <div class="toolbar">
        <div class="status-filters">
          <div 
            v-for="status in statusOptions" 
            :key="status.value"
            class="filter-pill"
            :class="{ active: queryParams.status === status.value }"
            @click="handleStatusChange(status.value)"
          >
            {{ status.label }}
          </div>
        </div>

        <div class="active-filters" v-if="queryParams.status">
          <el-button link type="primary" @click="clearFilters">清除所有筛选</el-button>
        </div>
      </div>

      <!-- 活动列表 -->
      <div v-loading="loading" class="result-section">
        <div v-if="activityList.length > 0" class="activity-grid">
          <ActivityCard 
            v-for="(activity, index) in activityList" 
            :key="activity.activityId" 
            :activity="activity" 
            class="animate-in"
            :style="{ '--delay': index * 0.05 + 's' }"
          />
        </div>
        
        <div v-else class="no-results">
          <el-empty description="暂无相关活动">
            <template #extra>
              <el-button type="primary" plain @click="clearFilters">查看全部活动</el-button>
            </template>
          </el-empty>
        </div>

        <!-- Pagination -->
        <Pagination
          v-show="total > queryParams.pageSize"
          layout="prev, pager, next"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { listActivities } from '@/api/user/activity'
import ActivityCard from './components/ActivityCard.vue'

const loading = ref(false)
const total = ref(0)
const activityList = ref([])

const statusOptions = [
  { label: '全部活动', value: undefined },
  { label: '近期开始', value: '0' },
  { label: '正在进行', value: '1' },
  { label: '往期回顾', value: '2' }
]

const queryParams = ref({
  pageNum: 1,
  pageSize: 9,
  activityTitle: undefined,
  status: undefined
})

onMounted(() => {
  getList()
})

const getList = () => {
  loading.value = true
  listActivities(queryParams.value).then(response => {
    activityList.value = response.rows || []
    total.value = Number(response.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const handleStatusChange = (status) => {
  queryParams.value.status = status
  handleQuery()
}

const clearFilters = () => {
  queryParams.value.status = undefined
  queryParams.value.activityTitle = ''
  handleQuery()
}
</script>

<style lang="scss" scoped>
.activities-page {
  --hero-header-overlap: 72px;
  position: relative;
  isolation: isolate;
  overflow-x: clip;
  min-height: 100vh;
  padding-bottom: 5rem;
  background: linear-gradient(180deg, #f3fbf7 0%, #f7fcfa 42%, #ffffff 100%);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Page Header / Hero Section */
.page-header {
  position: relative;
  background:
    radial-gradient(circle at 14% 16%, rgba(16, 185, 129, 0.24), transparent 46%),
    radial-gradient(circle at 84% 12%, rgba(251, 191, 36, 0.16), transparent 42%),
    linear-gradient(120deg, #ecfdf5 0%, #f0fdf4 40%, #fffbeb 100%);
  color: #0b1224;
  margin-top: calc(-1 * var(--hero-header-overlap));
  padding: calc(1rem + var(--hero-header-overlap)) 0 8rem;
  overflow: hidden;
  text-align: center;
  margin-bottom: -6rem; /* Overlap with content */

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background-image: repeating-linear-gradient(118deg, rgba(16, 185, 129, 0.09) 0 14px, transparent 14px 34px);
    opacity: 0.3;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.46), transparent 88%);
  }

  &::after {
    inset: auto 0 -1px;
    height: 124px;
    background: linear-gradient(180deg, rgba(247, 252, 250, 0), #f7fcfa 70%, #f7fcfa 100%);
  }
}

.header-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: #0b1224;
  letter-spacing: -0.025em;
  
  .highlight {
    background: linear-gradient(120deg, #34d399 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: #3b4760;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.hero-search {
  width: 100%;
  max-width: 700px;
  position: relative;
  
  .search-container {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.84);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(167, 243, 208, 0.85);
    border-radius: 20px;
    padding: 0.5rem;
    padding-left: 1.5rem;
    box-shadow: 0 24px 56px -40px rgba(4, 120, 87, 0.62), 0 8px 24px -16px rgba(5, 150, 105, 0.32);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:focus-within {
      background: rgba(255, 255, 255, 0.94);
      border-color: rgba(16, 185, 129, 0.46);
      transform: translateY(-2px);
      box-shadow: 0 30px 60px -40px rgba(4, 120, 87, 0.88);
    }
  }

  .search-icon {
    font-size: 1.25rem;
    color: #7f90af;
    margin-right: 1rem;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #1f2f4d;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 0.75rem 0;
    
    &::placeholder {
      color: #8da0be;
    }
  }

  .search-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #10b981;
    color: white;
    border: none;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    
    &:hover {
      background: #059669;
      transform: scale(1.02);
      box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.header-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  filter: blur(22px);
  opacity: 0.5;
}

.blob-1 {
  width: 360px;
  height: 230px;
  right: -70px;
  top: -100px;
  border-radius: 58% 42% 38% 62% / 54% 35% 65% 46%;
  background: linear-gradient(140deg, rgba(16, 185, 129, 0.3), rgba(20, 184, 166, 0.08));
}

.blob-2 {
  width: 280px;
  height: 180px;
  left: 6%;
  bottom: 44px;
  border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%;
  background: linear-gradient(120deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0));
}

/* Main Content Area */
.main-content {
  position: relative;
  z-index: 20;
}

.toolbar {
  background: white;
  padding: 0.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.status-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 2px;
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  
  .filter-pill {
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    
    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
    
    &.active {
      background: #ecfdf5;
      color: #059669;
    }
  }
}

/* Activity Grid */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.animate-in {
  animation: slideInUp 0.6s ease forwards;
  opacity: 0;
  animation-delay: var(--delay, 0s);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-results {
  padding: 6rem 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 4rem;
}

/* Custom Element Plus Pagination Styling */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #10b981;
}

@media (max-width: 768px) {
  .activities-page {
    --hero-header-overlap: 64px;
  }

  .blob-1 {
    width: 250px;
    height: 170px;
    right: -74px;
    top: -56px;
  }

  .blob-2 {
    width: 210px;
    height: 150px;
    left: -26px;
    bottom: 28px;
  }
}
</style>
