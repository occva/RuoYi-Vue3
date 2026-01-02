<template>
  <div class="app-container app-achievement">
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
        <el-form-item label="荣誉标题" prop="achievementTitle">
          <el-input
            v-model="queryParams.achievementTitle"
            placeholder="请输入荣誉标题"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="荣誉级别" prop="level">
          <el-select v-model="queryParams.level" placeholder="荣誉级别" clearable style="width: 150px">
            <el-option label="校级" value="校级" />
            <el-option label="市级" value="市级" />
            <el-option label="省级" value="省级" />
            <el-option label="国家级" value="国家级" />
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
          <span class="title">社团荣誉列表</span>
          <div class="header-operations">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:achievement:add']"
            >颁发荣誉</el-button>
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:achievement:remove']"
            >批量撤销</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="achievementList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="所属社团" align="center" prop="clubName" width="150" />
        <el-table-column label="荣誉证书" align="center" prop="imageUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.imageUrl" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="荣誉标题" align="center" prop="achievementTitle" :show-overflow-tooltip="true">
          <template #default="scope">
            <span class="achievement-title">{{ scope.row.achievementTitle }}</span>
          </template>
        </el-table-column>
        <el-table-column label="级别" align="center" prop="level" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" effect="plain" class="pill-tag">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="achievementType" width="100">
          <template #default="scope">
            {{ getTypeName(scope.row.achievementType) }}
          </template>
        </el-table-column>
        <el-table-column label="获得日期" align="center" prop="achieveDate" width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.achieveDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:achievement:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:achievement:remove']"
            >撤销</el-button>
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

    <!-- 颁发/修改荣誉对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body class="premium-dialog">
      <el-form ref="achievementRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属社团" prop="clubId">
          <el-select v-model="form.clubId" placeholder="请选择社团" style="width: 100%">
            <el-option
              v-for="item in clubOptions"
              :key="item.clubId"
              :label="item.clubName"
              :value="item.clubId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="荣誉标题" prop="achievementTitle">
          <el-input v-model="form.achievementTitle" placeholder="请输入荣誉标题" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="荣誉级别" prop="level">
              <el-select v-model="form.level" placeholder="请选择级别" style="width: 100%">
                <el-option label="校级" value="校级" />
                <el-option label="市级" value="市级" />
                <el-option label="省级" value="省级" />
                <el-option label="国家级" value="国家级" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="荣誉类型" prop="achievementType">
              <el-select v-model="form.achievementType" placeholder="请选择类型" style="width: 100%">
                <el-option label="获奖证书" value="award" />
                <el-option label="竞赛荣誉" value="competition" />
                <el-option label="活动成就" value="activity" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="获得日期" prop="achieveDate">
          <el-date-picker
            v-model="form.achieveDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="详情描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入详情描述" />
        </el-form-item>
        <el-form-item label="荣誉照片">
          <image-upload v-model="form.imageUrl" :limit="1" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
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

<script setup name="ClubAchievement">
import { listAchievement, getAchievement, delAchievement, addAchievement, updateAchievement } from "@/api/club/achievement";
import { listClub } from "@/api/club/club";

const { proxy } = getCurrentInstance();

const achievementList = ref([]);
const clubOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubId: undefined,
    achievementTitle: undefined,
    level: undefined
  },
  rules: {
    clubId: [{ required: true, message: "所属社团不能为空", trigger: "change" }],
    achievementTitle: [{ required: true, message: "荣誉标题不能为空", trigger: "blur" }],
    level: [{ required: true, message: "荣誉级别不能为空", trigger: "change" }],
    achievementType: [{ required: true, message: "荣誉类型不能为空", trigger: "change" }],
    achieveDate: [{ required: true, message: "获得日期不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询列表 */
function getList() {
  loading.value = true;
  listAchievement(queryParams.value).then(response => {
    achievementList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询社团下拉 */
function getClubList() {
  listClub({ pageSize: 1000 }).then(response => {
    clubOptions.value = response.rows;
  });
}

/** 级别样式 */
function getLevelType(level) {
  const types = {
    '校级': 'info',
    '市级': 'primary',
    '省级': 'warning',
    '国家级': 'danger'
  };
  return types[level] || 'info';
}

/** 类型显示 */
function getTypeName(type) {
  const names = {
    'award': '获奖证书',
    'competition': '竞赛荣誉',
    'activity': '活动成就'
  };
  return names[type] || type;
}

/** 多选 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.achievementId);
  multiple.value = !selection.length;
}

/** 取消 */
function cancel() {
  open.value = false;
  reset();
}

/** 重置 */
function reset() {
  form.value = {
    achievementId: undefined,
    clubId: undefined,
    achievementTitle: undefined,
    achievementType: 'award',
    description: undefined,
    imageUrl: undefined,
    achieveDate: undefined,
    level: '校级',
    sortOrder: 0,
    status: '0'
  };
  proxy.resetForm("achievementRef");
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置搜索 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "授予荣誉";
}

/** 修改 */
function handleUpdate(row) {
  reset();
  const achievementId = row.achievementId || ids.value;
  getAchievement(achievementId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改荣誉信息";
  });
}

/** 提交 */
function submitForm() {
  proxy.$refs["achievementRef"].validate(valid => {
    if (valid) {
      if (form.value.achievementId != undefined) {
        updateAchievement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAchievement(form.value).then(response => {
          proxy.$modal.msgSuccess("授予成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除 */
function handleDelete(row) {
  const achievementIds = row.achievementId || ids.value;
  proxy.$modal.confirm('是否确认撤销选中的荣誉项？').then(function() {
    return delAchievement(achievementIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("撤销成功");
  }).catch(() => {});
}

getClubList();
getList();
</script>

<style lang="scss" scoped>
.app-achievement {
  background-color: #f7f9fb;
  min-height: calc(100vh - 84px);
  padding: 24px;

  .search-card {
    margin-bottom: 20px;
  }

  .premium-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    background: #ffffff;

    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title {
          font-size: 18px;
          font-weight: 700;
        }
      }
    }
  }

  .premium-table {
    border-radius: 12px;
    overflow: hidden;
    
    .achievement-title {
      font-weight: 600;
      color: #303133;
    }

    .pill-tag {
      border-radius: 100px;
      font-weight: 600;
      padding: 0 12px;
    }
  }
}
</style>
