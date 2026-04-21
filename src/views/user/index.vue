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
          :class="{ 'is-accent-active': heroAccentActive }"
          :style="heroPanelStyle"
          @mouseenter="handleHeroPanelEnter"
          @mousemove="handleHeroPanelMove"
          @mouseleave="handleHeroPanelLeave"
        >
          <div class="hero-panel-accent" aria-hidden="true"></div>
          <div class="hero-panel-inner">
            <transition name="hero-slide" mode="out-in">
              <div :key="currentHeroSlide.key" class="hero-slide" :class="{ 'is-club-slide': currentHeroSlide.type === 'club' }">
                <template v-if="currentHeroSlide.type === 'snapshot'">
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
                </template>

                <template v-else>
                  <div class="hero-club-overview">
                    <div class="hero-club-cover">
                      <el-image :src="getHeroClubImage(currentHeroSlide.club)" :alt="currentHeroSlide.club.clubName" fit="cover">
                        <template #error>
                          <div class="hero-club-cover-placeholder">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div class="hero-club-copy">
                      <div class="panel-head panel-head-club">
                        <span class="hero-club-badge">热门社团</span>
                        <span class="panel-title hero-club-title" :title="currentHeroSlide.club.clubName">
                          {{ currentHeroSlide.club.clubName }}
                        </span>
                      </div>
                      <p class="hero-club-desc line-clamp-2">
                        {{ currentHeroSlide.club.description || '这里展示当前热门社团的简介与核心亮点。' }}
                      </p>
                    </div>
                  </div>
                  <div class="hero-stats">
                    <article class="stat-card">
                      <span class="stat-value">{{ currentHeroSlide.club.viewCount || 0 }}</span>
                      <span class="stat-label">浏览量</span>
                    </article>
                    <article class="stat-card">
                      <span class="stat-value">{{ currentHeroSlide.club.favoriteCount || 0 }}</span>
                      <span class="stat-label">收藏量</span>
                    </article>
                    <article class="stat-card">
                      <span class="stat-value">{{ currentHeroSlide.club.memberCount || 0 }}</span>
                      <span class="stat-label">成员数</span>
                    </article>
                  </div>
                  <div class="hero-tags">
                    <span class="hero-tag">{{ currentHeroSlide.club.categoryName || '热门社团' }}</span>
                    <span class="hero-tag">热度 {{ getClubHeat(currentHeroSlide.club) }}</span>
                    <button class="hero-tags-more" @click="handleHeroPrimaryAction">
                      详情
                      <el-icon><ArrowRight /></el-icon>
                    </button>
                  </div>
                </template>
              </div>
            </transition>
          </div>
        </aside>
      </div>
    </section>

    <!-- 公告通知 -->
    <section class="notice-section" v-if="visibleHomeNotice">
      <div class="container">
        <div class="notice-bar reveal-item">
          <el-icon class="notice-icon"><Bell /></el-icon>
          <div class="notice-content">
            <span class="notice-tag">最新公告</span>
            <span class="notice-title">{{ visibleHomeNotice.noticeTitle }}</span>
          </div>
          <div class="notice-actions">
            <el-button link type="primary" @click="viewNotice(visibleHomeNotice)">查看详情</el-button>
            <button type="button" class="notice-close-btn" aria-label="关闭公告提示" @click="dismissHomeNotice">
              关闭
            </button>
          </div>
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
          <ClubCard v-for="club in popularClubs" :key="club.clubId" :club="club" class="reveal-item reveal-grid-item" />
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
    <AIAssistant v-if="aiAssistantEnabled" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ArrowRight, Picture } from '@element-plus/icons-vue'
import { listClubs, listPopularClubs } from '@/api/user/club'
import { listActivities } from '@/api/user/activity'
import { getLatestSystemNotice, listNotices } from '@/api/user/notice'
import { listNotifications } from '@/api/user/notification'
import { getAiChatFeature } from '@/api/user/ai'
import { ElMessageBox } from 'element-plus'
import { getImgUrl } from '@/utils/ruoyi'
import useUserStore from '@/store/modules/user'
import ClubCard from './components/ClubCard.vue'
import ActivityCard from './components/ActivityCard.vue'
import AIAssistant from './components/AIAssistant.vue'

