<template>
  <div class="app-container app-registration">
    <el-card class="premium-card search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
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
          <span class="title">活动报名与签到</span>
          <div class="header-operations">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['club:registration:remove']">批量移除</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table :data="registrationList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
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
        <el-table-column label="签到状态" align="center" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.checkInStatus"
              active-value="1"
              inactive-value="0"
              active-text="已签到"
              inactive-text="未签到"
              inline-prompt
              @change="handleCheckInStatusChange(scope.row)"
              v-hasPermi="['club:registration:edit']"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['club:registration:remove']">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="ClubRegistration">
import { listRegistration, updateRegistration, delRegistration } from "@/api/club/registration";

const { proxy } = getCurrentInstance();
const { activity_checkin_status } = proxy.useDict('activity_checkin_status');

const registrationList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);
const multiple = ref(true);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityTitle: undefined,
    nickName: undefined,
    checkInStatus: undefined
  }
});

const { queryParams } = toRefs(data);

function getList() {
  loading.value = true;
  listRegistration(queryParams.value).then(response => {
    registrationList.value = response.rows;
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
  ids.value = selection.map(item => item.registrationId);
  multiple.value = !selection.length;
}

function handleCheckInStatusChange(row) {
  const text = row.checkInStatus === "1" ? "进行签到" : "取消签到";
  proxy.$modal.confirm('确认要对该成员"' + text + '"吗？').then(function() {
    return updateRegistration({
      registrationId: row.registrationId,
      checkInStatus: row.checkInStatus,
      checkInTime: row.checkInStatus === '1' ? new Date() : null
    });
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
    getList();
  }).catch(function() {
    row.checkInStatus = row.checkInStatus === "1" ? "0" : "1";
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

getList();
</script>

<style lang="scss" scoped>
.app-registration {
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
  .user-block {
    display: flex; flex-direction: column;
    .name { font-weight: 600; color: #303133; }
    .id { font-size: 11px; color: #909399; }
  }
  .premium-table { border-radius: 12px; overflow: hidden; }
}
</style>
