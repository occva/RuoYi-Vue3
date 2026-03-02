<template>
  <div class="apply-page">
    <div class="container">
      <section class="intro-card">
        <h1 class="page-title">{{ isViewMode ? '社团申请详情' : '创建新社团申请' }}</h1>
        <p class="page-subtitle" v-if="!isViewMode">请完整填写材料，提交后将进入“新社团申请”审核流程。</p>
        <el-steps :active="currentStep" simple class="apply-steps">
          <el-step title="在线提交材料" class="clickable-step" @click="changeTab(1)" />
          <el-step title="管理员审核" class="clickable-step" @click="changeTab(2)" />
          <el-step :title="appStatus === '1' ? '已通过，请查看后台帐号' : '通过后创建社团与社长后台账号'" class="clickable-step" @click="changeTab(3)" />
        </el-steps>
      </section>

      <div class="status-panel" v-if="activeTab === 2">
        <el-card class="status-card" shadow="hover">
          <el-result icon="info" title="审核进行中" sub-title="您的社团创建申请已提交，请耐心等待管理员审核。" v-if="appStatus === '0'">
            <template #extra>
              <el-button type="primary" plain @click="$router.push('/user/my-clubs?tab=applications&subtab=create')">返回我的申请</el-button>
              <el-button @click="activeTab = 1">查看填报资料</el-button>
            </template>
          </el-result>

          <el-result icon="error" title="审核未通过" :sub-title="'抱歉，您的申请已被拒绝。原因：' + (appInfo.reviewComment || '不满足要求')" v-else-if="appStatus === '2'">
            <template #extra>
              <el-button type="primary" plain @click="$router.push('/user/my-clubs?tab=applications&subtab=create')">返回我的申请</el-button>
              <el-button @click="activeTab = 1">查看填报资料</el-button>
            </template>
          </el-result>

          <el-result icon="warning" title="申请已撤回" sub-title="您已主动撤回该社团的创建申请。" v-else-if="appStatus === '3'">
            <template #extra>
              <el-button type="primary" plain @click="$router.push('/user/my-clubs?tab=applications&subtab=create')">返回我的申请</el-button>
              <el-button @click="activeTab = 1">查看填报资料</el-button>
            </template>
          </el-result>

          <el-result icon="success" title="审核已通过" sub-title="管理员已通过您的创建申请，请前往下一步查看创建结果。" v-else-if="appStatus === '1'">
            <template #extra>
              <el-button type="primary" @click="activeTab = 3">查看社长账号及社团</el-button>
            </template>
          </el-result>
        </el-card>
      </div>

      <div class="status-panel" v-if="activeTab === 3">
        <el-card class="status-card" shadow="hover">
          <el-result icon="success" title="社团创建成功" sub-title="您的社团及管理后台账号已生成！" v-if="appStatus === '1'">
            <template #extra>
              <div class="admin-credentials" v-if="appInfo.adminUserName">
                <el-alert type="success" :closable="false" class="admin-alert">
                  <p>社长后台账号：<strong>{{ appInfo.adminUserName }}</strong></p>
                  <p>初始密码：<strong>{{ appInfo.adminInitPassword || '123456' }}</strong></p>
                  <p style="margin-top: 10px;">
                    <a href="http://localhost:5173/login" target="_blank" class="login-link">前往登录管理后台</a>
                  </p>
                </el-alert>
              </div>
              <div style="margin-top: 24px;">
                <el-button type="primary" plain @click="$router.push('/user/my-clubs')">返回我的社团</el-button>
                <el-button @click="activeTab = 1">查看填报资料</el-button>
              </div>
            </template>
          </el-result>
          <el-result icon="info" title="阶段未解锁" sub-title="申请尚未通过，该页面暂无内容。" v-else>
            <template #extra>
              <el-button @click="activeTab = 2">查看审核状态</el-button>
            </template>
          </el-result>
        </el-card>
      </div>

      <div class="content-grid" v-show="activeTab === 1">
        <aside class="sidebar">
          <section class="material-card">
            <h2 class="material-title">建议准备材料</h2>
            <div class="material-tags">
              <el-tag v-for="item in requiredMaterialOptions" :key="item.value" effect="plain" type="info">
                {{ item.label }}
              </el-tag>
            </div>
          </section>

          <section class="tip-card">
            <h2 class="tip-title">填报建议</h2>
            <ul class="tip-list">
              <li>活动规划、核心成员说明可在后续审核阶段补充。</li>
              <li>指导老师姓名为选填项，建议填写便于后续沟通。</li>
              <li>联系方式建议同时提供手机号和邮箱。</li>
            </ul>
          </section>
        </aside>

        <section class="apply-card">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="apply-form"
            size="large"
            :disabled="isViewMode"
          >
          <h3 class="section-title">一、基础信息</h3>
          <div class="form-grid">
            <el-form-item label="社团名称" prop="clubName">
              <el-input v-model="form.clubName" placeholder="例如：人工智能研习社" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="社团分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.categoryId"
                  :label="item.categoryName"
                  :value="item.categoryId"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-grid">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" :prefix-icon="Message" maxlength="20" />
            </el-form-item>
            <el-form-item label="社团 Logo" prop="logoUrl">
              <ImageUpload v-model="form.logoUrl" :limit="1" />
            </el-form-item>
          </div>

          <h3 class="section-title">二、指导老师信息</h3>
          <div class="form-grid">
            <el-form-item label="指导老师姓名" prop="advisorName">
              <el-input v-model="form.advisorName" placeholder="请输入指导老师姓名" maxlength="30" />
            </el-form-item>
            <el-form-item label="指导老师联系方式" prop="advisorContact">
              <el-input v-model="form.advisorContact" placeholder="手机号或邮箱" maxlength="50" />
            </el-form-item>
          </div>

          <h3 class="section-title">三、申请材料内容</h3>
          <el-form-item label="社团简介" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请介绍社团定位、宗旨和主要方向"
            />
          </el-form-item>

          <el-form-item label="申请理由" prop="applyReason">
            <el-input
              v-model="form.applyReason"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请说明创建社团的必要性与价值"
            />
          </el-form-item>

          <h3 class="section-title">四、材料确认</h3>
          <el-form-item label="已准备材料" prop="materialChecks">
            <el-checkbox-group v-model="form.materialChecks" class="checkbox-grid">
              <el-checkbox v-for="item in requiredMaterialOptions" :key="item.value" :label="item.value">
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="补充材料链接（可选）" prop="materialLinks">
            <el-input
              v-model="form.materialLinks"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              placeholder="如有云盘链接、项目文档链接等，请在此补充"
            />
          </el-form-item>

          <el-form-item prop="agreeProtocol">
            <el-checkbox v-model="form.agreeProtocol">
              我确认以上材料真实有效，并愿意配合后续审核
            </el-checkbox>
          </el-form-item>

            <div class="form-actions">
              <el-button v-if="isViewMode" @click="activeTab = 2">查看进度状态</el-button>
              <el-button v-else @click="$router.back()">取消</el-button>
              <el-button v-if="!isViewMode" type="primary" :loading="loading" @click="submitForm">提交申请</el-button>
            </div>
          </el-form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { listCategories } from '@/api/user/category'
