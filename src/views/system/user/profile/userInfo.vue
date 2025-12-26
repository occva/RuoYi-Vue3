<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="100px" label-position="left" class="profile-form">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
         <el-input v-model="form.email" maxlength="50" placeholder="请输入邮箱地址" />
      </el-form-item>
      <el-form-item label="性别">
         <el-radio-group v-model="form.sex" class="custom-radio-group">
            <el-radio border value="0">男</el-radio>
            <el-radio border value="1">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item class="form-actions">
         <el-button type="primary" @click="submit" class="submit-btn" :loading="loading">保存修改</el-button>
         <el-button @click="close" class="close-btn">关闭页面</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import { updateUserProfile } from "@/api/system/user"

const props = defineProps({
  user: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const loading = ref(false)
const form = ref({})
const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
})

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      loading.value = true
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功")
        props.user.nickName = form.value.nickName
        props.user.phonenumber = form.value.phonenumber
        props.user.email = form.value.email
        props.user.sex = form.value.sex
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

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
  }
},{ immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.profile-form {
   max-width: 600px;

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

   .custom-radio-group {
      :deep(.el-radio) {
         margin-right: 12px;
         border-radius: 8px;
         transition: all 0.3s;
         
         &.is-bordered.is-checked {
            background-color: var(--el-color-primary-light-9);
         }
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
