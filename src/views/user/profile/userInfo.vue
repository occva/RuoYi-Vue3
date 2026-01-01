<template>
   <el-form ref="userRef" :model="user" :rules="rules" label-width="80px" class="user-info-form">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="user.nickName" maxlength="30" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
         <el-input v-model="user.phonenumber" maxlength="11" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
         <el-input v-model="user.email" maxlength="50" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="性别">
         <el-radio-group v-model="user.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item class="form-actions">
         <el-button type="primary" @click="submit" class="submit-btn">保存修改</el-button>
         <el-button @click="close" class="close-btn">关闭</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { updateUserProfile } from "@/api/user/profile";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
});

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(props.user).then(response => {
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
.user-info-form {
   max-width: 500px;
   
   .el-form-item {
      margin-bottom: 25px;
   }
   
   :deep(.el-input__wrapper) {
      border-radius: 8px;
   }
   
   .form-actions {
      margin-top: 40px;
      
      .submit-btn {
         padding: 10px 30px;
         border-radius: 8px;
         font-weight: 600;
      }
      
      .close-btn {
         padding: 10px 30px;
         border-radius: 8px;
      }
   }
}
</style>
