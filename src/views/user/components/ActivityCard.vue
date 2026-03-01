<template>
  <div class="activity-card" @click="viewDetail">
    <div class="card-image">
      <el-image :src="activity.coverUrl || activity.cover" fit="cover" class="activity-img">
        <template #error>
          <div class="image-placeholder">
            <el-icon><Calendar /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="status-badge" :class="statusClass">
        <span class="pulse-dot" v-if="statusText === '进行中'"></span>
        {{ statusText }}
      </div>
      <div class="activity-type" v-if="activity.categoryName">
        {{ activity.categoryName }}
      </div>
    </div>
    
    <div class="card-content">
      <div class="activity-header">
        <span class="club-tag" v-if="activity.clubName">
          {{ activity.clubName }}
        </span>
        <h3 class="activity-title line-clamp-2">{{ activity.activityTitle || activity.title }}</h3>
      </div>

      <div class="activity-details">
        <div class="detail-item">
          <div class="icon-box date">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="detail-text">
            <div class="label">活动时间</div>
            <div class="value">{{ formatDate(activity.startTime) }}</div>
          </div>
        </div>
        
        <div class="detail-item">
          <div class="icon-box location">
            <el-icon><Location /></el-icon>
          </div>
          <div class="detail-text">
            <div class="label">活动地点</div>
            <div class="value">{{ activity.location || '线上活动' }}</div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="participant-info">
          <el-icon><User /></el-icon>
          <span>{{ activity.currentParticipants || 0 }} 人已报名</span>
        </div>
        <el-button type="primary" size="small" class="action-btn">
          查看详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Location, School, User } from '@element-plus/icons-vue'

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
    if (!dateStr) return '待定'
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
}

const statusText = computed(() => {
    const statusMap = { '0': '即将开始', '1': '进行中', '2': '已结束', '3': '已取消' }
    return statusMap[props.activity.status] || '即将开始'
})

const statusClass = computed(() => {
    const classMap = { '0': 'upcoming', '1': 'ongoing', '2': 'ended', '3': 'ended' }
    return classMap[props.activity.status] || 'upcoming'
})
</script>

<style lang="scss" scoped>
.activity-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: transparent;

    .activity-img {
      transform: scale(1.08);
    }
    
    .action-btn {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
  }
}

.card-image {
  height: 180px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;

  .activity-img {
    width: 100%;
    height: 100%;
    transition: transform 0.6s ease;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 2.5rem;
}

.status-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  &.upcoming {
    background: rgba(59, 130, 246, 0.9);
    color: white;
  }
  
  &.ongoing {
    background: rgba(16, 185, 129, 0.9);
    color: white;
  }
  
  &.ended {
    background: rgba(100, 116, 139, 0.9);
    color: white;
  }
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #fff;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(0.95); opacity: 1; }
}

.activity-type {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-header {
  margin-bottom: 1.25rem;
  
  .club-tag {
    display: inline-block;
    padding: 2px 8px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}

.activity-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  height: 3.2rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 24px;

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    
    &.date { background: #eff6ff; color: #3b82f6; }
    &.location { background: #fdf2f8; color: #db2777; }
  }

  .detail-text {
    min-width: 0;
    .label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .value {
      font-size: 0.9rem;
      color: #334155;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  
  .el-icon {
    font-size: 1rem;
    color: #94a3b8;
  }
}

.action-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}
</style>
