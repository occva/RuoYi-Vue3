<template>
  <div ref="homePageRef" class="user-home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-orb hero-orb-left"></div>
      <div class="hero-orb hero-orb-right"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <span class="hero-pill">校园社团平台</span>
          <h1 class="hero-title">寻找你的校园社区</h1>
          <p class="hero-subtitle">
            发现、加入并领导符合你兴趣的社团组织。<br/>
            与同龄人联系并提升你的技能。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="$router.push('/user/clubs')">
              探索社团
            </el-button>
            <el-button size="large" @click="$router.push('/user/club-apply')">
              创建新社团
            </el-button>
          </div>
          <div class="hero-trust-row">
            <span class="trust-item">服务校内社团组织</span>
            <span class="trust-dot"></span>
            <span class="trust-item">一站式发现与参与</span>
          </div>
        </div>
        <aside
          ref="heroPanelRef"
          class="hero-panel"
          :style="heroPanelStyle"
          @mouseenter="handleHeroPanelEnter"
          @mousemove="handleHeroPanelMove"
          @mouseleave="handleHeroPanelLeave"
        >
          <div class="panel-head">
            <span class="panel-title">社团数据快照</span>
          </div>
          <div class="hero-stats">
            <article class="stat-card">
              <span class="stat-value">{{ snapshot.clubTotal }}</span>
              <span class="stat-label">社团总数</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">{{ snapshot.activityTotal }}</span>
              <span class="stat-label">进行中活动</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">{{ snapshot.noticeTotal }}</span>
              <span class="stat-label">公告总数</span>
            </article>
          </div>
          <div class="hero-tags">
            <span class="hero-tag">科技</span>
            <span class="hero-tag">文艺</span>
            <span class="hero-tag">体育</span>
            <span class="hero-tag">公益</span>
            <button class="hero-tags-more" @click="$router.push('/user/clubs')">
              更多
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </aside>
      </div>
    </section>

    <!-- 公告通知 -->
    <section class="notice-section" v-if="notices.length > 0">
      <div class="container">
        <div class="notice-bar reveal-item">
          <el-icon class="notice-icon"><Bell /></el-icon>
          <div class="notice-content">
            <span class="notice-tag">最新公告</span>
            <span class="notice-title">{{ notices[0].noticeTitle }}</span>
          </div>
          <el-button link type="primary" @click="viewNotice(notices[0])">查看详情</el-button>
        </div>
      </div>
    </section>

    <!-- 热门社团 -->
    <main id="clubs" class="section club-section">
      <div class="container">
        <div class="section-header reveal-item">
          <h2 class="section-title">热门社团</h2>
          <el-button link @click="$router.push('/user/clubs')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div ref="clubGridRef" class="club-grid">
          <ClubCard v-for="club in clubs" :key="club.clubId" :club="club" class="reveal-item reveal-grid-item" />
        </div>
      </div>
    </main>

    <!-- 校园活动 -->
    <section class="section activity-section" v-if="activities.length > 0">
      <div class="container">
        <div class="section-header reveal-item">
          <h2 class="section-title">精彩活动</h2>
          <el-button link @click="$router.push('/user/activities')">更多活动 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div ref="activityGridRef" class="activity-grid">
          <ActivityCard v-for="activity in activities" :key="activity.activityId" :activity="activity" class="reveal-item reveal-grid-item" />
        </div>
      </div>
    </section>

    <!-- AI Assistant -->
    <AIAssistant />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { Bell, ArrowRight } from '@element-plus/icons-vue'
import { listClubs } from '@/api/user/club'
import { listActivities } from '@/api/user/activity'
import { listNotices } from '@/api/user/notice'
import { ElMessageBox } from 'element-plus'
import ClubCard from './components/ClubCard.vue'
import ActivityCard from './components/ActivityCard.vue'
import AIAssistant from './components/AIAssistant.vue'

const clubs = ref([])
const activities = ref([])
const notices = ref([])
const homePageRef = ref(null)
const clubGridRef = ref(null)
const activityGridRef = ref(null)
const snapshot = ref({
  clubTotal: 0,
  activityTotal: 0,
  noticeTotal: 0
})
const heroPanelRef = ref(null)
const panelRotateX = ref(0)
const panelRotateY = ref(0)
const panelScale = ref(1)
const panelShiftX = ref(0)
const panelShiftY = ref(0)
let revealObserver = null
let revealResizeRaf = null

const heroPanelStyle = computed(() => ({
  '--panel-rotate-x': `${panelRotateX.value}deg`,
  '--panel-rotate-y': `${panelRotateY.value}deg`,
  '--panel-scale': panelScale.value.toString(),
  '--panel-shift-x': `${panelShiftX.value}px`,
  '--panel-shift-y': `${panelShiftY.value}px`
}))

