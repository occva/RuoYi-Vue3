<template>
  <div class="apply-page">
    <div class="container">
      <section class="intro-card">
        <h1 class="page-title">创建新社团申请</h1>
        <p class="page-subtitle">请完整填写材料，提交后将进入“新社团申请”审核流程。</p>
        <el-steps :active="1" simple class="apply-steps">
          <el-step title="在线提交材料" />
          <el-step title="管理员审核" />
          <el-step title="通过后创建社团与社长后台账号" />
        </el-steps>
      </section>

      <div class="content-grid">
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
              <el-button @click="$router.back()">取消</el-button>
              <el-button type="primary" :loading="loading" @click="submitForm">提交申请</el-button>
            </div>
          </el-form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { listCategories } from '@/api/user/category'
import { applyClub } from '@/api/user/club'
import ImageUpload from '@/components/ImageUpload/index.vue'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const categoryOptions = ref([])

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
  if (!value || !value.trim()) {
    callback(new Error('请输入指导老师联系方式'))
    return
  }
  const contact = value.trim()
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
      advisorContact: form.advisorContact.trim(),
      remark: buildRemark()
    }

    loading.value = true
    applyClub(payload)
      .then(() => {
        ElMessage.success('申请提交成功，请等待审核')
        router.push('/user/my-clubs')
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
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

.apply-steps {
  border-radius: 10px;
  background: #f8fafc;
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
