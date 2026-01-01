<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="icon-box">
        <svg-icon icon-class="401" class="forbidden-icon" />
      </div>
      <h1 class="title">访问权限受限</h1>
      <p class="message">抱歉，您的账号仅具备普通用户权限，无法进入后台管理系统。</p>
      <div class="timer-box">
        <span class="timer">{{ countdown }}</span> 秒后将为您自动返回首页
      </div>
      <div class="action-box">
        <el-button type="primary" @click="goHome" plain>立即返回首页</el-button>
        <el-button type="info" @click="logout" plain>退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const countdown = ref(5)
let timer = null

const goHome = () => {
  router.push('/user/home')
}

const logout = () => {
  userStore.logOut().then(() => {
    router.push('/login')
  })
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      goHome()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.forbidden-content {
  text-align: center;
  background: white;
  padding: 50px 80px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 90%;
  
  .icon-box {
    margin-bottom: 30px;
    .forbidden-icon {
      width: 120px;
      height: 120px;
    }
  }

  .title {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .message {
    font-size: 16px;
    color: #7f8c8d;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .timer-box {
    background: #f1f2f6;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 40px;
    
    .timer {
      font-weight: bold;
      color: #e74c3c;
      font-size: 18px;
    }
  }

  .action-box {
    display: flex;
    justify-content: center;
    gap: 15px;
    
    .el-button {
      padding: 12px 25px;
      border-radius: 8px;
    }
  }
}
</style>