onMounted(() => {
  getStats()
  initRevealAnimation()
  window.addEventListener('resize', handleRevealResize, { passive: true })
})

onBeforeUnmount(() => {
  if (revealObserver) {
    revealObserver.disconnect()
    revealObserver = null
  }

  if (revealResizeRaf) {
    cancelAnimationFrame(revealResizeRaf)
    revealResizeRaf = null
  }

  window.removeEventListener('resize', handleRevealResize)
})

watch([clubs, activities, notices], () => {
  refreshRevealAnimation()
})

const handleRevealResize = () => {
  if (revealResizeRaf) {
    cancelAnimationFrame(revealResizeRaf)
  }

  revealResizeRaf = requestAnimationFrame(() => {
    assignGridRowDelay(clubGridRef)
    assignGridRowDelay(activityGridRef)
  })
}

const assignGridRowDelay = (gridRef) => {
  const gridEl = gridRef.value
  if (!gridEl) return

  const cards = Array.from(gridEl.querySelectorAll('.reveal-grid-item'))
  const rowTops = []

  cards.forEach(card => {
    const top = card.offsetTop
    let rowIndex = rowTops.findIndex(rowTop => Math.abs(rowTop - top) <= 6)
    if (rowIndex === -1) {
      rowIndex = rowTops.length
      rowTops.push(top)
    }

    card.style.setProperty('--reveal-delay', `${rowIndex * 220}ms`)
  })
}

const observeRevealItems = () => {
  if (!homePageRef.value || typeof window === 'undefined') return

  if (revealObserver) {
    revealObserver.disconnect()
  }

  revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    }
  )

  const targets = homePageRef.value.querySelectorAll('.reveal-item')
  targets.forEach(target => revealObserver.observe(target))
}

const refreshRevealAnimation = () => {
  nextTick(() => {
    assignGridRowDelay(clubGridRef)
    assignGridRowDelay(activityGridRef)
    observeRevealItems()
  })
}

const initRevealAnimation = () => {
  refreshRevealAnimation()
}

const isPanelMotionDisabled = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const handleHeroPanelEnter = () => {
  if (isPanelMotionDisabled()) return
  panelScale.value = 1.03
}

const handleHeroPanelMove = (event) => {
  if (isPanelMotionDisabled()) return

  const panel = heroPanelRef.value
  if (!panel) return

  const rect = panel.getBoundingClientRect()
  const px = (event.clientX - rect.left) / rect.width
  const py = (event.clientY - rect.top) / rect.height
  const offsetX = px - 0.5
  const offsetY = py - 0.5

  panelRotateY.value = Number((offsetX * 15).toFixed(2))
  panelRotateX.value = Number((-offsetY * 14).toFixed(2))
  panelShiftX.value = Number((offsetX * 6.5).toFixed(2))
  panelShiftY.value = Number((offsetY * 6.5).toFixed(2))
  panelScale.value = 1.042
}

const handleHeroPanelLeave = () => {
  panelRotateX.value = 0
  panelRotateY.value = 0
  panelShiftX.value = 0
  panelShiftY.value = 0
  panelScale.value = 1
}

const getStats = () => {
  listClubs({ pageNum: 1, pageSize: 6 }).then(response => {
    const rows = Array.isArray(response.rows) ? response.rows : (Array.isArray(response.data) ? response.data : [])
    clubs.value = rows.slice(0, 6)
    snapshot.value.clubTotal = Number(response.total) || rows.length
  })
  
  listActivities({ pageNum: 1, pageSize: 3, status: '1' }).then(response => {
    const rows = Array.isArray(response.rows) ? response.rows : []
    snapshot.value.activityTotal = Number(response.total) || rows.length

    // try to get ongoing first, if empty get upcoming
    if (rows.length > 0) {
        activities.value = rows.slice(0, 3)
    } else {
        listActivities({ pageNum: 1, pageSize: 3 }).then(res => {
            const fallbackRows = Array.isArray(res.rows) ? res.rows : []
            activities.value = fallbackRows.slice(0, 3)
            if (!snapshot.value.activityTotal) {
              snapshot.value.activityTotal = Number(res.total) || fallbackRows.length
            }
        })
    }
  })

  listNotices({ pageNum: 1, pageSize: 5 }).then(response => {
    const rows = Array.isArray(response.rows) ? response.rows : (Array.isArray(response.data) ? response.data : [])
    notices.value = rows
    snapshot.value.noticeTotal = Number(response.total) || rows.length
  })
}

