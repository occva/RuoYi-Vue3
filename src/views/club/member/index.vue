<template>
  <div class="app-container app-member">
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
        <el-form-item label="成员昵称" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="角色" prop="roleType">
          <el-select v-model="queryParams.roleType" placeholder="成员角色" clearable style="width: 150px">
            <el-option
              v-for="dict in club_role_type"
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
          <span class="title">社团成员管理</span>
          <div class="header-operations">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['club:member:remove']">批量移除</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="成员" align="center" width="220">
          <template #default="scope">
            <div class="member-profile">
              <el-avatar :size="40" :src="getImgUrl(scope.row.avatar)" />
              <div class="info">
                <span class="nick">{{ scope.row.nickName }}</span>
                <span class="user">@{{ scope.row.userName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属社团" align="center" prop="clubName" />
        <el-table-column label="角色" align="center" prop="roleType" width="120">
          <template #default="scope">
            <dict-tag :options="club_role_type" :value="scope.row.roleType" />
          </template>
        </el-table-column>
        <el-table-column label="入社时间" align="center" prop="joinTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.joinTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <dict-tag :options="club_member_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['club:member:edit']">设置</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['club:member:remove']">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 成员设置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body class="premium-dialog">
      <el-form ref="memberRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="成员昵称">
          <el-input :value="form.nickName" disabled />
        </el-form-item>
        <el-form-item label="成员角色" prop="roleType">
          <el-select v-model="form.roleType" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="dict in club_role_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in club_member_status"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="premium-btn secondary" @click="cancel">取 消</el-button>
          <el-button class="premium-btn primary" type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ClubMember">
import { listMember, getMember, delMember, updateMember } from "@/api/club/member";
import { listClub } from "@/api/club/club";
import { getImgUrl } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance();
const { club_role_type, club_member_status } = proxy.useDict('club_role_type', 'club_member_status');

const memberList = ref([]);
const clubOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);
const multiple = ref(true);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubId: undefined,
    nickName: undefined,
    roleType: undefined
  },
  rules: {
    roleType: [{ required: true, message: "角色不能为空", trigger: "change" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  listMember(queryParams.value).then(response => {
    memberList.value = response.rows;
    total.value = Number(response.total) || 0;
    loading.value = false;
  });
}

function getClubList() {
  listClub({ pageSize: 1000 }).then(response => {
    clubOptions.value = response.rows;
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
  ids.value = selection.map(item => item.memberId);
  multiple.value = !selection.length;
}

function cancel() {
  open.value = false;
  reset();
}

function reset() {
  form.value = {
    memberId: undefined,
    roleType: '3',
    status: '0',
    remark: undefined
  };
  proxy.resetForm("memberRef");
}

function handleUpdate(row) {
  reset();
  const memberId = row.memberId || ids.value;
  getMember(memberId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改成员属性";
  });
}

function submitForm() {
  proxy.$refs["memberRef"].validate(valid => {
    if (valid) {
      updateMember(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        open.value = false;
        getList();
      });
    }
  });
}

function handleDelete(row) {
  const memberIds = row.memberId || ids.value;
  proxy.$modal.confirm('是否确认移除选中的成员？').then(function() {
    return delMember(memberIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("移除成功");
  });
}

getClubList();
getList();
</script>

<style lang="scss" scoped>
.app-member {
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

  .member-profile {
    display: flex; align-items: center; gap: 12px; justify-content: flex-start;
    .info { display: flex; flex-direction: column; text-align: left; .nick { font-weight: 600; color: #303133; } .user { font-size: 11px; color: #909399; } }
  }

  .premium-table { border-radius: 12px; overflow: hidden; }
}
</style>
