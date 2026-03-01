<template>
  <div class="app-container app-club-list">
    <el-card class="premium-card search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="社团名称" prop="clubName">
          <el-input
            v-model="queryParams.clubName"
            placeholder="请输入社团名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="社团分类" prop="categoryId">
          <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 200px">
            <el-option
              v-for="item in categoryOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="社团状态" clearable style="width: 150px">
            <el-option
              v-for="dict in club_status"
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
          <span class="title">社团列表</span>
          <div class="header-operations">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:club:add']"
            >新增</el-button>
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:club:remove']"
            >批量删除</el-button>
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['system:club:export']"
            >导出</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="clubList" @selection-change="handleSelectionChange" class="premium-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Logo" align="center" prop="logoUrl" width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.logoUrl" class="table-avatar" />
          </template>
        </el-table-column>
        <el-table-column label="社团名称" align="center" prop="clubName" :show-overflow-tooltip="true" />
        <el-table-column label="分类" align="center" prop="categoryName" />
        <el-table-column label="社长" align="center" prop="presidentName" />
        <el-table-column label="成员数" align="center" prop="memberCount">
          <template #default="scope">
            <span>{{ scope.row.memberCount }} / {{ scope.row.maxMembers || '∞' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="热门" align="center" prop="isPopular" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isPopular"
              active-value="1"
              inactive-value="0"
              @change="handlePopularChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="招新" align="center" prop="isRecruiting" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isRecruiting === '1' ? 'success' : 'info'" size="small">
              {{ scope.row.isRecruiting === '1' ? '进行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="club_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:club:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:club:remove']"
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

    <!-- 添加或修改社团对话框 -->
    <el-dialog :title="title" v-model="open" width="80%" append-to-body class="premium-dialog club-edit-dialog">
      <div class="dialog-content-wrapper">
        <el-form ref="clubRef" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="30">
            <!-- Left Side: Images -->
            <el-col :span="6">
              <div class="image-upload-section">
                <el-form-item label="社团Logo" label-position="top">
                  <image-upload v-model="form.logoUrl" :limit="1" />
                </el-form-item>
                <el-form-item label="封面图" label-position="top" class="mt-20">
                  <image-upload v-model="form.coverUrl" :limit="1" />
                </el-form-item>
              </div>
            </el-col>

            <!-- Right Side: Form Fields -->
            <el-col :span="18">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="社团名称" prop="clubName">
                    <el-input v-model="form.clubName" placeholder="请输入社团名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
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
                </el-col>
                <el-col :span="12">
                  <el-form-item label="社团编码" prop="clubCode">
                    <el-input v-model="form.clubCode" placeholder="请输入社团编码" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="社长姓名">
                    <el-input v-model="form.presidentName" placeholder="请输入社长姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="最大成员数" prop="maxMembers">
                    <el-input-number v-model="form.maxMembers" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="显示顺序" prop="sortOrder">
                    <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="招新状态">
                    <el-select v-model="form.isRecruiting" style="width: 100%">
                      <el-option label="招新中" value="1" />
                      <el-option label="停止招新" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                      <el-radio
                        v-for="dict in club_status"
                        :key="dict.value"
                        :value="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="活动地点" prop="location">
                    <el-input v-model="form.location" placeholder="请输入活动地点" icon="Location" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="社团简介" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入简介" />
                  </el-form-item>
                </el-col>
              </el-row>
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

<script setup name="ClubList">
import { listClub, getClub, delClub, addClub, updateClub, updateClubPopular, exportClub } from "@/api/club/club";
import { listCategory } from "@/api/club/category";

const { proxy } = getCurrentInstance();
const { club_status } = proxy.useDict('club_status');

const clubList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clubName: undefined,
    categoryId: undefined,
    status: undefined
  },
  rules: {
    clubName: [{ required: true, message: "社团名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "社团分类不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询社团列表 */
function getList() {
  loading.value = true;
  listClub(queryParams.value).then(response => {
    clubList.value = response.rows;
    total.value = Number(response.total) || 0;
    loading.value = false;
  });
}

/** 查询分类下拉列表 */
function getCategoryList() {
  listCategory().then(response => {
    categoryOptions.value = response.data;
  });
}


/** 热门状态修改 */
function handlePopularChange(row) {
  let text = row.isPopular === "1" ? "开启" : "关闭";
  proxy.$modal.confirm('确认要"' + text + '""' + row.clubName + '"的热门状态吗？').then(function () {
    return updateClubPopular([row.clubId], row.isPopular);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.isPopular = row.isPopular === "1" ? "0" : "1";
  });
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.clubId);
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
    clubId: undefined,
    clubName: undefined,
    clubCode: undefined,
    categoryId: undefined,
    description: undefined,
    logoUrl: undefined,
    coverUrl: undefined,
    maxMembers: 0,
    isRecruiting: "1",
    isPopular: "0",
    status: "0",
    location: undefined,
    sortOrder: 0
  };
  proxy.resetForm("clubRef");
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
  title.value = "添加社团";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const clubId = row.clubId || ids.value;
  getClub(clubId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改社团";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["clubRef"].validate(valid => {
    if (valid) {
      if (form.value.clubId != undefined) {
        updateClub(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addClub(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const clubIds = row.clubId || ids.value;
  proxy.$modal.confirm('是否确认删除社团编号为"' + clubIds + '"的数据项？').then(function() {
    return delClub(clubIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/club/export', {
    ...queryParams.value
  }, `club_${new Date().getTime()}.xlsx`)
}

getCategoryList();
getList();
</script>

<style lang="scss" scoped>
.app-club-list {
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
    transition: all 0.3s ease;
    background: var(--el-bg-color-overlay);

    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }

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
          color: #303133;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .header-operations {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .premium-table {
    border-radius: 12px;
    overflow: hidden;
    
    :deep(th.el-table__cell) {
      background-color: var(--el-fill-color-light);
      color: #606266;
      font-weight: 600;
      height: 50px;
    }
    
    :deep(.el-table__row) {
      height: 60px;
      transition: all 0.2s;
      
      &:hover > td {
        background-color: var(--el-fill-color) !important;
      }
    }

    .table-avatar {
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }

  .premium-tag {
    border-radius: 100px;
    padding: 0 12px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
}

:deep(.club-edit-dialog) {
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

      .mt-20 {
        margin-top: 20px;
      }
    }
    
    .el-form-item__label {
      font-weight: 600;
      color: #334155;
    }
  }
}
</style>
