<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px" class="reset-pwd-form">
      <el-form-item label="旧密码" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password />
      </el-form-item>
      <el-form-item class="form-actions">
         <el-button type="primary" @click="submit" class="submit-btn">修改密码</el-button>
         <el-button @click="close" class="close-btn">关闭</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { updateUserPwd } from "@/api/user/profile";

const { proxy } = getCurrentInstance();
const user = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const equalToPassword = (rule, value, callback) => {
  if (user.value.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = ref({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [{ required: true, message: "新密码不能为空", trigger: "blur" }, { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "确认密码不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.value.oldPassword, user.value.newPassword).then(response => {
        proxy.$modal.msgSuccess("修改成功");
      });
    }
  });
};

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};
</script>

<style lang="scss" scoped>
.reset-pwd-form {
   max-width: 400px;
   
   .el-form-item {
      margin-bottom: 16px;
      flex-direction: column;
      align-items: flex-start;
      
      :deep(.el-form-item__label) {
         height: 24px;
         line-height: 24px;
         font-size: 13px;
         color: rgba(55, 53, 47, 0.5);
         padding: 0;
         margin-bottom: 4px;
         text-align: left;
      }
   }
   
   :deep(.el-input__wrapper) {
      background-color: #f7f7f5;
      box-shadow: none !important;
      border: 1px solid transparent;
      border-radius: 4px;
      padding: 4px 12px;
      
      &:hover, &.is-focus {
         border-color: rgba(55, 53, 47, 0.16);
      }
   }
   
   .form-actions {
      margin-top: 24px;
      
      .submit-btn {
         background: #2383e2;
         border: none;
         padding: 0 16px;
         height: 32px;
         font-size: 14px;
         border-radius: 4px;
         color: white;
         
         &:hover { background: #0070df; }
      }
      
      .close-btn {
         display: none; // 在弹窗模式下不需要此按钮
      }
   }
}
</style>
