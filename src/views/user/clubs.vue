<template>
  <div class="club-list-page">
    <!-- 页面头部 Hero Section -->
    <header class="page-header">
      <div class="header-content container">
        <div class="header-text">
          <h1 class="page-title">探索校园<span class="highlight">社团</span></h1>
          <p class="page-subtitle">加入一个充满活力的社区，开启你的精彩校园生活</p>
        </div>
        
        <div class="hero-search">
          <div class="search-container">
            <el-icon class="search-icon"><Search /></el-icon>
            <input 
              v-model="queryParams.clubName"
              type="text" 
              placeholder="搜索你感兴趣的社团名称..."
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
        <div class="category-tabs">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            class="tab-item"
            :class="{ active: queryParams.categoryId === cat.id }"
            @click="handleCategoryChange(cat.id)"
          >
            {{ cat.label }}
          </div>
        </div>
        
        <div class="active-filters" v-if="queryParams.categoryId || queryParams.clubName">
          <el-tag 
            v-if="queryParams.categoryId" 
            closable 
            @close="clearCategory"
            round
            effect="plain"
          >
            分类: {{ categories.find(c => c.id === queryParams.categoryId)?.label }}
          </el-tag>
          <el-button v-if="queryParams.categoryId || queryParams.clubName" link type="primary" @click="clearFilters">
            清除所有筛选
          </el-button>
        </div>
      </div>

      <!-- 结果网格 -->
      <div v-loading="loading" class="result-section">
        <div v-if="clubList.length > 0" class="club-grid">
          <ClubCard 
            v-for="(club, index) in clubList" 
            :key="club.clubId" 
            :club="club" 
            class="animate-in"
            :style="{ '--delay': index * 0.05 + 's' }"
          />
        </div>
        
        <div v-else class="no-results">
          <el-empty description="没有找到匹配的社团">
            <template #extra>
              <el-button type="primary" plain @click="clearFilters">查看全部社团</el-button>
            </template>
          </el-empty>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-show="total > queryParams.pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            @current-change="getList"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { listClubs } from '@/api/user/club'
import { listCategories } from '@/api/user/category'
import ClubCard from './components/ClubCard.vue'

const loading = ref(false)
const clubList = ref([])
const total = ref(0)
const categories = ref([
  { id: undefined, label: '全部' }
])

const queryParams = ref({
  pageNum: 1,
  pageSize: 12,
  clubName: undefined,
  categoryId: undefined
})

onMounted(() => {
  getList()
  getCategories()
})

const getList = () => {
  loading.value = true
  listClubs(queryParams.value).then(response => {
    if (response.rows) {
        clubList.value = response.rows
        total.value = response.total
    } else if (Array.isArray(response.data)) {
        clubList.value = response.data
        total.value = response.data.length
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
    clubList.value = []
  })
}

const getCategories = () => {
    listCategories().then(response => {
        const apiCategories = response.data.map(c => ({
            id: c.categoryId,
            label: c.categoryName
        }))
        categories.value = [{ id: undefined, label: '全部' }, ...apiCategories]
    })
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const handleCategoryChange = (id) => {
  queryParams.value.categoryId = id
  handleQuery()
}

const clearCategory = () => {
  queryParams.value.categoryId = undefined
  handleQuery()
}

const clearFilters = () => {
  queryParams.value.categoryId = undefined
  queryParams.value.clubName = ''
  handleQuery()
}
</script>

<style lang="scss" scoped>
.club-list-page {
  padding-bottom: 5rem;
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Page Header / Hero Section */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem 0 8rem;
  overflow: hidden;
  text-align: center;
  margin-bottom: -6rem; /* Overlap with content */
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
  letter-spacing: -0.025em;
  
  .highlight {
    background: linear-gradient(120deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  opacity: 0.8;
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
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0.5rem;
    padding-left: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:focus-within {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.3);
    }
  }

  .search-icon {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    margin-right: 1rem;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 0.75rem 0;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .search-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    &:hover {
      background: #2563eb;
      transform: scale(1.02);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
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
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -100px;
  right: -50px;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -50px;
  left: -50px;
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

.category-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 2px;
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  
  .tab-item {
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
      background: #eff6ff;
      color: #3b82f6;
    }
  }
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Grid Layout */
.club-grid {
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
  background-color: #3b82f6;
}
</style>
