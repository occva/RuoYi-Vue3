<template>
  <div class="club-card" @click="goToDetail">
    <div class="card-image-wrapper">
      <el-image :src="getImgUrl(club.logoUrl)" :alt="club.clubName" class="club-image" fit="cover">
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div v-if="club.isPopular === '1'" class="popular-badge">
        <el-icon><StarFilled /></el-icon>
        热门
      </div>
    </div>
    
    <div class="club-content">
      <div class="club-info-top">
        <h3 class="club-name">{{ club.clubName }}</h3>
        <span class="category-tag" v-if="club.categoryName">{{ club.categoryName }}</span>
      </div>
      
      <p class="club-desc line-clamp-2">{{ club.description }}</p>
      
      <div class="club-stats">
        <div class="stat-item">
          <el-icon><User /></el-icon>
          <span>{{ club.memberCount || 0 }} 成员</span>
        </div>
        <div class="stat-item">
          <el-icon><Calendar /></el-icon>
          <span>{{ club.ongoingActivityCount || 0 }} 活动进行中</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Calendar, Picture, StarFilled } from '@element-plus/icons-vue'
import { getImgUrl } from '@/utils/ruoyi'

const props = defineProps({
  club: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/user/club/${props.club.clubId}`)
}


</script>

<style lang="scss" scoped>
.club-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #e2e8f0;

    .club-image {
      transform: scale(1.05);
    }
  }
}

.card-image-wrapper {
  height: 200px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
}

.club-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 2rem;
}

.popular-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.club-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 12px;
}

.club-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.category-tag {
  background: #eff6ff;
  color: #3b82f6;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.club-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  height: 2.7rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.club-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #64748b;

  .el-icon {
    font-size: 1rem;
    color: #94a3b8;
  }
}
</style>

