<template>
  <div class="app-container app-category">
    <el-card class="premium-card search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="queryParams.categoryName"
            placeholder="请输入分类名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类编码" prop="categoryCode">
          <el-input
            v-model="queryParams.categoryCode"
            placeholder="请输入分类编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="分类状态" clearable style="width: 200px">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
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
          <span class="title">社团分类列表</span>
          <div class="header-operations">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:category:add']"
            >新增</el-button>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="categoryList" class="premium-table">
        <el-table-column label="分类编号" align="center" prop="categoryId" />
        <el-table-column label="分类名称" align="center" prop="categoryName" :show-overflow-tooltip="true" />
        <el-table-column label="分类编码" align="center" prop="categoryCode" :show-overflow-tooltip="true" />
        <el-table-column label="显示顺序" align="center" prop="sortOrder" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" class="premium-tag">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:category:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:category:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加或修改社团分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body class="premium-dialog">
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="ClubCategory">
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/club/category";

const { proxy } = getCurrentInstance();

const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    categoryName: undefined,
    categoryCode: undefined,
    status: undefined
  },
  rules: {
    categoryName: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
    categoryCode: [{ required: true, message: "分类编码不能为空", trigger: "blur" }],
    sortOrder: [{ required: true, message: "显示顺序不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询社团分类列表 */
function getList() {
  loading.value = true;
  listCategory(queryParams.value).then(response => {
    categoryList.value = response.data;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    categoryId: undefined,
    categoryName: undefined,
    categoryCode: undefined,
    sortOrder: 0,
    status: "0",
    remark: undefined
  };
  proxy.resetForm("categoryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
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
  title.value = "添加社团分类";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const categoryId = row.categoryId;
  getCategory(categoryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改社团分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.categoryId != undefined) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
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
  const categoryIds = row.categoryId;
  proxy.$modal.confirm('是否确认删除名称为"' + row.categoryName + '"的数据项？').then(function() {
    return delCategory(categoryIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

<style lang="scss" scoped>
.app-category {
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
    transition: all 0.3s ease;
    background: #ffffff;

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
      background-color: #f8f9fa;
      color: #606266;
      font-weight: 600;
      height: 50px;
    }
    
    :deep(.el-table__row) {
      height: 60px;
      transition: all 0.2s;
      
      &:hover > td {
        background-color: #f5f7fa !important;
      }
    }
  }

  .premium-tag {
    border-radius: 100px;
    padding: 0 12px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
}
</style>

<style lang="scss">
/* 全局弹窗样式优化 */
.el-overlay {
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.45) !important;
}

.premium-dialog {
  border-radius: 14px !important;
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.25) !important;
  overflow: hidden;

  .el-dialog__header {
    padding: 32px 32px 12px;
    margin-right: 0;
    border: none;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 700;
    }
  }

  .el-dialog__headerbtn {
    top: 24px;
    right: 24px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--el-fill-color-lighter);
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-color-danger-light-9);
      .el-dialog__close {
        color: var(--el-color-danger);
        transform: scale(1.1);
      }
    }
  }

  .el-dialog__body {
    padding: 20px 32px 32px;
  }

  .el-dialog__footer {
    padding: 0 32px 32px;
    border: none;
  }
}

.premium-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  height: 38px !important;
  transition: all 0.3s ease !important;

  &.primary {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3) !important;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4) !important;
    }
  }

  &.secondary {
    border: none !important;
    background-color: var(--el-fill-color-light) !important;
    color: var(--el-text-color-regular) !important;
    &:hover {
      background-color: var(--el-fill-color) !important;
      color: var(--el-text-color-primary) !important;
    }
  }
}
</style>
