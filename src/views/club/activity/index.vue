<template>
  <div class="app-container app-activity">
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
          <el-input
            v-model="queryParams.activityTitle"
            placeholder="请输入活动名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="活动类型" prop="activityType">
          <el-select v-model="queryParams.activityType" placeholder="活动类型" clearable style="width: 150px">
            <el-option
              v-for="dict in activity_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="活动状态" clearable style="width: 150px">
            <el-option
              v-for="dict in activity_status"
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
          <span class="title">社团活动列表</span>
          <div class="header-operations">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:activity:add']"
            >发布活动</el-button>
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:activity:remove']"
            >批量删除</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="所属社团" align="center" prop="clubName" width="130" />
        <el-table-column label="封面" align="center" prop="coverUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.coverUrl" :width="60" :height="40" />
          </template>
        </el-table-column>
        <el-table-column label="活动名称" align="left" prop="activityTitle" :show-overflow-tooltip="true">
          <template #default="scope">
            <span class="activity-title">{{ scope.row.activityTitle }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" align="center" prop="startTime" width="280">
          <template #default="scope">
            <div class="time-range">
              <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}') }}</span>
              <span class="separator">至</span>
              <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}') || '不限' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="地点" align="center" prop="location" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="人数限制" align="center" width="100">
          <template #default="scope">
            <span>{{ scope.row.currentParticipants }} / {{ scope.row.maxParticipants || '∞' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <dict-tag :options="activity_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:activity:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:activity:remove']"
            >删除</el-button>
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

    <!-- 发布/修改活动对话框 -->
    <el-dialog :title="title" v-model="open" width="80%" append-to-body class="premium-dialog activity-edit-dialog">
      <div class="dialog-content-wrapper">
        <el-form ref="activityRef" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="30">
            <!-- Top Section: Image vs Info -->
            <el-col :span="6">
              <div class="image-upload-section">
                <el-form-item label="活动封面" label-position="top">
                  <image-upload v-model="form.coverUrl" :limit="1" />
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="18">
              <el-row :gutter="20">
                <el-col :span="12">
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
                </el-col>
                <el-col :span="12">
                  <el-form-item label="活动类型" prop="activityType">
                    <el-select v-model="form.activityType" placeholder="请选择类型" style="width: 100%">
                      <el-option
                        v-for="dict in activity_type"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="活动名称" prop="activityTitle">
                    <el-input v-model="form.activityTitle" placeholder="请输入活动名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="活动地点" prop="location">
                    <el-input v-model="form.location" placeholder="请输入活动地点" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker
                      v-model="form.startTime"
                      type="datetime"
                      placeholder="开始时间"
                      style="width: 100%"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker
                      v-model="form.endTime"
                      type="datetime"
                      placeholder="结束时间"
                      style="width: 100%"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="人数上限" prop="maxParticipants">
                    <el-input-number v-model="form.maxParticipants" :min="0" style="width: 100%" />
                    <div class="form-tip">0 表示不限制</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="活动状态" prop="status">
                    <el-select v-model="form.status" placeholder="状态" style="width: 100%">
                      <el-option
                        v-for="dict in activity_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>

            <!-- Bottom Section: Editor and Remark -->
            <el-col :span="24">
              <el-form-item label="活动详情">
                <editor v-model="form.description" :min-height="240" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="premium-btn secondary" @click="cancel">取 消</el-button>
          <el-button class="premium-btn primary" type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ClubActivity">
import { listActivity, getActivity, delActivity, addActivity, updateActivity } from "@/api/club/activity";
import { listClub } from "@/api/club/club";

const { proxy } = getCurrentInstance();
const { activity_type, activity_status } = proxy.useDict('activity_type', 'activity_status');

const activityList = ref([]);
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
    activityTitle: undefined,
    activityType: undefined,
    status: undefined
  },
  rules: {
    clubId: [{ required: true, message: "所属社团不能为空", trigger: "change" }],
    activityTitle: [{ required: true, message: "活动名称不能为空", trigger: "blur" }],
    location: [{ required: true, message: "活动地点不能为空", trigger: "blur" }],
    startTime: [{ required: true, message: "开始时间不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询活动列表 */
function getList() {
  loading.value = true;
  listActivity(queryParams.value).then(response => {
    activityList.value = response.rows;
    total.value = Number(response.total) || 0;
    loading.value = false;
  });
}

/** 查询社团下拉 */
function getClubList() {
  listClub({ pageSize: 1000 }).then(response => {
    clubOptions.value = response.rows;
  });
}


/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.activityId);
  multiple.value = !selection.length;
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    activityId: undefined,
    clubId: undefined,
    activityTitle: undefined,
    activityType: '1',
    description: undefined,
    coverUrl: undefined,
    location: undefined,
    startTime: undefined,
    endTime: undefined,
    maxParticipants: 0,
    status: '0',
    remark: undefined
  };
  proxy.resetForm("activityRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "发布活动";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const activityId = row.activityId || ids.value;
  getActivity(activityId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改活动";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["activityRef"].validate(valid => {
    if (valid) {
      if (form.value.activityId != undefined) {
        updateActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("发布成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除活动编号为"' + activityIds + '"的数据项？').then(function() {
    return delActivity(activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getClubList();
getList();
</script>

<style lang="scss" scoped>
.app-activity {
  background-color: var(--app-main-bg);
  min-height: calc(100vh - 84px);
  padding: 24px;

  .search-card {
    margin-bottom: 20px;
  }

  .premium-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    background: var(--el-bg-color-overlay);

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

        .header-operations {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }
  }

  .activity-title {
    font-weight: 600;
    color: #303133;
  }

  .time-range {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.4;
    font-size: 13px;
    
    .separator {
      color: #909399;
      font-size: 11px;
      margin: 2px 0;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .premium-table {
    border-radius: 12px;
    overflow: hidden;
  }
}

:deep(.activity-edit-dialog) {
  .el-dialog {
    height: 80vh;
    display: flex;
    flex-direction: column;
    margin-top: 10vh !important;
    
    .el-dialog__body {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
    }

    .dialog-content-wrapper {
      height: 100%;
    }

    .image-upload-section {
      background: var(--el-fill-color-light);
      padding: 20px;
      border-radius: 12px;
      border: 1px dashed #e2e8f0;
    }
    
    .el-form-item__label {
      font-weight: 600;
      color: #334155;
    }
  }
}
</style>
