<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
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
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
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
    left: -10%;
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
    right: -10%;
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

.login-form {
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

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #909399;
}

.login-code {
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

.el-login-footer {
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

.login-code-img {
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
