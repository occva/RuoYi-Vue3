<template>
  <div class="club-list-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">探索所有社团</h1>
        <p class="page-subtitle">找到属于你的圈子，发现无限可能</p>
      </div>
    </header>

    <div class="container">
      <!-- 搜索和筛选栏 -->
      <div class="filter-bar">
        <div class="search-wrapper">
          <el-input
            v-model="queryParams.clubName"
            placeholder="搜索社团名称..."
            :prefix-icon="Search"
            clearable
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
        </div>

        <div class="category-filters">
          <el-button
            v-for="cat in categories"
            :key="cat.id"
            :type="queryParams.categoryId === cat.id ? 'primary' : 'default'"
            round
            @click="handleCategoryChange(cat.id)"
          >
            {{ cat.label }}
          </el-button>
        </div>
      </div>

      <!-- 结果网格 -->
      <div v-loading="loading" class="result-section">
        <div v-if="clubList.length > 0" class="club-grid">
          <ClubCard v-for="club in clubList" :key="club.clubId" :club="club" />
        </div>
        <div v-else class="no-results">
          <el-empty description="没有找到匹配的社团">
            <el-button type="primary" @click="clearFilters">清除筛选</el-button>
          </el-empty>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-show="total > 0">
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
    // Check structure, assuming standard R<TableDataInfo> or similar
    // response.rows or response.data if it's a list.
    // Usually list endpoint returns rows and total.
    if (response.rows) {
        clubList.value = response.rows
        total.value = response.total
    } else if (Array.isArray(response.data)) {
        // Fallback if API returns just array (no pagination)
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

const clearFilters = () => {
  queryParams.value.categoryId = undefined
  queryParams.value.clubName = ''
  handleQuery()
}
</script>

<style lang="scss" scoped>
.club-list-page {
  padding-bottom: 4rem;
  min-height: 80vh;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.no-results {
  text-align: center;
  padding: 4rem 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}
</style>