const router = useRouter()
const userStore = useUserStore()
const HERO_SCAN_DURATION = 5000
const HOME_NOTICE_DISMISS_KEY_PREFIX = 'association:user-home:dismissed-global-notice'

const popularClubs = ref([])
const activities = ref([])
const notices = ref([])
const latestSystemNotice = ref(null)
const aiAssistantEnabled = ref(false)
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
const heroPanelBaseHeight = ref(0)
const heroSlideIndex = ref(0)
const isHeroMotionReduced = ref(true)
const isHeroPanelHovered = ref(false)
let revealObserver = null
let revealResizeRaf = null
let heroSlideTimer = null

const heroSlides = computed(() => ([
  {
    key: 'snapshot',
    type: 'snapshot'
  },
  ...popularClubs.value.map(club => ({
    key: `club-${club.clubId}`,
    type: 'club',
    club
  }))
]))

const currentHeroSlide = computed(() => {
  return heroSlides.value[heroSlideIndex.value] || heroSlides.value[0] || { key: 'snapshot', type: 'snapshot' }
})

const heroAccentActive = computed(() => !isHeroMotionReduced.value && heroSlides.value.length > 1)

const dismissedHomeNoticeKey = ref(readDismissedHomeNoticeKey())

const visibleHomeNotice = computed(() => {
  const notice = latestSystemNotice.value || notices.value[0] || null
  if (!notice) {
    return null
  }

  return getHomeNoticeKey(notice) === dismissedHomeNoticeKey.value ? null : notice
})

const heroPanelStyle = computed(() => {
  const style = {
    '--panel-rotate-x': `${panelRotateX.value}deg`,
    '--panel-rotate-y': `${panelRotateY.value}deg`,
    '--panel-scale': panelScale.value.toString(),
    '--panel-shift-x': `${panelShiftX.value}px`,
    '--panel-shift-y': `${panelShiftY.value}px`,
    '--hero-accent-duration': `${HERO_SCAN_DURATION}ms`
  }

  if (heroPanelBaseHeight.value > 0 && !isHeroMotionReduced.value) {
    style.height = `${heroPanelBaseHeight.value}px`
  }

  return style
})

onMounted(() => {
  syncHeroMotionState()
  loadAiAssistantFeature()
  getStats()
  initRevealAnimation()
  window.addEventListener('resize', handleRevealResize, { passive: true })
  nextTick(() => {
    captureHeroPanelBaseHeight()
  })
  syncHeroAutoplay()
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

  clearHeroAutoplay()
  window.removeEventListener('resize', handleRevealResize)
})

watch([popularClubs, activities, notices], () => {
  refreshRevealAnimation()
})

watch(() => [userStore.token, userStore.id], () => {
  dismissedHomeNoticeKey.value = readDismissedHomeNoticeKey()
  loadHomeNotices()
})

watch(heroSlides, (slides) => {
  if (heroSlideIndex.value >= slides.length) {
    heroSlideIndex.value = 0
  }
  syncHeroAutoplay()
})

