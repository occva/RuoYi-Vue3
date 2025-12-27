<template>
  <div class="activity-card" @click="viewDetail">
    <div class="card-image">
      <img :src="activity.coverUrl || activity.cover || defaultImage" alt="Activity Cover" />
      <div class="status-badge" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    <div class="card-content">
      <div class="activity-meta">
        <span class="club-name" v-if="activity.clubName">
          <el-icon><School /></el-icon> {{ activity.clubName }}
        </span>
      </div>
      <h3 class="activity-title">{{ activity.activityTitle || activity.title }}</h3>
      <div class="activity-info">
        <div class="info-item">
          <el-icon><Calendar /></el-icon>
          <span>{{ formatDate(activity.startTime) }}</span>
        </div>
        <div class="info-item">
          <el-icon><Location /></el-icon>
          <span>{{ activity.address || '线上活动' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Location, School } from '@element-plus/icons-vue'
import defaultImage from '@/assets/images/profile.jpg' // Fallback image

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const viewDetail = () => {
    router.push(`/user/activity/${props.activity.activityId}`)
}

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusText = computed(() => {
    if (!props.activity.startTime) return props.activity.status === '2' ? '已结束' : (props.activity.status === '1' ? '进行中' : '即将开始')
    const now = new Date()
    const start = new Date(props.activity.startTime)
    // If no endTime, assume 2 hours
    const end = props.activity.endTime ? new Date(props.activity.endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000)
    
    if (now < start) return '即将开始'
    if (now >= start && now <= end) return '进行中'
    return '已结束'
})

const statusClass = computed(() => {
    const status = statusText.value
    if (status === '即将开始') return 'upcoming'
    if (status === '进行中') return 'ongoing'
    return 'ended'
})
</script>

<style lang="scss" scoped>
.activity-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }
}

.card-image {
  height: 160px;
  width: 100%;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .activity-card:hover & img {
    transform: scale(1.05);
  }
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  
  &.upcoming {
    background: rgba(59, 130, 246, 0.9);
    color: white;
  }
  
  &.ongoing {
    background: rgba(16, 185, 129, 0.9);
    color: white;
  }
  
  &.ended {
    background: rgba(107, 114, 128, 0.9);
    color: white;
  }
}

.card-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-meta {
  margin-bottom: 0.5rem;
  
  .club-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 500;
  }
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  flex: 1;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #4b5563;

    .el-icon {
      color: #9ca3af;
    }
  }
}
</style>
