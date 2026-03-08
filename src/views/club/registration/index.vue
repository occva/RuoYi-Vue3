<template>
  <div class="app-container app-registration">
    <el-card class="premium-card search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="社团" prop="clubId">
          <el-select v-model="queryParams.clubId" placeholder="选择社团" clearable style="width: 200px">
            <el-option
              v-for="item in clubOptions"
              :key="item.clubId"
              :label="item.clubName"
              :value="item.clubId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityTitle">
          <el-input v-model="queryParams.activityTitle" placeholder="活动名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="参与人" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder="参与人昵称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="签到状态" prop="checkInStatus">
          <el-select v-model="queryParams.checkInStatus" placeholder="签到状态" clearable style="width: 150px">
            <el-option
              v-for="dict in activity_checkin_status"
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

    <el-card class="premium-card table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">活动签到管理</span>
          <div class="header-operations">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['club:registration:remove']">批量移除</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table :data="registrationList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="所属社团" align="center" prop="clubName" width="180" :show-overflow-tooltip="true" />
        <el-table-column label="活动标题" align="center" prop="activityTitle" :show-overflow-tooltip="true" />
        <el-table-column label="参与人" align="center">
          <template #default="scope">
            <div class="user-block">
              <span class="name">{{ scope.row.nickName }}</span>
              <span class="id">({{ scope.row.studentId }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" align="center" prop="phone" width="120" />
        <el-table-column label="报名时间" align="center" prop="registrationTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.registrationTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="签到时间" align="center" prop="checkInTime" width="160">
          <template #default="scope">
            <span>{{ scope.row.checkInTime ? parseTime(scope.row.checkInTime) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="签到状态" align="center" width="120">
          <template #default="scope">
            <dict-tag :options="activity_checkin_status" :value="scope.row.checkInStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              v-if="scope.row.checkInStatus !== '1' && scope.row.status !== '2'"
              link
              type="primary"
              icon="Select"
              @click="handleCheckin(scope.row)"
              v-hasPermi="['club:registration:edit']"
            >
              手动签到
            </el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['club:registration:remove']">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="ClubRegistration">
import { listRegistration, checkin, delRegistration } from "@/api/club/registration";
import { listClub } from "@/api/club/club";

const { proxy } = getCurrentInstance();
const { activity_checkin_status } = proxy.useDict('activity_checkin_status');

const registrationList = ref([]);
const clubOptions = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);
const multiple = ref(true);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubId: undefined,
    activityTitle: undefined,
    nickName: undefined,
    checkInStatus: undefined
  }
});

const { queryParams } = toRefs(data);

function getClubOptions() {
  return listClub({ pageSize: 1000 }).then(response => {
    clubOptions.value = response.rows || [];
    applyDefaultClubFilter();
  }).catch(() => {
    clubOptions.value = [];
  });
}

function applyDefaultClubFilter() {
  if (!queryParams.value.clubId && clubOptions.value.length > 0) {
    queryParams.value.clubId = clubOptions.value[0].clubId;
  }
}

function getList() {
  loading.value = true;
  listRegistration(queryParams.value).then(response => {
    registrationList.value = response.rows;
    total.value = Number(response.total) || 0;
    loading.value = false;
  });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  applyDefaultClubFilter();
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.registrationId);
  multiple.value = !selection.length;
}

function handleCheckin(row) {
  proxy.$modal.confirm('确认要为该成员执行签到吗？').then(function() {
    return checkin(row.registrationId);
  }).then(() => {
    proxy.$modal.msgSuccess("签到成功");
    getList();
  });
}

function handleDelete(row) {
  const regIds = row.registrationId || ids.value;
  proxy.$modal.confirm('是否确认移除选中的报名记录？').then(function() {
    return delRegistration(regIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("移除成功");
  });
}

async function initPage() {
  await getClubOptions();
  getList();
}

initPage();
</script>

<style lang="scss" scoped>
.app-registration {
  background-color: var(--app-main-bg);
  min-height: calc(100vh - 84px);
  padding: 24px;
  .search-card { margin-bottom: 20px; }
  .premium-card {
    border: none; border-radius: 20px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    background: var(--el-bg-color-overlay);
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
  .user-block {
    display: flex; flex-direction: column;
    .name { font-weight: 600; color: #303133; }
    .id { font-size: 11px; color: #909399; }
  }
  .premium-table { border-radius: 12px; overflow: hidden; }
}
</style>