const handleRevealResize = () => {
  syncHeroMotionState()
  syncHeroAutoplay()
  heroPanelBaseHeight.value = 0

  nextTick(() => {
    captureHeroPanelBaseHeight()
  })

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

const syncHeroMotionState = () => {
  if (typeof window === 'undefined') return true
  isHeroMotionReduced.value = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const isPanelMotionDisabled = () => {
  return isHeroMotionReduced.value
}

const handleHeroPanelEnter = () => {
  isHeroPanelHovered.value = true
  clearHeroAutoplay()

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
  isHeroPanelHovered.value = false
  panelRotateX.value = 0
  panelRotateY.value = 0
  panelShiftX.value = 0
  panelShiftY.value = 0
  panelScale.value = 1
  syncHeroAutoplay()
}

const captureHeroPanelBaseHeight = () => {
  if (!heroPanelRef.value) return

  const height = Math.round(heroPanelRef.value.getBoundingClientRect().height)
  if (height > 0) {
    heroPanelBaseHeight.value = height
  }
}

const clearHeroAutoplay = () => {
  if (heroSlideTimer) {
    clearTimeout(heroSlideTimer)
    heroSlideTimer = null
  }
}

const syncHeroAutoplay = () => {
  clearHeroAutoplay()

  if (typeof window === 'undefined' || isHeroMotionReduced.value || isHeroPanelHovered.value || heroSlides.value.length <= 1) {
    return
  }

  heroSlideTimer = window.setTimeout(() => {
    heroSlideIndex.value = (heroSlideIndex.value + 1) % heroSlides.value.length
    syncHeroAutoplay()
  }, HERO_SCAN_DURATION)
}

const extractRows = (response) => {
  if (Array.isArray(response?.rows)) return response.rows
  if (Array.isArray(response?.data)) return response.data
  return []
}

function readDismissedHomeNoticeKey() {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.localStorage.getItem(getHomeNoticeDismissStorageKey()) || ''
}

function getHomeNoticeDismissStorageKey() {
  if (!userStore.token) {
    return `${HOME_NOTICE_DISMISS_KEY_PREFIX}:guest`
  }

  const userScope = userStore.id || userStore.name || 'user'
  return `${HOME_NOTICE_DISMISS_KEY_PREFIX}:${userScope}`
}

function getHomeNoticeKey(notice) {
  if (!notice) {
    return ''
  }
  const source = notice.noticeSource || 'system'
  return `${source}-${notice.noticeId}`
}

const loadAiAssistantFeature = async () => {
  try {
    const response = await getAiChatFeature()
    aiAssistantEnabled.value = response?.aiChatEnabled === true || response?.data?.aiChatEnabled === true
  } catch (_) {
    aiAssistantEnabled.value = false
  }
}

const getClubHeat = (club) => {
  const favoriteCount = Number(club?.favoriteCount) || 0
  const viewCount = Number(club?.viewCount) || 0
  return favoriteCount * 2 + viewCount
}

const getHeroClubImage = (club) => getImgUrl(club?.coverUrl || club?.logoUrl || '')

const handleHeroPrimaryAction = () => {
  if (currentHeroSlide.value.type === 'snapshot') {
    router.push('/user/clubs')
    return
  }

  const clubId = currentHeroSlide.value.club?.clubId
  if (clubId) {
    router.push(`/user/club/${clubId}`)
  }
}

const getStats = () => {
  listClubs().then(response => {
    const rows = extractRows(response)
    snapshot.value.clubTotal = Number(response.total) || rows.length
  })

  listPopularClubs(3).then(response => {
    popularClubs.value = extractRows(response).slice(0, 3)
  })

  listActivities({ pageNum: 1, pageSize: 3, status: '1' }).then(response => {
    const rows = extractRows(response)
    snapshot.value.activityTotal = Number(response.total) || rows.length

    if (rows.length > 0) {
      activities.value = rows.slice(0, 3)
      return
    }

    listActivities({ pageNum: 1, pageSize: 3 }).then(res => {
      const fallbackRows = extractRows(res)
      activities.value = fallbackRows.slice(0, 3)
      if (!snapshot.value.activityTotal) {
        snapshot.value.activityTotal = Number(res.total) || fallbackRows.length
      }
    })
  })

  loadHomeNotices()
  loadLatestSystemNotice()
}

const loadHomeNotices = async () => {
  try {
    if (userStore.token) {
      const [notificationResponse, totalResponse] = await Promise.all([
        listNotifications({ pageNum: 1, pageSize: 5 }),
        listNotices({ pageNum: 1, pageSize: 1 })
      ])
      const notificationRows = extractRows(notificationResponse)
      const totalRows = extractRows(totalResponse)
      notices.value = notificationRows
      snapshot.value.noticeTotal = Number(totalResponse?.total) || totalRows.length
      return
    }

    const response = await listNotices({ pageNum: 1, pageSize: 5 })
    const rows = extractRows(response)
    notices.value = rows
    snapshot.value.noticeTotal = Number(response.total) || rows.length
  } catch (_) {
    notices.value = []
    snapshot.value.noticeTotal = 0
  }
}

const loadLatestSystemNotice = () => {
  getLatestSystemNotice().then(response => {
    latestSystemNotice.value = response?.data || null
  }).catch(() => {
    latestSystemNotice.value = null
  })
}

const dismissHomeNotice = () => {
  if (!visibleHomeNotice.value || typeof window === 'undefined') {
    return
  }

  const noticeKey = getHomeNoticeKey(visibleHomeNotice.value)
  dismissedHomeNoticeKey.value = noticeKey
  window.localStorage.setItem(getHomeNoticeDismissStorageKey(), noticeKey)
}

const sanitizeNoticeHtml = (html) => {
  if (typeof window === 'undefined' || !html) {
    return '<p>暂无内容</p>'
  }

  const doc = new DOMParser().parseFromString(String(html), 'text/html')
  doc.querySelectorAll('script,style,iframe,frame,object,embed,link,meta,form,input,button,textarea,select').forEach(node => node.remove())

  doc.body.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value?.trim() || ''

      if (name.startsWith('on')) {
        node.removeAttribute(attr.name)
        return
      }

      if (['href', 'src', 'xlink:href'].includes(name) && /^(javascript|data):/i.test(value)) {
        node.removeAttribute(attr.name)
        return
      }

      if (name === 'style' && /expression|javascript:/i.test(value)) {
        node.removeAttribute(attr.name)
      }
    })
  })

  const content = doc.body.innerHTML?.trim()
  return content ? `<div style="white-space: pre-wrap;">${content}</div>` : '<p>暂无内容</p>'
}

