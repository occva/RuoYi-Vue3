<template>
  <div class="app-container">
    <el-card class="mb8">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="社团名称" prop="clubName">
          <el-input
            v-model="queryParams.clubName"
            placeholder="请输入社团名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="申请人" prop="applicantNickName">
          <el-input
            v-model="queryParams.applicantNickName"
            placeholder="请输入申请人昵称"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 180px">
            <el-option
              v-for="dict in application_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>新社团申请管理</span>
          <div>
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['club:createApply:remove']"
            >
              批量删除
            </el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="社团名称" align="center" prop="clubName" min-width="160" show-overflow-tooltip />
        <el-table-column label="分类" align="center" prop="categoryName" width="120" />
        <el-table-column label="申请人" align="center" width="180">
          <template #default="scope">
            <div>{{ scope.row.applicantNickName }}</div>
            <div class="sub-text">@{{ scope.row.applicantUserName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" align="center" prop="contactPhone" width="130" />
        <el-table-column label="申请时间" align="center" prop="applyTime" width="170">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.applyTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="110">
          <template #default="scope">
            <dict-tag :options="application_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="社长后台账号" align="center" prop="adminUserName" width="150" />
        <el-table-column label="操作" align="center" width="240">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
            <el-button
              link
              type="success"
              icon="CircleCheck"
              v-if="scope.row.status === '0'"
              @click="handleReview(scope.row)"
              v-hasPermi="['club:createApply:review']"
            >
              审核
            </el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['club:createApply:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog title="申请详情" v-model="detailOpen" width="860px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="社团名称">{{ form.clubName }}</el-descriptions-item>
        <el-descriptions-item label="社团分类">{{ form.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ form.applicantNickName }} (@{{ form.applicantUserName }})</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ form.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="指导老师">{{ form.advisorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="指导老师联系方式">{{ form.advisorContact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ proxy.parseTime(form.applyTime) }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <dict-tag :options="application_status" :value="form.status" />
        </el-descriptions-item>
        <el-descriptions-item label="社团简介" :span="2">
          <pre class="pre">{{ form.description || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="申请理由" :span="2">
          <pre class="pre">{{ form.applyReason || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="活动规划" :span="2">
          <pre class="pre">{{ form.activityPlan || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="核心成员说明" :span="2">
          <pre class="pre">{{ form.coreMembers || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="审核人">{{ form.reviewerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ proxy.parseTime(form.reviewTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ form.reviewComment || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建社团ID">{{ form.approvedClubId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="社长后台账号">{{ form.adminUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="初始密码" :span="2">{{ form.adminInitPassword || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailOpen = false">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="审核申请" v-model="reviewOpen" width="500px" append-to-body>
      <el-form ref="reviewRef" :model="reviewForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="1">通过</el-radio>
            <el-radio value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="reviewForm.reviewComment" type="textarea" :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewOpen = false">取消</el-button>
        <el-button type="primary" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ClubCreateApply">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { listClubApply, getClubApply, reviewClubApply, delClubApply } from '@/api/club/clubApply'

const { proxy } = getCurrentInstance()
const { application_status } = proxy.useDict('application_status')

const list = ref([])
const loading = ref(false)
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)

const detailOpen = ref(false)
const reviewOpen = ref(false)

const data = reactive({
  form: {},
  reviewForm: {
    applyId: undefined,
    status: '1',
    reviewComment: ''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubName: undefined,
    applicantNickName: undefined,
    status: undefined
  }
})

const { queryParams, form, reviewForm } = toRefs(data)

function getList() {
  loading.value = true
  listClubApply(queryParams.value).then(res => {
    list.value = res.rows || []
    total.value = Number(res.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.applyId)
  multiple.value = !selection.length
}

function handleDetail(row) {
  getClubApply(row.applyId).then(res => {
    form.value = res.data || {}
    detailOpen.value = true
  })
}

function handleReview(row) {
  reviewForm.value.applyId = row.applyId
  reviewForm.value.status = '1'
  reviewForm.value.reviewComment = ''
  reviewOpen.value = true
}

function submitReview() {
  reviewClubApply(reviewForm.value).then(() => {
    proxy.$modal.msgSuccess('审核完成')
    reviewOpen.value = false
    getList()
  })
}

function handleDelete(row) {
  const applyIds = row.applyId || ids.value
  proxy.$modal.confirm('是否确认删除选中的申请记录？').then(function() {
    return delClubApply(applyIds)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  })
}

getList()
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-text {
  color: #909399;
  font-size: 12px;
}

.pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.6;
}
</style>
