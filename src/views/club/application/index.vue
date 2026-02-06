<template>
  <div class="app-container app-application">
    <el-card class="premium-card search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="社团名称" prop="clubName">
          <el-input v-model="queryParams.clubName" placeholder="请输入社团名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="申请人" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder="请输入用户昵称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="审核状态" clearable style="width: 200px">
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

    <el-card class="premium-card table-card">
      <template #header>
        <div class="card-header">
          <span class="title">入社申请管理</span>
          <div class="header-operations">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['club:application:remove']">批量删除</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="applicationList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="社团" align="center" prop="clubName" width="150" />
        <el-table-column label="申请人" align="center" width="200">
          <template #default="scope">
            <div class="user-info">
              <span class="name">{{ scope.row.realName }}</span>
              <span class="sub">({{ scope.row.nickName }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学号" align="center" prop="studentId" width="120" />
        <el-table-column label="专业班级" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.major }} {{ scope.row.className }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" align="center" prop="applicationTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.applicationTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <dict-tag :options="application_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="InfoFilled" @click="handleDetail(scope.row)">详情</el-button>
            <el-button link type="success" icon="Checked" v-if="scope.row.status === '0'" @click="handleReview(scope.row)" v-hasPermi="['club:application:review']">审核</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['club:application:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog title="申请详情" v-model="detailOpen" width="700px" append-to-body class="premium-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="真实姓名">{{ form.realName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ form.studentId }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ form.gender == '0' ? '男' : (form.gender == '1' ? '女' : '未知') }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ form.phone }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ form.major }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ form.className }}</el-descriptions-item>
        <el-descriptions-item label="自我介绍" :span="2">{{ form.selfIntroduction }}</el-descriptions-item>
        <el-descriptions-item label="申请理由" :span="2">{{ form.applyReason }}</el-descriptions-item>
        <el-descriptions-item label="特长" :span="2">{{ form.specialSkills }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="form.status !== '0'" class="review-result mt20">
        <h4>审核信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审核人">{{ form.reviewerName }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ parseTime(form.reviewTime) }}</el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="2">{{ form.reviewComment }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="审核申请" v-model="reviewOpen" width="500px" append-to-body class="premium-dialog">
      <el-form ref="reviewRef" :model="reviewForm" label-width="80px">
        <el-form-item label="审批结果">
          <el-radio-group v-model="reviewForm.status">
            <el-radio label="1">通过 (加入社团)</el-radio>
            <el-radio label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="reviewForm.reviewComment" type="textarea" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="premium-btn secondary" @click="reviewOpen = false">取 消</el-button>
          <el-button class="premium-btn primary" type="primary" @click="submitReview">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ClubApplication">
import { listApplication, getApplication, reviewApplication, delApplication } from "@/api/club/application";

const { proxy } = getCurrentInstance();
const { application_status } = proxy.useDict('application_status');

const applicationList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);
const multiple = ref(true);

const detailOpen = ref(false);
const reviewOpen = ref(false);

const data = reactive({
  form: {},
  reviewForm: {
    applicationId: undefined,
    status: '1',
    reviewComment: ''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubName: undefined,
    nickName: undefined,
    status: undefined
  }
});

const { queryParams, form, reviewForm } = toRefs(data);

function getList() {
  loading.value = true;
  listApplication(queryParams.value).then(response => {
    applicationList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}


function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.applicationId);
  multiple.value = !selection.length;
}

function handleDetail(row) {
  form.value = row;
  detailOpen.value = true;
}

function handleReview(row) {
  reviewForm.value.applicationId = row.applicationId;
  reviewForm.value.status = '1';
  reviewForm.value.reviewComment = '';
  reviewOpen.value = true;
}

function submitReview() {
  reviewApplication(reviewForm.value).then(response => {
    proxy.$modal.msgSuccess("审核完成");
    reviewOpen.value = false;
    getList();
  });
}

function handleDelete(row) {
  const applicationIds = row.applicationId || ids.value;
  proxy.$modal.confirm('是否确认删除选中的申请记录？').then(function() {
    return delApplication(applicationIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  });
}

getList();
</script>

<style lang="scss" scoped>
.app-application {
  background-color: #f7f9fb;
  min-height: calc(100vh - 84px);
  padding: 24px;

  .search-card { margin-bottom: 20px; }
  .premium-card {
    border: none; border-radius: 20px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    background: #ffffff;
    :deep(.el-card__header) {
      padding: 20px 24px; border-bottom: 1px solid var(--el-border-color-lighter);
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title { font-size: 18px; font-weight: 700; }
        .header-operations {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }
  }

  .user-info {
    display: flex; flex-direction: column; align-items: center;
    .name { font-weight: 600; color: #303133; }
    .sub { font-size: 12px; color: #909399; }
  }

  .premium-table { border-radius: 12px; overflow: hidden; }
  .mt20 { margin-top: 20px; }
}
</style>
