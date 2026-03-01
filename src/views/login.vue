<template>
  <div class="auth-page login-page">
    <div class="auth-grid"></div>
    <div class="auth-orb auth-orb-left"></div>
    <div class="auth-orb auth-orb-right"></div>

    <div class="auth-shell">
      <div class="auth-card">
        <section class="auth-intro">
        <span class="intro-pill">校园社团平台</span>
        <h1 class="intro-title">欢迎回到社团中心</h1>
        <p class="intro-desc">在这里继续管理社团、报名活动、追踪你的校园成长记录。</p>
        <div class="intro-metrics">
          <article class="metric-card">
            <span class="metric-value">8+</span>
            <span class="metric-label">活跃社团</span>
          </article>
          <article class="metric-card">
            <span class="metric-value">3</span>
            <span class="metric-label">进行中活动</span>
          </article>
          <article class="metric-card">
            <span class="metric-value">24h</span>
            <span class="metric-label">通知同步</span>
          </article>
        </div>
        <div class="intro-links">
          <router-link to="/user/home" class="intro-link">返回首页</router-link>
          <router-link to="/register" class="intro-link intro-link-ghost">前往注册</router-link>
        </div>
        </section>

        <section class="auth-panel">
        <div class="panel-head">
          <h2 class="panel-title">{{ title }}</h2>
          <p class="panel-subtitle">登录后继续你的校园社团之旅</p>
        </div>

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="auth-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入账号"
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
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>

          <el-form-item v-if="captchaEnabled" prop="code">
            <div class="captcha-wrap">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="请输入验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <button type="button" class="captcha-box" @click="getCode">
                <img :src="codeUrl" alt="验证码" class="captcha-img" />
              </button>
            </div>
          </el-form-item>

          <div class="form-meta">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <router-link v-if="register" class="switch-link" :to="'/register'">立即注册</router-link>
          </div>

          <el-form-item class="submit-item">
            <el-button :loading="loading" size="large" type="primary" @click.prevent="handleLogin">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        </section>
      </div>
    </div>

    <div class="auth-footer">
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
const captchaEnabled = ref(false)
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
      userStore.login({ ...loginForm.value, clientType: 'admin' }).then(() => {
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
    captchaEnabled.value = res.captchaEnabled === undefined
      ? true
      : res.captchaEnabled === true || res.captchaEnabled === "true"
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    } else {
      codeUrl.value = ""
      loginForm.value.uuid = ""
    }
  }).catch(() => {
    captchaEnabled.value = false
    codeUrl.value = ""
    loginForm.value.uuid = ""
    proxy.$modal.msgError("获取验证码失败，请稍后重试")
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
.auth-page {
  --auth-primary: #1664ff;
  --auth-primary-soft: #4f7dff;
  --auth-bg-top: #edf3ff;
  --auth-bg-bottom: #f8fbff;
  height: 100vh;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: clamp(1.2rem, 3vw, 2rem) clamp(1rem, 4vw, 2.2rem) 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 8% 12%, rgba(17, 98, 255, 0.16), transparent 38%),
    radial-gradient(circle at 90% 8%, rgba(12, 201, 186, 0.14), transparent 36%),
    radial-gradient(circle at 56% 92%, rgba(17, 98, 255, 0.09), transparent 42%),
    linear-gradient(180deg, var(--auth-bg-top) 0%, var(--auth-bg-bottom) 58%, #ffffff 100%);
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(17, 98, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 98, 255, 0.05) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.32), transparent 84%);
  pointer-events: none;
}

.auth-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  pointer-events: none;
  animation: orbFloat 9s ease-in-out infinite;
}

.auth-orb-left {
  width: clamp(260px, 26vw, 360px);
  height: clamp(260px, 26vw, 360px);
  left: -8%;
  top: 18%;
  background: radial-gradient(circle, rgba(79, 125, 255, 0.3), rgba(79, 125, 255, 0));
}

.auth-orb-right {
  width: clamp(280px, 30vw, 420px);
  height: clamp(280px, 30vw, 420px);
  right: -10%;
  bottom: 2%;
  background: radial-gradient(circle, rgba(33, 168, 255, 0.24), rgba(33, 168, 255, 0));
  animation-delay: 2.4s;
}

.auth-shell {
  width: min(1120px, 100%);
  height: 70%;
  position: relative;
  z-index: 2;
  animation: shellEnter 520ms ease-out;
}

.auth-card {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
  align-items: stretch;
  border-radius: 24px;
  border: 1px solid rgba(184, 206, 244, 0.84);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 34px 66px -46px rgba(20, 70, 166, 0.92), 0 12px 28px -20px rgba(14, 72, 168, 0.4);
  backdrop-filter: blur(10px) saturate(118%);
  -webkit-backdrop-filter: blur(10px) saturate(118%);
  overflow: hidden;
}

.auth-intro {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1.5rem, 3.4vw, 2.7rem);
  background:
    radial-gradient(circle at 12% 12%, rgba(17, 98, 255, 0.12), transparent 45%),
    linear-gradient(180deg, rgba(248, 252, 255, 0.78) 0%, rgba(241, 247, 255, 0.7) 100%);
  border-right: 1px solid rgba(185, 207, 245, 0.7);
}