import { applyClub } from '@/api/user/club'
import request from '@/utils/request'
import ImageUpload from '@/components/ImageUpload/index.vue'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const prefillLoading = ref(false)
const categoryOptions = ref([])
const isViewMode = ref(false)
const activeTab = ref(1) // Controls which of the 3 views is showing
const currentStep = ref(1) // 1: 提交(此时如果在审核则active为2), 2: 审核, 3: 完成
const appStatus = ref('') // Store the original status for display logic
const appInfo = reactive({
  reviewComment: '',
  adminUserName: '',
  adminInitPassword: ''
})

const changeTab = (tabIdx) => {
  if (!isViewMode.value && tabIdx !== 1) {
    ElMessage.warning('请先提交申请材料')
    return
  }
  activeTab.value = tabIdx
}

const requiredMaterialOptions = [
  { value: 'charter', label: '社团章程草案' },
  { value: 'members', label: '核心成员名单与分工' },
  { value: 'advisor', label: '指导老师确认信息' },
  { value: 'plan', label: '学期活动计划' },
  { value: 'budget', label: '经费与资源说明' }
]

const form = reactive({
  clubName: '',
  categoryId: '',
  contactPhone: '',
  logoUrl: '',
  description: '',
  applyReason: '',
  advisorName: '',
  advisorContact: '',
  materialChecks: [],
  materialLinks: '',
  agreeProtocol: false
})

const phonePattern = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const validateAdvisorContact = (_, value, callback) => {
  const contact = (value || '').trim()
  if (!contact) {
    callback()
    return
  }
  if (!phonePattern.test(contact) && !emailPattern.test(contact)) {
    callback(new Error('请输入有效的手机号或邮箱'))
    return
  }
  callback()
}

const validateMaterials = (_, value, callback) => {
  if (!Array.isArray(value) || value.length < 4) {
    callback(new Error('请至少确认 4 项已准备材料'))
    return
  }
  callback()
}

const validateAgreement = (_, value, callback) => {
  if (!value) {
    callback(new Error('请先确认材料真实性声明'))
    return
  }
  callback()
}

const rules = {
  clubName: [
    { required: true, message: '请输入社团名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择社团分类', trigger: 'change' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: phonePattern, message: '请输入有效联系电话', trigger: 'blur' }
  ],
  logoUrl: [
    { required: true, message: '请上传社团 Logo', trigger: 'change' }
  ],
  advisorContact: [
    { validator: validateAdvisorContact, trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入社团简介', trigger: 'blur' },
    { min: 30, message: '社团简介至少 30 字', trigger: 'blur' }
  ],
  applyReason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 30, message: '申请理由至少 30 字', trigger: 'blur' }
  ],
  materialChecks: [
    { validator: validateMaterials, trigger: 'change' }
  ],
  agreeProtocol: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

