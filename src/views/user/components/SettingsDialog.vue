<template>
  <el-dialog
    v-model="visible"
    width="1000px"
    class="notion-settings-dialog"
    append-to-body
    :show-close="true"
    destroy-on-close
    align-center
    :close-on-click-modal="true"
  >
    <div class="settings-layout">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="section-title">个人设置</div>
          <div 
            :class="['nav-item', { active: activeTab === 'account' }]"
            @click="activeTab = 'account'"
          >
            <img :src="userStore.avatar" class="mini-avatar" />
            <span>帐号设置</span>
          </div>
          <div 
            :class="['nav-item', { active: activeTab === 'security' }]"
            @click="activeTab = 'security'"
          >
            <el-icon><Lock /></el-icon>
            <span>安全与隐私</span>
          </div>
          <div 
            :class="['nav-item', { active: activeTab === 'about' }]"
            @click="activeTab = 'about'"
          >
            <el-icon><InfoFilled /></el-icon>
            <span>关于</span>
          </div>
        </div>
      </aside>

      <!-- 右侧主内容区 -->
      <main class="main-content">
        <transition name="fade-slide" mode="out-in">
          <div :key="activeTab" class="content-view">
            
            <!-- 帐号设置面板 -->
            <div v-if="activeTab === 'account'">
              <h1 class="view-title">帐号</h1>
              
              <section class="settings-group">
                <!-- 展示名称 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">
                      <userAvatar class="mini-avatar-edit" />
                    </div>
                    <div class="info-content">
                      <el-input 
                        v-model="user.nickName" 
                        :readonly="editingField !== 'nickName'"
                        placeholder="输入你的昵称..." 
                        class="notion-input name-input"
                        :class="{ 'is-readonly': editingField !== 'nickName' }"
                        size="small"
                      />
                    </div>
                  </div>
                  <div class="action-btn-group">
                    <template v-if="editingField === 'nickName'">
                      <el-button class="action-btn confirm" @click="handleUpdateProfile">确认</el-button>
                      <el-button class="action-btn cancel" @click="cancelEdit">取消</el-button>
                    </template>
                    <el-button v-else class="action-btn" @click="enterEdit('nickName')">修改名称</el-button>
                  </div>
                </div>

                <!-- 个人简介 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">个人简介</div>
                    <div class="info-content">
                      <el-input 
                        v-if="editingField === 'remark'"
                        v-model="user.remark" 
                        class="notion-input"
                        size="small"
                      />
                      <span v-else>{{ user.remark || '测试员' }}</span>
                    </div>
                  </div>
                  <div class="action-btn-group">
                    <template v-if="editingField === 'remark'">
                      <el-button class="action-btn confirm" @click="handleUpdateProfile">确认</el-button>
                      <el-button class="action-btn cancel" @click="cancelEdit">取消</el-button>
                    </template>
                    <el-button v-else class="action-btn" @click="enterEdit('remark')">修改简介</el-button>
                  </div>
                </div>

                <!-- 性别 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">性别</div>
                    <div class="info-content">
                      <el-select v-if="editingField === 'sex'" v-model="user.sex" class="notion-select" size="small">
                        <el-option label="男" value="0" />
                        <el-option label="女" value="1" />
                        <el-option label="保密" value="2" />
                      </el-select>
                      <span v-else>{{ sexLabel }}</span>
                    </div>
                  </div>
                  <div class="action-btn-group">
                    <template v-if="editingField === 'sex'">
                      <el-button class="action-btn confirm" @click="handleUpdateProfile">确认</el-button>
                      <el-button class="action-btn cancel" @click="cancelEdit">取消</el-button>
                    </template>
                    <el-button v-else class="action-btn" @click="enterEdit('sex')">修改性别</el-button>
                  </div>
                </div>

                <!-- 手机号码 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">手机号码</div>
                    <div class="info-content">
                      <el-input 
                        v-if="editingField === 'phonenumber'"
                        v-model="user.phonenumber" 
                        class="notion-input"
                        size="small"
                      />
                      <span v-else>{{ user.phonenumber }}</span>
                    </div>
                  </div>
                  <div class="action-btn-group">
                    <template v-if="editingField === 'phonenumber'">
                      <el-button class="action-btn confirm" @click="handleUpdateProfile">确认</el-button>
                      <el-button class="action-btn cancel" @click="cancelEdit">取消</el-button>
                    </template>
                    <el-button v-else class="action-btn" @click="enterEdit('phonenumber')">修改手机</el-button>
                  </div>
                </div>

                <!-- 电子邮箱 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">电子邮箱</div>
                    <div class="info-content">
                      <el-input 
                        v-if="editingField === 'email'"
                        v-model="user.email" 
                        class="notion-input"
                        size="small"
                      />
                      <span v-else>{{ user.email }}</span>
                    </div>
                  </div>
                  <div class="action-btn-group">
                    <template v-if="editingField === 'email'">
                      <el-button class="action-btn confirm" @click="handleUpdateProfile">确认</el-button>
                      <el-button class="action-btn cancel" @click="cancelEdit">取消</el-button>
                    </template>
                    <el-button v-else class="action-btn" @click="enterEdit('email')">修改邮箱</el-button>
                  </div>
                </div>

                <!-- 所属部门 -->
                <div class="setting-row">
                  <div class="row-left horizontal-info">
                    <div class="info-label">所属部门</div>
                    <div class="info-content">
                      <span>{{ user.dept?.deptName }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <div class="divider"></div>

              <h2 class="group-title">支持</h2>
              <section class="settings-list">
                <div class="setting-row logout-row">
                  <div class="row-left">
                    <div class="row-label danger-text">退出登录</div>
                    <div class="row-desc">从当前设备安全退出。</div>
                  </div>
                  <el-button class="action-btn cancel" @click="handleLogout">退出</el-button>
                </div>
              </section>
            </div>

            <!-- 安全与隐私面板 -->
            <div v-if="activeTab === 'security'">
              <h1 class="view-title">安全与隐私</h1>
              
              <h2 class="group-title">帐号安全</h2>
              <div class="setting-row">
                <div class="row-left">
                  <div class="row-label">修改密码</div>
                  <div class="row-desc">定期更改密码以保障账号安全。</div>
                </div>
                <el-button class="action-btn" @click="pwdDialogVisible = true">修改密码</el-button>
              </div>

              <div class="divider"></div>

              <h2 class="group-title">安全审计</h2>
              <div class="audit-list">
                <div class="audit-item">
                  <div class="audit-label">最近登录 IP</div>
                  <div class="audit-value">{{ user.loginIp }}</div>
                  <el-button class="action-btn" size="small">详情</el-button>
                </div>
                <div class="audit-item">
                  <div class="audit-label">最近登录时间</div>
                  <div class="audit-value">{{ parseTime(user.loginDate) }}</div>
                </div>
                <div class="audit-item">
                  <div class="audit-label">密码修改时间</div>
                  <div class="audit-value">{{ parseTime(user.pwdUpdateDate) }}</div>
                </div>
              </div>
            </div>

            <!-- 关于面板 -->
            <div v-if="activeTab === 'about'">
              <h1 class="view-title">关于</h1>
              
              <h2 class="group-title">帐号信息</h2>
              <div class="audit-list">
                <div class="audit-item">
                  <div class="audit-label">加入时间</div>
                  <div class="audit-value">{{ parseTime(user.createTime, '{y}年{m}月{d}日') }}</div>
                  <el-button class="action-btn" size="small">申领勋章</el-button>
                </div>
                <div class="audit-item">
                  <div class="audit-label">当前身份</div>
                  <div class="audit-value">
                    <el-tag v-if="user.roles?.[0]" size="small" effect="plain" class="role-tag">
                      {{ user.roles[0].roleName }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </transition>
      </main>
    </div>
  </el-dialog>

  <!-- 修改密码专用弹窗 -->
  <el-dialog
    v-model="pwdDialogVisible"
    class="notion-pwd-dialog"
    append-to-body
    center
    align-center
    :close-on-click-modal="true"
  >
    <div class="pwd-dialog-content">
      <div class="pwd-header">
        <el-icon class="header-icon"><Lock /></el-icon>
        <h2 class="pwd-title">更改密码</h2>
        <p class="pwd-desc">密码长度至少为 6 个字符，建议包含字母和数字符号以提高安全性。</p>
      </div>

      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-position="top">
        <el-form-item label="输入你的当前密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="当前密码" class="notion-input-big" />
        </el-form-item>
        <el-form-item label="输入新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="新密码" class="notion-input-big" />
        </el-form-item>
        <el-form-item label="确认你的新密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="确认密码" class="notion-input-big" />
        </el-form-item>
        
        <el-button type="primary" class="pwd-submit-btn" :loading="pwdLoading" @click="handleUpdatePassword">
          更改密码
        </el-button>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, getCurrentInstance } from 'vue'
import { Lock, InfoFilled } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import userAvatar from "../profile/userAvatar.vue"
import resetPwd from "../profile/resetPwd.vue"
import { getUserProfile, updateUserProfile, updateUserPwd } from "@/api/user/profile"
import { ElMessageBox } from 'element-plus'
import { parseTime } from "@/utils/ruoyi"

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const visible = ref(false)
const activeTab = ref('account')
const user = ref({})
const backupUser = ref({}) // 用于取消修改时还原数据
const editingField = ref(null)

// 密码修改逻辑
const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref(null)
const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const equalToPassword = (rule, value, callback) => {
  if (pwdForm.value.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const pwdRules = {
  oldPassword: [{ required: true, message: "当前密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { validator: equalToPassword, trigger: "blur" }
  ]
}

const sexLabel = computed(() => {
  const map = { '0': '男', '1': '女', '2': '保密' }
  return map[user.value.sex] || '保密'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) fetchUserData()
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    editingField.value = null
  }
})

// 监听密码弹窗关闭，清空表单
watch(pwdDialogVisible, (val) => {
  if (!val) {
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    if (pwdFormRef.value) pwdFormRef.value.resetFields()
  }
})

async function fetchUserData() {
  const res = await getUserProfile()
  user.value = res.data
}

function enterEdit(field) {
  // 备份当前数据
  backupUser.value = JSON.parse(JSON.stringify(user.value))
  editingField.value = field
}

function cancelEdit() {
  if (editingField.value) {
    // 还原数据
    user.value = JSON.parse(JSON.stringify(backupUser.value))
    editingField.value = null
  }
}

async function handleUpdateProfile() {
  await updateUserProfile(user.value)
  proxy.$modal.msgSuccess("修改成功")
  editingField.value = null
  // 同步更新全局状态
  userStore.nickName = user.value.nickName
}

async function handleUpdatePassword() {
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      pwdLoading.value = true
      try {
        await updateUserPwd(pwdForm.value.oldPassword, pwdForm.value.newPassword)
        proxy.$modal.msgSuccess("密码修改成功")
        pwdDialogVisible.value = false
      } finally {
        pwdLoading.value = false
      }
    }
  })
}