.intro-pill {
  width: fit-content;
  border-radius: 999px;
  padding: 0.46rem 0.88rem;
  font-size: 0.75rem;
  line-height: 1;
  font-weight: 700;
  color: #1140a1;
  border: 1px solid rgba(17, 64, 161, 0.17);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 26px -18px rgba(16, 64, 166, 0.8);
  margin-bottom: 1.1rem;
}

.intro-title {
  margin: 0;
  color: #0b1224;
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  font-weight: 800;
  max-width: 12ch;
}

.intro-desc {
  margin: 1.05rem 0 1.55rem;
  max-width: 48ch;
  color: #3a4864;
  line-height: 1.75;
  font-size: 1.02rem;
}

.intro-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.2rem;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.8rem 0.88rem;
  border-radius: 14px;
  border: 1px solid rgba(180, 203, 242, 0.8);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 40px -34px rgba(20, 70, 166, 0.6);
}

.metric-value {
  color: #1f3f8e;
  font-size: 1.35rem;
  line-height: 1.15;
  font-weight: 800;
}

.metric-label {
  color: #5f6f8f;
  font-size: 0.78rem;
  font-weight: 600;
}

.intro-links {
  display: flex;
  gap: 0.74rem;
}

.intro-link {
  height: 40px;
  border-radius: 12px;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  color: #ffffff;
  background: linear-gradient(135deg, var(--auth-primary) 0%, var(--auth-primary-soft) 100%);
  box-shadow: 0 14px 30px -20px rgba(21, 88, 225, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 26px -14px rgba(21, 88, 225, 0.8);
  }
}

.intro-link-ghost {
  color: #29437a;
  border: 1px solid rgba(156, 180, 232, 0.56);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: none;
}

.auth-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.86);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1.35rem, 3vw, 2rem);
}

.panel-head {
  margin-bottom: 1.2rem;
}

.panel-title {
  margin: 0;
  color: #0d1e45;
  font-size: 1.42rem;
  font-weight: 700;
}

.panel-subtitle {
  margin: 0.45rem 0 0;
  color: #5f6f8f;
  font-size: 0.92rem;
}

.auth-form {
  :deep(.el-form-item) {
    margin-bottom: 0.98rem;
  }

  :deep(.el-form-item__content) {
    line-height: 1;
    min-height: 0;
  }

  :deep(.el-input) {
    width: 100%;
    --el-input-height: 46px;
  }

  :deep(.el-input__wrapper) {
    height: 46px !important;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(180, 203, 242, 0.84);
    box-shadow: none;
    background: rgba(248, 251, 255, 0.86);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }

  :deep(.el-input__inner) {
    height: 46px;
    line-height: 46px;
    font-size: 15px;
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: rgba(22, 100, 255, 0.7);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(22, 100, 255, 0.11);
  }

  :deep(.el-button--primary) {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    font-size: 0.98rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, #1664ff 0%, #4f7dff 100%);
    box-shadow: 0 16px 26px -18px rgba(22, 100, 255, 0.9);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.el-button--primary:hover) {
    transform: translateY(-1px);
    box-shadow: 0 16px 24px -12px rgba(22, 100, 255, 0.82);
  }
}

.input-icon {
  color: #6f84ad;
  width: 14px;
}

.captcha-wrap {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 0.66rem;
  align-items: center;
}

.captcha-box {
  height: 46px;
  border: 1px solid rgba(177, 199, 236, 0.85);
  background: rgba(248, 251, 255, 0.95);
  border-radius: 12px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(22, 100, 255, 0.55);
    transform: translateY(-1px);
  }
}

.captcha-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.1rem 0 0.82rem;

  :deep(.el-checkbox__label) {
    color: #4a5b7a;
    font-size: 0.88rem;
  }
}

.switch-link {
  font-size: 0.87rem;
  color: #3364d4;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: #1140a1;
  }
}

.submit-item {
  margin-bottom: 0;
}

.auth-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.85rem;
  text-align: center;
  color: #7f8da8;
  font-size: 12px;
  letter-spacing: 0.08em;
}

@media (max-width: 1024px) {
  .auth-shell {
    height: auto;
  }

  .auth-card {
    grid-template-columns: 1fr;
  }

  .auth-intro {
    padding: 1.25rem 1.15rem 1.05rem;
    border-right: none;
    border-bottom: 1px solid rgba(185, 207, 245, 0.62);
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding-bottom: 4.8rem;
  }

  .intro-title {
    max-width: none;
  }

  .intro-desc {
    max-width: none;
  }

  .intro-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .auth-panel {
    height: auto;
    justify-content: flex-start;
    padding: 1.2rem 1rem;
  }

  .captcha-wrap {
    grid-template-columns: minmax(0, 1fr) 98px;
  }
}

@media (max-width: 560px) {
  .auth-intro {
    display: none;
  }

  .auth-shell {
    max-width: 450px;
  }

  .auth-card {
    border-radius: 18px;
  }
}

@keyframes shellEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -18px, 0);
  }
}
</style>
