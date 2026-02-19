<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="username">
        <el-input 
          v-model="registerForm.username" 
          type="text" 
          size="large" 
          auto-complete="off" 
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          size="large" 
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large" 
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(false)

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(res => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined
      ? true
      : res.captchaEnabled === true || res.captchaEnabled === "true"
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    } else {
      codeUrl.value = ""
      registerForm.value.uuid = ""
    }
  }).catch(() => {
    captchaEnabled.value = false
    codeUrl.value = ""
    registerForm.value.uuid = ""
    proxy.$modal.msgError("获取验证码失败，请稍后重试")
  })
}

getCode()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -10%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: linear-gradient(315deg, rgba(64, 158, 255, 0.08) 0%, rgba(64, 158, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
  }
}

.title {
  margin: 0 auto 40px auto;
  text-align: center;
  color: #2c3e50;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  
  &::after {
    content: "";
    width: 40px;
    height: 4px;
    background: #409eff;
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2px;
  }
}

.register-form {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  width: 420px;
  padding: 40px 35px 25px 35px;
  z-index: 1;
  transition: all 0.3s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  /* Scattered Shadow Effect */
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.04),
    0 20px 48px rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 20px 35px rgba(0, 0, 0, 0.06),
      0 30px 60px rgba(0, 0, 0, 0.06),
      0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .el-input {
    height: 45px;
    
    :deep(.el-input__wrapper) {
      background-color: #f5f7fa;
      box-shadow: none !important;
      border: 1px solid transparent;
      transition: all 0.2s;
      border-radius: 8px;

      &.is-focus {
        background-color: #fff;
        border-color: #409eff;
        box-shadow: 0 0 0 1px #409eff !important;
      }
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }

  .el-button--primary {
    height: 45px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    margin-top: 10px;
    background: linear-gradient(90deg, #409eff, #64b5f6);
    border: none;
    transition: all 0.3s;

    &:hover {
      opacity: 0.9;
      transform: scale(1.01);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #909399;
}

.register-code {
  width: 33%;
  height: 45px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
    border-radius: 8px;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 10px;
  width: 100%;
  text-align: center;
  color: #909399;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 45px;
  padding-left: 12px;
}

.link-type {
  color: #409eff;
  font-size: 13px;
  transition: color 0.2s;
  &:hover {
    color: #66b1ff;
  }
}
</style>