function handleLogout() {
  ElMessageBox.confirm('确定退出当前登录吗？', '提示').then(() => {
    userStore.logOut().then(() => location.href = '/user/home')
  })
}
</script>

<style lang="scss">
.notion-settings-dialog {
  --el-dialog-bg-color: transparent;
  box-shadow: 0 1px 2px rgba(15, 15, 15, 0.1), 0 2px 4px rgba(15, 15, 15, 0.1), 
              0 4px 8px rgba(15, 15, 15, 0.1), 0 8px 16px rgba(15, 15, 15, 0.1) !important;
  border-radius: 12px !important;
  overflow: hidden;

  .el-dialog__header { display: none; }
  .el-dialog__body { padding: 0 !important; margin: 0 !important; }
}

.settings-layout {
  display: flex;
  height: 600px; 
  background: white;
  color: #37352f;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  overflow: hidden;
  border-radius: 12px; 
}

.sidebar {
  width: 200px; 
  background-color: #f7f7f5;
  padding: 4px 8px 10px; 
  display: flex;
  flex-direction: column;
  gap: 8px; 
  user-select: none;
  margin-bottom: 0 !important; // 覆盖全局 index.scss 中的 aside 样式

  .section-title {
    padding: 0 10px;
    font-size: 10px;
    font-weight: 600;
    color: rgba(55, 53, 47, 0.4);
    text-transform: uppercase;
    margin-bottom: 2px;
    letter-spacing: 0.05em;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    height: 34px; 
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.1s ease;
    color: #37352f;
    .el-icon { font-size: 16px; color: rgba(55, 53, 47, 0.65); }
    .mini-avatar { width: 18px; height: 18px; border-radius: 3px; }
    &:hover { background: rgba(55, 53, 47, 0.06); }
    &.active { background: rgba(55, 53, 47, 0.08); font-weight: 500; }
  }
}