const viewNotice = (notice) => {
  ElMessageBox.alert(
    `<div style="white-space: pre-wrap;">${notice.noticeContent}</div>`,
    notice.noticeTitle,
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}
</script>

<style lang="scss" scoped>
.user-home-page {
  --hero-primary: #0f5fff;
  --hero-primary-soft: #87adff;
  --hero-surface: rgba(255, 255, 255, 0.82);
  --hero-border: rgba(255, 255, 255, 0.68);
  --hero-header-overlap: 72px;
  min-height: 100vh;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  background: #ffffff;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-section {
  position: relative;
  overflow: hidden;
  margin-top: calc(-1 * var(--hero-header-overlap));
  padding: calc(clamp(3.5rem, 7vw, 6rem) + var(--hero-header-overlap)) 0 16.4rem;
  background:
    radial-gradient(circle at 9% 8%, rgba(15, 95, 255, 0.145), transparent 52%),
    radial-gradient(circle at 88% 10%, rgba(12, 201, 186, 0.135), transparent 48%),
    radial-gradient(circle at 50% 66%, rgba(15, 95, 255, 0.06), transparent 58%),
    linear-gradient(
      180deg,
      rgba(238, 245, 255, 0.98) 0%,
      rgba(242, 248, 255, 0.94) 32%,
      rgba(247, 251, 255, 0.9) 58%,
      rgba(251, 253, 255, 0.84) 76%,
      rgba(253, 254, 255, 0.88) 88%,
      rgba(255, 255, 255, 0.96) 96%,
      #ffffff 100%
    );
}

.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(15, 95, 255, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 95, 255, 0.045) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.22), transparent 91%);
  pointer-events: none;
}

.hero-section::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -230px;
  height: 760px;
  background: linear-gradient(
    180deg,
    rgba(243, 249, 255, 0) 0%,
    rgba(247, 251, 255, 0.32) 38%,
    rgba(251, 253, 255, 0.72) 68%,
    rgba(255, 255, 255, 0.94) 88%,
    #ffffff 100%
  );
  pointer-events: none;
}

.hero-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 3.25rem);
}

.hero-content {
  display: flex;
  flex-direction: column;
}

.hero-pill {
  width: fit-content;
  padding: 0.46rem 0.82rem;
  border-radius: 999px;
  font-size: 0.72rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1140a1;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(17, 64, 161, 0.16);
  box-shadow: 0 12px 26px -18px rgba(16, 64, 166, 0.86);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.08;
  margin-bottom: 1rem;
  color: #0b1224;
  letter-spacing: -0.03em;
  max-width: 11ch;
}

.hero-subtitle {
  font-size: clamp(1.02rem, 2vw, 1.24rem);
  color: #3b4760;
  max-width: 58ch;
  margin: 0 0 2rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  margin-bottom: 1.1rem;

  .el-button {
    min-width: 150px;
    height: 50px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    padding: 0 28px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &--primary {
      color: #ffffff;
      background: linear-gradient(135deg, #1664ff 0%, #4f7dff 100%);
      border: none;
      box-shadow: 0 16px 30px -18px rgba(15, 95, 255, 0.95);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 28px -14px rgba(15, 95, 255, 0.8);
      }
      
      &:active {
        transform: scale(0.98);
      }
    }

    &:not(.el-button--primary) {
      border: 1px solid rgba(154, 178, 230, 0.54);
      color: #2a3e68;
      background: rgba(255, 255, 255, 0.66);
      
      &:hover {
        border-color: rgba(22, 100, 255, 0.38);
        color: #1140a1;
        background: rgba(248, 251, 255, 0.96);
        transform: translateY(-2px);
      }
    }
  }
}

.hero-trust-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #5a6782;
  font-size: 0.88rem;
  font-weight: 500;
}

.trust-item {
  white-space: nowrap;
}

.trust-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #8da3d3;
}

.hero-panel {
  position: relative;
  transform-style: preserve-3d;
  transform-origin: center;
  transform: perspective(860px) translate3d(var(--panel-shift-x, 0px), var(--panel-shift-y, 0px), 0) rotateX(var(--panel-rotate-x, 0deg)) rotateY(var(--panel-rotate-y, 0deg)) scale(var(--panel-scale, 1));
  transition: transform 90ms ease-out, box-shadow 180ms ease-out;
  will-change: transform;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(186, 207, 245, 0.82);
  border-radius: 22px;
  box-shadow: 0 26px 58px -46px rgba(20, 70, 166, 0.9), 0 8px 24px -18px rgba(14, 72, 168, 0.42);
  padding: clamp(1.1rem, 1.8vw, 1.6rem);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0));
  }

  &:hover {
    box-shadow: 0 42px 74px -44px rgba(20, 70, 166, 0.92), 0 20px 38px -20px rgba(14, 72, 168, 0.55);
  }
}

