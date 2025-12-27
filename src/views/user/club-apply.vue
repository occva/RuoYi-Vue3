<template>
  <div class="apply-page">
    <div class="container">
      <div class="apply-card">
        <div class="apply-header">
          <h1 class="page-title">创建新社团申请</h1>
          <p class="page-subtitle">填写下方表格，开启你的社团之旅</p>
        </div>

        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-position="top" 
          class="apply-form"
          size="large"
        >
          <div class="form-grid">
            <el-form-item label="社团名称" prop="clubName">
              <el-input v-model="form.clubName" placeholder="如：人工智能研习社" />
            </el-form-item>

            <el-form-item label="社团分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.categoryId"
                  :label="item.categoryName"
                  :value="item.categoryId"
                />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="form.contactPhone" placeholder="请输入手机号码" :prefix-icon="Message" />
          </el-form-item>

          <el-form-item label="社团Logo" prop="logoUrl">
            <ImageUpload v-model="form.logoUrl" :limit="1" />
          </el-form-item>

          <el-form-item label="社团简介" prop="description">
            <el-input 
              v-model="form.description" 
              type="textarea" 
              :rows="4" 
              placeholder="简要介绍社团的宗旨和主要活动..."
            />
          </el-form-item>

          <el-form-item label="申请理由" prop="remark">
            <el-input 
              v-model="form.remark" 
              type="textarea" 
              :rows="4" 
              placeholder="为什么想要创建这个社团？未来的规划是什么？"
            />
          </el-form-item>

          <div class="form-actions">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm">提交申请</el-button>
          </div>
        </el-form>
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

const form = reactive({
  clubName: '',
  categoryId: '',
  contactPhone: '',
  logoUrl: '',
  description: '',
  remark: ''
})

const rules = {
  clubName: [
    { required: true, message: '请输入社团名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择社团分类', trigger: 'change' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入社团简介', trigger: 'blur' }
  ],
  remark: [
    { required: true, message: '请输入申请理由', trigger: 'blur' }
  ]
}

onMounted(() => {
  getCategoryList()
})

const getCategoryList = () => {
  listCategories().then(response => {
    categoryOptions.value = response.data
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      applyClub(form).then(() => {
        ElMessage.success('申请提交成功，请等待审核')
        router.push('/user/home')
      }).catch(() => {
        loading.value = false
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.apply-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 4rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.apply-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 3rem;
  border: 1px solid #e5e7eb;
}

.apply-header {
  text-align: center;
  margin-bottom: 3rem;

  .page-title {
    font-size: 2rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
  }

  .page-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
}

.form-actions {
  margin-top: 3rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  .el-button {
    height: 44px;
    padding: 0 28px;
    font-weight: 500;
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 8px 12px;
  
  &:hover {
    box-shadow: 0 0 0 1px #d1d5db inset;
  }
  
  &.is-focus {
    box-shadow: 0 0 0 2px var(--el-color-primary) inset !important;
  }
}
</style>
