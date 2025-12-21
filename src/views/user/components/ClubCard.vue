<template>
  <div class="club-card" @click="goToDetail">
    <img :src="club.image" :alt="club.name" class="club-image" />
    <div class="club-content">
      <h3 class="club-name">{{ club.name }}</h3>
      <p class="club-desc">{{ club.description }}</p>
      <div class="club-footer">
        <span class="member-count">
          <el-icon><User /></el-icon>
          {{ club.members }} 人已加入
        </span>
        <el-button size="small" @click.stop="handleJoin">
          立即加入
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  club: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/user/club/${props.club.id}`)
}

const handleJoin = () => {
  ElMessage.info(`申请加入 ${props.club.name}，请先登录完成申请。`)
}
</script>

<style lang="scss" scoped>
.club-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

.club-image {
  height: 200px;
  width: 100%;
  object-fit: cover;
  background-color: #f3f4f6;
}

.club-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.club-desc {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex: 1;
}

.club-footer {
  margin-top: auto;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-count {
  font-size: 0.85rem;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