onMounted(() => {
  getCategoryList()
  isViewMode.value = !!route.query.view
  // 如果有 from 参数(上次畀回或被拒他申请的 applyId)，预填表单
  const fromId = route.query?.from
  if (fromId) {
    prefillLoading.value = true
    request({ url: '/api/app/club/create-application/' + fromId, method: 'get' })
      .then(res => {
        const d = res.data
        if (d) {
          form.clubName = d.clubName || ''
          form.categoryId = d.categoryId ? String(d.categoryId) : ''
          form.contactPhone = d.contactPhone || ''
          form.logoUrl = d.logoUrl || ''
          form.description = d.description || ''
          form.applyReason = d.applyReason || ''
          form.advisorName = d.advisorName || ''
          form.advisorContact = d.advisorContact || ''
          
          if (isViewMode.value) {
            appStatus.value = d.status
            appInfo.reviewComment = d.reviewComment || ''
            appInfo.adminUserName = d.adminUserName || ''
            appInfo.adminInitPassword = d.adminInitPassword || ''
            
            // Default active tab based on status
            if (d.status === '0' || d.status === '2' || d.status === '3') {
               currentStep.value = 2
               activeTab.value = 2 // Default to show step 2: audit status
            } else if (d.status === '1') {
               currentStep.value = 3
               activeTab.value = 3 // Default to show step 3: approved result
            }
          }
        }
      })
      .finally(() => { prefillLoading.value = false })
  }
})

const getCategoryList = () => {
  listCategories().then(response => {
    categoryOptions.value = response.data || []
  })
}

const buildRemark = () => {
  const checkedLabels = requiredMaterialOptions
    .filter(item => form.materialChecks.includes(item.value))
    .map(item => item.label)

  const sections = [
    `已确认材料：${checkedLabels.join('、') || '无'}`,
    `补充材料链接：${form.materialLinks?.trim() || '无'}`
  ]
  return sections.join('\n')
}

const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate(valid => {
    if (!valid) return

    const payload = {
      clubName: form.clubName.trim(),
      categoryId: form.categoryId,
      contactPhone: form.contactPhone.trim(),
      logoUrl: form.logoUrl,
      description: form.description.trim(),
      applyReason: form.applyReason.trim(),
      advisorName: form.advisorName.trim() || undefined,
      advisorContact: form.advisorContact.trim() || undefined,
      remark: buildRemark()
    }

    loading.value = true
    applyClub(payload)
      .then(() => {
        ElMessage.success('申请提交成功')
        isViewMode.value = true
        appStatus.value = '0'
        currentStep.value = 2
        activeTab.value = 2
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.status-panel {
  margin-top: 2rem;
  .status-card {
    border: none;
    border-radius: 16px;
    padding: 2rem 0;
  }
}
.admin-credentials {
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
  .admin-alert {
    padding: 1.5rem;
    border-radius: 12px;
    p { margin: 8px 0; font-size: 15px; }
  }
  .login-link {
    color: #2563eb;
    text-decoration: underline;
    font-weight: 600;
  }
}

.apply-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f9ff 0%, #f9fafb 100%);
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.intro-card,
.material-card,
.tip-card,
.apply-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 16px -8px rgba(15, 23, 42, 0.15);
}

.intro-card {
  padding: 1.75rem;
  margin-bottom: 1rem;
}

.content-grid {
  display: grid;
  gap: 1rem;

  @media (min-width: 992px) {
    grid-template-columns: 280px 1fr;
    align-items: start;
  }
}

.sidebar {
  display: grid;
  gap: 1rem;

  @media (min-width: 992px) {
    position: sticky;
    top: 86px;
  }
}

.material-card,
.tip-card {
  padding: 1.2rem 1.2rem 1.3rem;
}

.apply-steps {
  margin-top: 1.5rem;
  background: transparent;
  padding: 1rem 0 0 0;
  
  :deep(.el-step.is-simple .el-step__title) {
    font-size: 0.95rem;
    font-weight: 600;
  }
  
  .clickable-step {
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.7;
    }
  }
}
.apply-card {
  padding: 1.6rem;

  @media (min-width: 992px) {
    padding: 2rem;
  }
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
}

.page-subtitle {
  margin: 0.6rem 0 1.25rem;
  color: #6b7280;
}

.material-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.material-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tip-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.tip-list {
  margin: 0;
  padding-left: 1rem;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.7;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #111827;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 0.5rem;
}

.section-title:not(:first-child) {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }
}

.checkbox-grid {
  display: grid;
  gap: 0.6rem;

  @media (min-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  .el-button {
    height: 42px;
    padding: 0 24px;
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #e5e7eb inset;

  &:hover {
    box-shadow: 0 0 0 1px #d1d5db inset;
  }

  &.is-focus {
    box-shadow: 0 0 0 2px var(--el-color-primary) inset !important;
  }
}
</style>