const viewNotice = (notice) => {
  ElMessageBox.alert(
    sanitizeNoticeHtml(notice?.noticeContent),
    notice?.noticeTitle || '公告详情',
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
  overflow: hidden;
  isolation: isolate;
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

  &::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    box-shadow:
      0 0 0 1px rgba(118, 172, 255, 0.18),
      0 0 18px rgba(118, 172, 255, 0.14),
      0 0 32px rgba(104, 203, 255, 0.1);
  }

  &:hover {
    box-shadow: 0 42px 74px -44px rgba(20, 70, 166, 0.92), 0 20px 38px -20px rgba(14, 72, 168, 0.55);
  }
}

.hero-panel-inner {
  position: relative;
  z-index: 1;
  height: 100%;
}

.hero-panel-accent {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
  opacity: 0;
  overflow: hidden;
}

.hero-panel-accent::before,
.hero-panel-accent::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

.hero-panel-accent::before {
  width: 42%;
  height: 54%;
  top: -20%;
  right: -8%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(130, 187, 255, 0.34) 0%, rgba(130, 187, 255, 0.12) 48%, rgba(130, 187, 255, 0) 78%);
  filter: blur(18px);
}

.hero-panel-accent::after {
  inset: -34% -22%;
  background: linear-gradient(112deg, transparent 30%, rgba(255, 255, 255, 0.18) 47%, rgba(133, 191, 255, 0.22) 52%, transparent 68%);
  transform: translate3d(-42%, 0, 0);
}

.hero-panel.is-accent-active::after {
  opacity: 1;
  animation: hero-panel-breathe var(--hero-accent-duration, 3000ms) ease-in-out infinite;
}

.hero-panel.is-accent-active .hero-panel-accent {
  opacity: 1;
}

.hero-panel.is-accent-active .hero-panel-accent::before {
  animation: hero-panel-orbit var(--hero-accent-duration, 3000ms) ease-in-out infinite;
}

.hero-panel.is-accent-active .hero-panel-accent::after {
  animation: hero-panel-sheen var(--hero-accent-duration, 3000ms) linear infinite;
}

.hero-slide {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.hero-slide.is-club-slide {
  display: grid;
  grid-template-rows: auto auto auto;
  align-content: start;
  gap: 0.58rem;
  min-height: 0;
}

.hero-club-overview {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr);
  align-items: start;
  gap: 0.8rem;
  min-height: 0;
}

