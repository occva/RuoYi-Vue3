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
            v-model="searchTerm"
            placeholder="搜索社团名称或描述..."
            :prefix-icon="Search"
            clearable
          />
        </div>

        <div class="category-filters">
          <el-button
            v-for="cat in categories"
            :key="cat.id"
            :type="filter === cat.id ? 'primary' : 'default'"
            round
            @click="filter = cat.id"
          >
            {{ cat.label }}
          </el-button>
        </div>
      </div>

      <!-- 结果网格 -->
      <div v-if="filteredClubs.length > 0" class="club-grid">
        <ClubCard v-for="club in filteredClubs" :key="club.id" :club="club" />
      </div>
      <div v-else class="no-results">
        <el-empty description="没有找到匹配的社团">
          <el-button type="primary" @click="clearFilters">清除筛选</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { MOCK_CLUBS } from './data/mockData'
import ClubCard from './components/ClubCard.vue'

const filter = ref('all')
const searchTerm = ref('')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'technology', label: '科技' },
  { id: 'art', label: '艺术' },
  { id: 'academic', label: '学术' },
  { id: 'sports', label: '体育' },
  { id: 'volunteering', label: '公益' }
]

const filteredClubs = computed(() => {
  let result = MOCK_CLUBS

  if (filter.value !== 'all') {
    result = result.filter(club => club.category === filter.value)
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(club =>
      club.name.toLowerCase().includes(term) ||
      club.description.toLowerCase().includes(term)
    )
  }

  return result
})

const clearFilters = () => {
  filter.value = 'all'
  searchTerm.value = ''
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
</style>
