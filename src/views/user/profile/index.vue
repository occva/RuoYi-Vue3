<template>
   <div class="profile-container">
      <el-row :gutter="24">
         <el-col :span="8" :xs="24">
            <el-card class="profile-card info-card" shadow="never">
               <template v-slot:header>
                  <div class="card-header">
                     <span class="header-title">个人信息</span>
                  </div>
               </template>
               <div class="card-body">
                  <div class="avatar-section">
                     <userAvatar />
                     <div class="user-meta">
                        <h3 class="user-nickname">{{ state.user.nickName }}</h3>
                        <p class="user-role">普通用户</p>
                     </div>
                  </div>
                  <div class="info-list">
                     <div class="info-item">
                        <div class="info-label">
                           <el-icon><User /></el-icon>
                           <span>用户账号</span>
                        </div>
                        <div class="info-value">{{ state.user.userName }}</div>
                     </div>
                     <div class="info-item">
                        <div class="info-label">
                           <el-icon><Phone /></el-icon>
                           <span>手机号码</span>
                        </div>
                        <div class="info-value">{{ state.user.phonenumber || '未绑定' }}</div>
                     </div>
                     <div class="info-item">
                        <div class="info-label">
                           <el-icon><Message /></el-icon>
                           <span>电子邮箱</span>
                        </div>
                        <div class="info-value text-ellipsis">{{ state.user.email || '未绑定' }}</div>
                     </div>
                     <div class="info-item">
                        <div class="info-label">
                           <el-icon><Calendar /></el-icon>
                           <span>注册日期</span>
                        </div>
                        <div class="info-value">{{ state.user.createTime }}</div>
                     </div>
                  </div>
               </div>
            </el-card>
         </el-col>
         <el-col :span="16" :xs="24">
            <el-card class="profile-card tabs-card" shadow="never">
               <el-tabs v-model="selectedTab" class="custom-tabs">
                  <el-tab-pane name="userinfo">
                     <template #label>
                        <span class="tab-label">
                           <el-icon><EditPen /></el-icon>
                           基本资料
                        </span>
                     </template>
                     <div class="tab-content">
                        <userInfo :user="state.user" />
                     </div>
                  </el-tab-pane>
                  <el-tab-pane name="resetPwd">
                     <template #label>
                        <span class="tab-label">
                           <el-icon><Lock /></el-icon>
                           修改密码
                        </span>
                     </template>
                     <div class="tab-content">
                        <resetPwd />
                     </div>
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="UserProfile">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { User, Phone, Message, Calendar, EditPen, Lock } from '@element-plus/icons-vue'
import userAvatar from "./userAvatar"
import userInfo from "./userInfo"
import resetPwd from "./resetPwd"
import { getUserProfile } from "@/api/user/profile"

const route = useRoute()
const selectedTab = ref("userinfo")
const state = reactive({
  user: {}
})

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
  })
}

onMounted(() => {
  const activeTab = route.params && route.params.activeTab
  if (activeTab) {
    selectedTab.value = activeTab
  }
  getUser()
})
</script>

<style lang="scss" scoped>
/* 保持与原版一致的高级样式 */
.profile-container {
   padding: 24px;
   background-color: #f7f9fb;
   min-height: calc(100vh - 84px);
}

.profile-card {
   border: none;
   border-radius: 20px;
   background: white;
   box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
   transition: transform 0.3s, box-shadow 0.3s;
   margin-bottom: 24px;

   &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
   }

   :deep(.el-card__header) {
      border-bottom: 1px solid #f0f0f0;
      padding: 20px 24px;
   }

   .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-title {
         font-size: 18px;
         font-weight: 700;
         color: #2c3e50;
      }
   }
}

.avatar-section {
   text-align: center;
   padding: 30px 0;
   border-bottom: 1px dashed #f0f0f0;
   margin-bottom: 20px;

   :deep(.user-info-head) {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
      
      .img-circle {
         border: 4px solid white;
         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
   }

   .user-meta {
      margin-top: 12px;
      
      .user-nickname {
         margin: 0;
         font-size: 20px;
         font-weight: 700;
         color: #2c3e50;
      }
      
      .user-role {
         margin: 10px auto 0;
         font-size: 12px;
         font-weight: 600;
         color: #409eff;
         background: #ecf5ff;
         padding: 4px 14px;
         border-radius: 100px;
         display: inline-flex;
         align-items: center;
         box-shadow: 0 4px 10px rgba(64, 158, 255, 0.12);
         letter-spacing: 0.5px;
      }
   }
}

.info-list {
   padding: 0 10px;

   .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f8f9fa;

      &:last-child {
         border-bottom: none;
      }

      .info-label {
         display: flex;
         align-items: center;
         gap: 10px;
         color: #606266;
         font-size: 14px;

         .el-icon {
            font-size: 16px;
            color: #409eff;
         }
      }

      .info-value {
         color: #303133;
         font-weight: 500;
         font-size: 14px;
         max-width: 60%;
         text-align: right;
      }
      
      .text-ellipsis {
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
      }
   }
}

.custom-tabs {
   :deep(.el-tabs__header) {
      margin: 0;
      padding: 20px 24px 0;
      border-bottom: 1px solid #f0f0f0;
   }

   :deep(.el-tabs__nav-wrap::after) {
      display: none;
   }

   :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px;
   }

   :deep(.el-tabs__item) {
      height: 50px;
      font-size: 15px;
      font-weight: 600;
      color: #909399;
      transition: all 0.3s;

      &.is-active {
         color: #409eff;
      }

      &:hover {
         color: #409eff;
      }
   }

   .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
   }

   .tab-content {
      padding: 30px 24px;
   }
}

@media (max-width: 768px) {
   .profile-container {
      padding: 12px;
   }
   
   .info-card {
      margin-bottom: 20px;
   }
}
</style>