.panel-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.panel-title {
  color: #1f2f4d;
  font-size: 1rem;
  font-weight: 700;
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.stat-card {
  border-radius: 16px;
  border: 1px solid rgba(126, 154, 214, 0.2);
  background: rgba(255, 255, 255, 0.78);
  padding: 0.84rem 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.24rem;
  min-height: 86px;
}

.stat-value {
  font-size: clamp(1.5rem, 2vw, 1.9rem);
  line-height: 1;
  font-weight: 800;
  color: #152f66;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5c6985;
}

.hero-tags {
  position: relative;
  z-index: 1;
  margin-top: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.hero-tag {
  border-radius: 999px;
  background: rgba(237, 244, 255, 0.9);
  border: 1px solid rgba(95, 138, 230, 0.32);
  color: #1f4ea9;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.32rem 0.72rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(47, 96, 208, 0.42);
    background: rgba(244, 248, 255, 0.96);
  }
}

.hero-tags-more {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #1c4aac;
  font-size: 0.82rem;
  font-weight: 700;
  height: 28px;
  padding: 0 0.15rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: all 0.2s ease;

  .el-icon {
    font-size: 12px;
  }

  &:hover {
    color: #123c92;
    background: rgba(223, 236, 255, 0.62);
  }
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.95;
  pointer-events: none;
}

.hero-orb-left {
  width: 520px;
  height: 520px;
  left: -240px;
  top: -170px;
  background: radial-gradient(circle, rgba(22, 100, 255, 0) 38%, rgba(22, 100, 255, 0.2) 52%, rgba(22, 100, 255, 0.08) 66%, rgba(22, 100, 255, 0) 82%);
}

.hero-orb-right {
  width: 620px;
  height: 620px;
  right: -230px;
  bottom: -300px;
  background: radial-gradient(circle, rgba(14, 211, 187, 0) 36%, rgba(14, 211, 187, 0.16) 52%, rgba(14, 211, 187, 0.06) 66%, rgba(14, 211, 187, 0) 82%);
}

.notice-section {
  margin-top: -7rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.notice-bar {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;

  .notice-icon {
    color: #f59e0b;
    font-size: 1.25rem;
  }

  .notice-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow: hidden;

    .notice-tag {
      background: #fef3c7;
      color: #d97706;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .notice-title {
      color: #374151;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.section {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  color: #111827;
  font-weight: 700;
  margin: 0;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

@media (max-width: 1100px) {
  .hero-container {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-content {
    text-align: center;
    align-items: center;
  }

  .hero-title {
    max-width: none;
  }

  .hero-subtitle {
    margin: 0 auto 2rem;
  }

  .hero-trust-row {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .user-home-page {
    --hero-header-overlap: 64px;
  }

  .hero-section {
    padding-top: calc(3.4rem + var(--hero-header-overlap));
    padding-bottom: 11.6rem;
  }

  .hero-orb-left {
    width: 390px;
    height: 390px;
    left: -180px;
    top: -140px;
  }

  .hero-orb-right {
    width: 470px;
    height: 470px;
    right: -190px;
    bottom: -210px;
  }

  .hero-panel {
    transform: none !important;
    transition: box-shadow 220ms ease-out;
  }

  .hero-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;

    .el-button {
      min-width: 0;
      width: calc(50% - 0.5rem);
      padding: 0;
    }
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-tags {
    justify-content: center;
  }

  .hero-tags-more {
    margin-left: 0;
  }

  .stat-card:last-child {
    grid-column: 1 / -1;
  }

  .notice-section {
    margin-top: -4.6rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }

  .hero-trust-row {
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-actions .el-button {
    width: 100%;
  }

  .hero-tags-more {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .stat-card:last-child {
    grid-column: auto;
  }

  .notice-bar {
    padding: 0.8rem 1rem;
  }
}

.reveal-item {
  --reveal-delay: 0ms;
  opacity: 0;
  transform: translate3d(0, 36px, 0) scale(0.965);
  filter: blur(2.2px);
  transition:
    opacity 700ms cubic-bezier(0.19, 1, 0.22, 1),
    transform 760ms cubic-bezier(0.19, 1, 0.22, 1),
    filter 760ms cubic-bezier(0.19, 1, 0.22, 1);
  transition-delay: var(--reveal-delay);
  will-change: opacity, transform, filter;
}

.reveal-item.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
}

.notice-bar.reveal-item {
  transform: translate3d(0, 28px, 0) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-item {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