.hero-club-cover {
  border-radius: 18px;
  overflow: hidden;
  width: 124px;
  height: 92px;
  flex-shrink: 0;
  background: linear-gradient(160deg, rgba(231, 240, 255, 0.94), rgba(217, 230, 252, 0.66));
  border: 1px solid rgba(146, 172, 222, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);

  .el-image {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.hero-club-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8ba1c9;
  font-size: 1.5rem;
  background: linear-gradient(160deg, rgba(235, 243, 255, 0.98), rgba(222, 234, 252, 0.72));
}

.hero-club-copy {
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: 0.36rem;
}

.hero-club-badge {
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  border: 1px solid rgba(95, 138, 230, 0.24);
  background: rgba(237, 244, 255, 0.82);
  color: #2d5cc0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.16rem 0.5rem;
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

.hero-slide.is-club-slide .panel-head {
  margin-bottom: 0;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hero-slide.is-club-slide .panel-head-club .panel-title {
  flex: 1;
  min-width: 0;
}

.hero-slide.is-club-slide .hero-stats {
  gap: 0.5rem;
}

.hero-slide.is-club-slide .stat-card {
  min-height: 68px;
  padding: 0.58rem 0.64rem;
  border-radius: 14px;
}

.hero-slide.is-club-slide .hero-tags {
  margin-top: 0;
  padding-top: 0;
  gap: 0.46rem;
}

.hero-slide.is-club-slide .stat-value {
  font-size: clamp(1.4rem, 1.8vw, 1.72rem);
}

.hero-slide.is-club-slide .stat-label {
  font-size: 0.76rem;
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

.hero-club-desc {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #455370;
  font-size: 0.8rem;
  line-height: 1.52;
  min-height: calc(1.52em * 2);
  max-height: calc(1.52em * 2);
}

.hero-club-title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
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

  .notice-actions {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 1rem;
  }

  .notice-close-btn {
    border: none;
    background: transparent;
    color: #9aa6b2;
    font-size: 0.86rem;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #6b7785;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

  .club-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .hero-club-overview {
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 0.66rem;
  }

  .hero-club-cover {
    width: 108px;
    height: 82px;
  }

  .hero-tags {
    justify-content: center;
  }

  .club-grid {
    grid-template-columns: 1fr;
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
    margin-left: 0;
  }

  .hero-club-overview {
    grid-template-columns: 1fr;
  }

  .hero-club-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 5 / 3;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .stat-card:last-child {
    grid-column: auto;
  }

  .notice-bar {
    padding: 0.8rem 1rem;
    align-items: flex-start;
    flex-wrap: wrap;

    .notice-actions {
      width: 100%;
      justify-content: flex-end;
      gap: 0.85rem;
    }
  }
}

@keyframes hero-panel-breathe {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(118, 172, 255, 0.14),
      0 0 14px rgba(118, 172, 255, 0.1),
      0 0 26px rgba(104, 203, 255, 0.08);
  }

  50% {
    box-shadow:
      0 0 0 1px rgba(118, 172, 255, 0.24),
      0 0 24px rgba(118, 172, 255, 0.2),
      0 0 42px rgba(104, 203, 255, 0.14);
  }
}

@keyframes hero-panel-orbit {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.78;
  }

  50% {
    transform: translate3d(-14%, 4%, 0) scale(1.08);
    opacity: 1;
  }
}

@keyframes hero-panel-sheen {
  0% {
    transform: translate3d(-46%, 0, 0);
    opacity: 0;
  }

  18% {
    opacity: 0.6;
  }

  52% {
    opacity: 0.82;
  }

  100% {
    transform: translate3d(34%, 0, 0);
    opacity: 0;
  }
}

.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: opacity 280ms ease, transform 320ms ease;
}

.hero-slide-enter-from,
.hero-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
  .hero-slide-enter-active,
  .hero-slide-leave-active,
  .reveal-item {
    transition: none !important;
  }

  .hero-slide-enter-from,
  .hero-slide-leave-to,
  .reveal-item {
    opacity: 1 !important;
    transform: none !important;
  }

  .hero-panel::after,
  .hero-panel .hero-panel-accent::before,
  .hero-panel .hero-panel-accent::after {
    animation: none !important;
    opacity: 0 !important;
  }
}
</style>
