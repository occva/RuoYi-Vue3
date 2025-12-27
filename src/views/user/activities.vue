<template>
  <div class="activities-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">校园活动</h1>
        <p class="page-subtitle">探索丰富多彩的校园生活</p>
      </div>
    </header>

    <div class="container">
      <div class="filter-bar">
        <el-input
          v-model="queryParams.activityTitle"
          placeholder="搜索活动..."
          :prefix-icon="Search"
          clearable
          @clear="handleQuery"
          @keyup.enter="handleQuery"
          class="search-input"
        />
        <el-select v-model="queryParams.status" placeholder="活动状态" clearable @change="handleQuery">
          <el-option label="即将开始" value="0" />
          <el-option label="进行中" value="1" />
          <el-option label="已结束" value="2" />
        </el-select>
      </div>

      <div class="activity-grid" v-loading="loading">
        <ActivityCard 
          v-for="activity in activityList" 
          :key="activity.activityId" 
          :activity="activity" 
        />
      </div>
      
      <div v-if="!loading && activityList.length === 0" class="no-results">
        <el-empty description="暂无相关活动" />
      </div>

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { listActivities } from '@/api/user/activity'
import ActivityCard from './components/ActivityCard.vue'

const loading = ref(false)
const total = ref(0)
const activityList = ref([])

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
    total.value = response.total
    loading.value = false
  }).catch(() => {
     // Mock data if API fails or returns nothing useful (optional fallback)
     loading.value = false
  })
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}
</script>

<style lang="scss" scoped>
.activities-page {
  min-height: 80vh;
  padding-bottom: 4rem;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.search-input {
  max-width: 300px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.no-results {
  padding: 4rem 0;
  text-align: center;
}
</style>