.main-content {
  flex: 1;
  padding: 40px 60px; 
  overflow-y: auto;

  .view-title { font-size: 15px; font-weight: 600; margin: 0 0 24px; color: #37352f; }
  .group-title { font-size: 12px; font-weight: 600; color: rgba(55, 53, 47, 0.4); margin: 32px 0 8px; }
  .divider { height: 1px; background: rgba(55, 53, 47, 0.08); margin: 24px 0; }
}

.horizontal-info {
  display: flex;
  align-items: center;
  gap: 10px;
  .info-label {
    width: 80px;
    font-size: 14px;
    color: rgba(55, 53, 47, 0.6);
  }
  .info-content {
    flex: 1;
    font-size: 14px;
    color: #37352f;
  }
}

.notion-input {
  max-width: 240px;
  .el-input__wrapper {
    background-color: #f7f7f5 !important;
    box-shadow: none !important;
    border: 1px solid transparent;
    padding: 0 8px;
    &:hover { background-color: #efefef !important; }
    &.is-focus { background-color: transparent !important; border-color: rgba(55, 53, 47, 0.14) !important; }
  }
  .el-input__inner { 
    font-size: 14px; 
    color: #37352f; 
    height: 28px; 
    background-color: transparent !important;
  }

  &.is-readonly {
    .el-input__wrapper {
      cursor: default;
      background-color: #ededeb !important; /* 明显的灰色底色 */
      &:hover { background-color: #ededeb !important; }
    }
    .el-input__inner { cursor: default; }
  }
}

.notion-select {
  width: 120px;
  :deep(.el-input__wrapper) {
    background-color: #f7f7f5;
    box-shadow: none !important;
    border: 1px solid transparent;
    height: 28px;
  }
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  min-height: 48px;

  .row-left { flex: 1; padding-right: 16px; }
  .row-label { font-size: 14px; color: #37352f; }
  .row-desc { font-size: 12px; color: rgba(55, 53, 47, 0.5); margin-top: 2px; }

  .action-btn {
    border: 1px solid rgba(55, 53, 47, 0.12);
    color: #37352f;
    font-weight: 500;
    font-size: 12px;
    height: 26px;
    border-radius: 4px;
    background: white;
    &:hover { background: #f7f7f5; border-color: rgba(55, 53, 47, 0.24); }
  }

  .action-btn-group {
    display: flex;
    gap: 6px;
    
    .confirm { border-color: #2383e2; color: #2383e2; }
    .cancel { 
      border-color: rgba(212, 76, 71, 0.2) !important; 
      color: #d44c47 !important; 
      background: rgba(212, 76, 71, 0.02) !important;
    }
    .cancel:hover { 
      background: rgba(212, 76, 71, 0.06) !important; 
      border-color: rgba(212, 76, 71, 0.4) !important; 
    }
  }
}

.audit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .audit-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    .audit-label { color: rgba(55, 53, 47, 0.5); width: 100px; }
    .audit-value { flex: 1; color: #37352f; }
  }
}

.role-tag {
  border: 1px solid rgba(55, 53, 47, 0.1) !important;
  color: #37352f !important;
  background: transparent !important;
}

.danger-text { color: #d44c47; }
.security-form-wrapper { margin-top: 16px; width: 400px; }

/* 密码弹窗样式 */
.notion-pwd-dialog {

  width: 350px !important;      
  height: 470px !important;    

  display: flex !important;
  flex-direction: column;
  border-radius: 12px !important;
  overflow: hidden;

  /* 内部布局控制 */
  .el-dialog__header { display: block !important; padding: 2px; }
  .el-dialog__body { padding: 0px 40px 32px !important; }

  .pwd-dialog-content {
    text-align: center;
    
    .pwd-header {
      margin-bottom: 24px;
      .header-icon {
        font-size: 32px;
        color: #37352f;
        margin-bottom: 8px;
      }
      .pwd-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 8px;
        color: #37352f;
      }
      .pwd-desc {
        font-size: 13px;
        color: rgba(55, 53, 47, 0.5);
        line-height: 1.5;
        padding: 0 10px;
      }
    }

    .el-form-item {
      margin-bottom: 16px;
      text-align: left;
      :deep(.el-form-item__label) {
        font-size: 13px;
        color: #37352f;
        padding-bottom: 4px !important;
        margin-bottom: 0;
        line-height: 1.2;
      }
    }

    .notion-input-big {
      :deep(.el-input__wrapper) {
        background-color: #f7f7f5 !important;
        box-shadow: none !important;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 4px 10px;
        &:hover { background-color: #eeeeec !important; }
        &.is-focus { 
          background-color: white !important; 
          border-color: #2383e2; 
          box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1) !important;
        }
      }
      :deep(.el-input__inner) {
        background-color: transparent !important;
        font-size: 14px; 
        height: 32px;
      }
    }

    .pwd-submit-btn {
      width: 100%;
      height: 38px;
      font-size: 14px;
      font-weight: 600;
      background: #2383e2;
      border: none;
      margin-top: 12px;
      border-radius: 6px;
      &:hover { background: #0070df; }
    }

  }
}

/* 动画效果 */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.1s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; }
</style>

<style lang="scss">
/* 强力修正：确保两个弹窗都在正中间 */
.notion-settings-dialog, .notion-pwd-dialog {
  margin: 0 auto !important; // 配合 align-center
  margin-bottom: 0 !important; // 强制移除可能的 bottom 偏移
}

/* 覆盖 Element Plus 覆盖层，实现真居中 */
body {
  .el-overlay {
    .el-overlay-dialog {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      
      .el-dialog {
        margin: 0 !important; // 移除默认的 top 偏移
      }
    }
  }
}
</style>
