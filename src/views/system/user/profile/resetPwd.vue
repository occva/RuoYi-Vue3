<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="100px" label-position="left" class="profile-form">
      <el-form-item label="当前密码" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="请输入当前密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="请输入 6-20 位新密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="请再次输入新密码" type="password" show-password/>
      </el-form-item>
      <el-form-item class="form-actions">
         <el-button type="primary" @click="submit" class="submit-btn" :loading="loading">更新密码</el-button>
         <el-button @click="close" class="close-btn">取消</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { updateUserPwd } from "@/api/system/user"

const { proxy } = getCurrentInstance()
const loading = ref(false)

const user = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const rules = ref({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { validator: equalToPassword, trigger: "blur" }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      loading.value = true
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("修改成功")
        // 重置表单
        user.oldPassword = ''
        user.newPassword = ''
        user.confirmPassword = ''
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>

<style lang="scss" scoped>
.profile-form {
   max-width: 600px;
   padding-top: 10px;

   :deep(.el-form-item__label) {
      font-weight: 600;
      color: var(--el-text-color-regular);
   }

   :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
      border-radius: 8px;
      padding: 4px 12px;
      transition: all 0.3s;

      &:hover {
         box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }

      &.is-focus {
         box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
      }
   }

   .form-actions {
      margin-top: 40px;
      display: flex;
      gap: 12px;
      
      .submit-btn {
         padding: 0 24px;
         border-radius: 8px;
         font-weight: 600;
         height: 38px;
         box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
         transition: all 0.2s;

         &:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
         }
      }

      .close-btn {
         padding: 0 24px;
         border-radius: 8px;
         height: 38px;
         font-weight: 500;
         background: var(--el-fill-color-light);
         border: none;
         color: var(--el-text-color-regular);

         &:hover {
            background: var(--el-fill-color);
            color: var(--el-text-color-primary);
         }
      }
   }
}
</style>
