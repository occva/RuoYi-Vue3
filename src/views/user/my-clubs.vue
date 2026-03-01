<template>
  <div class="my-clubs-page">
    <!-- 页面头部 Hero Section -->
    <header class="page-header">
      <div class="header-content container">
        <div class="header-text">
          <h1 class="page-title">我的<span class="highlight">社团</span>空间</h1>
          <p class="page-subtitle">管理你的社团，查看申请进度，收藏感兴趣的组织</p>
        </div>
      </div>
      <div class="header-bg-decoration">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>
    </header>

    <div class="main-content container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else class="content-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <!-- 1. 我的社团 (Joined + Managed) -->
          <el-tab-pane label="我的社团" name="joined">
            <el-tabs v-model="clubSubTab" class="application-sub-tabs">
              <el-tab-pane :label="`全部社团 (${managedClubs.length + joinedClubs.length})`" name="all" />
              <el-tab-pane :label="`我管理的 (${managedClubs.length})`" name="managed" />
              <el-tab-pane :label="`我加入的 (${joinedClubs.length})`" name="joined" />
            </el-tabs>
            
            <!-- Managed Clubs Section -->
            <section v-if="visibleManagedClubs.length > 0" class="section-block animate-in">
              <h2 class="section-title">
                <el-icon><Management /></el-icon>
                我管理的社团
              </h2>
              <div class="clubs-grid">
                <div 
                  v-for="(club, index) in visibleManagedClubs" 
                  :key="club.clubId" 
                  class="club-card"
                  :style="{ '--delay': index * 0.05 + 's' }"
                  @click="goToManagedDetail(club)"
                >
                  <div class="card-image-wrapper">
                    <el-image :src="club.logoUrl" :alt="club.clubName" class="club-image" fit="cover">
                      <template #error>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="role-badge manager">社长</div>
                  </div>
                  
                  <div class="club-content">
                    <div class="club-info-top">
                      <h3 class="club-name">{{ club.clubName }}</h3>
                      <span class="category-tag" v-if="club.categoryName">{{ club.categoryName }}</span>
                    </div>
                    
                    <p class="club-desc line-clamp-2">{{ club.description }}</p>
                    
                    <div class="club-footer">
                       <div class="view-detail">
                        进入管理 <el-icon><ArrowRight /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Joined Clubs Section -->
            <section v-if="visibleJoinedClubs.length > 0" class="section-block animate-in" :style="{ '--delay': '0.2s' }">
              <h2 class="section-title">
                <el-icon><UserFilled /></el-icon>
                我加入的社团
              </h2>
              <div class="clubs-grid">
                <div 
                  v-for="(club, index) in visibleJoinedClubs" 
                  :key="club.clubId" 
                  class="club-card"
                  :style="{ '--delay': (index * 0.05 + 0.2) + 's' }"
                  @click="goToDetail(club)"
                >
                  <div class="card-image-wrapper">
                    <el-image :src="club.logoUrl" :alt="club.clubName" class="club-image" fit="cover">
                      <template #error>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                     <div class="role-badge member">成员</div>
                  </div>
                  
                  <div class="club-content">
                    <div class="club-info-top">
                      <h3 class="club-name">{{ club.clubName }}</h3>
                      <span class="category-tag" v-if="club.categoryName">{{ club.categoryName }}</span>
                    </div>
                    
                    <p class="club-desc line-clamp-2">{{ club.description }}</p>

                    <div class="club-footer">
                      <el-button 
                        type="danger" 
                        link 
                        size="small"
                        @click.stop="handleQuit(club)"
                      >
                        退出社团
                      </el-button>
                      <div class="view-detail">
                        查看详情 <el-icon><ArrowRight /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Empty State -->
            <div v-if="visibleManagedClubs.length === 0 && visibleJoinedClubs.length === 0" class="empty-state">
              <el-empty :description="clubEmptyDescription">
                <template #extra>
                  <el-button type="primary" plain @click="$router.push('/user/clubs')">去浏览社团</el-button>
                </template>
              </el-empty>
            </div>
          </el-tab-pane>

          <!-- 2. 我的活动 -->
          <el-tab-pane label="我的活动" name="activities">
            <el-tabs v-model="activitySubTab" class="application-sub-tabs">
              <el-tab-pane :label="`所有活动 (${myActivities.length})`" name="all" />
              <el-tab-pane :label="`尚未开始 (${upcomingActivities.length})`" name="upcoming" />
              <el-tab-pane :label="`进行中 (${ongoingActivities.length})`" name="ongoing" />
              <el-tab-pane :label="`已结束 (${endedActivities.length})`" name="ended" />
            </el-tabs>
            <div v-if="filteredMyActivities.length > 0" class="applications-list animate-in">
              <article
                v-for="(activity, index) in filteredMyActivities"
                :key="activity.activityId"
                class="app-card"
                :style="{ '--delay': index * 0.05 + 's' }"
              >
                <div class="app-header">
                  <div class="app-title">
                    <h3 class="app-club-name clickable" @click="viewActivityDetail(activity)">
                      {{ activity.activityTitle }}
                    </h3>
                    <el-tag size="small" effect="plain" type="primary">
                      {{ activity.clubName || '社团活动' }}
                    </el-tag>
                  </div>
                  <el-tag :type="getActivityStatusType(activity.status)" effect="light" round>
                    {{ getActivityStatusText(activity.status) }}
                  </el-tag>
                </div>
                <div class="app-meta">
                  <div class="meta-item">
                    <span>开始时间</span>
                    <strong>{{ formatTime(activity.startTime) }}</strong>
                  </div>
                  <div class="meta-item">
                    <span>活动地点</span>
                    <strong>{{ activity.location || '-' }}</strong>
                  </div>
                  <div class="meta-item">
                    <span>参与人数</span>
                    <strong>{{ activity.currentParticipants || 0 }} / {{ activity.maxParticipants || '不限' }}</strong>
                  </div>
                </div>
                <div class="app-content">
                  <div class="content-block">
                    <label>活动简介</label>
                    <p>{{ activity.description || '暂无' }}</p>
                  </div>
                </div>
                <div class="app-actions">
                  <el-button link type="primary" @click="viewActivityDetail(activity)">
                    查看活动详情
                  </el-button>
                </div>
              </article>
            </div>
            <div v-else class="empty-state application-empty">
              <el-empty :description="activityEmptyDescription">
                <template #extra>
                  <el-button type="primary" plain @click="$router.push('/user/activities')">去看看校园活动</el-button>
                </template>
              </el-empty>
            </div>
          </el-tab-pane>

          <!-- 3. 我的收藏 -->
          <el-tab-pane label="我的收藏" name="favorites">
            <div v-if="favoriteClubs.length > 0" class="clubs-grid animate-in">
               <div 
                  v-for="(club, index) in favoriteClubs" 
                  :key="club.clubId" 
                  class="club-card"
                  :style="{ '--delay': index * 0.05 + 's' }"
                  @click="goToDetail(club)"
                >
                  <div class="card-image-wrapper">
                    <el-image :src="club.logoUrl" :alt="club.clubName" class="club-image" fit="cover">
                      <template #error>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                     <div class="role-badge favorite">已收藏</div>
                  </div>
                  
                  <div class="club-content">
                    <div class="club-info-top">
                      <h3 class="club-name">{{ club.clubName }}</h3>
                    </div>
                    
                    <p class="club-desc line-clamp-2">{{ club.description || '暂无简介' }}</p>
                    
                    <div class="club-footer">
                       <div class="view-detail">
                        查看详情 <el-icon><ArrowRight /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            <div v-else class="empty-state">
               <el-empty description="您还没有收藏任何社团">
                  <template #extra>
                    <el-button type="primary" plain @click="$router.push('/user/clubs')">去浏览社团</el-button>
                  </template>
               </el-empty>
            </div>
          </el-tab-pane>

          <!-- 4. 我的申请 -->
          <el-tab-pane label="我的申请" name="applications">
            <el-tabs v-model="applicationSubTab" class="application-sub-tabs">
              <el-tab-pane :label="`加入社团申请 (${joinApplications.length})`" name="join">
                <div v-if="joinApplications.length > 0" class="applications-list animate-in">
                  <article
                    v-for="(app, index) in joinApplications"
                    :key="app.applicationId"
                    class="app-card"
                    :style="{ '--delay': index * 0.05 + 's' }"
                  >
                    <div class="app-header">
                      <div class="app-title">
                        <h3 class="app-club-name clickable" @click="$router.push(`/user/club/${app.clubId}`)">
                          {{ app.clubName }}
                        </h3>
                        <el-tag size="small" effect="plain" type="info">加入社团</el-tag>
                      </div>
                      <el-tag :type="getJoinStatusType(app.status)" effect="light" round>
                        {{ getJoinStatusText(app.status) }}
                      </el-tag>
                    </div>
                    <div class="app-meta">
                      <div class="meta-item">
                        <span>申请时间</span>
                        <strong>{{ formatTime(app.applicationTime) }}</strong>
                      </div>
                      <div class="meta-item">
                        <span>社团 ID</span>
                        <strong>#{{ app.clubId }}</strong>
                      </div>
                      <div class="meta-item">
                        <span>联系电话</span>
                        <strong>{{ app.phone || '-' }}</strong>
                      </div>
                    </div>
                    <div class="app-content">
                      <div class="content-block">
                        <label>申请理由</label>
                        <p>{{ app.applyReason || '暂无' }}</p>
                      </div>
                      <div v-if="app.reviewComment" class="content-block review-comment">
                        <label>审核意见</label>
                        <p>{{ app.reviewComment }}</p>
                      </div>
                    </div>
                  </article>
                </div>
                <div v-else class="empty-state application-empty">
                  <el-empty description="暂无加入社团申请记录">
                    <template #extra>
                      <el-button type="primary" plain @click="$router.push('/user/clubs')">去申请加入</el-button>
                    </template>
                  </el-empty>
                </div>
              </el-tab-pane>

              <el-tab-pane :label="`创建社团申请 (${createApplications.length})`" name="create">
                <div v-if="createApplications.length > 0" class="applications-list animate-in">
                  <article
                    v-for="(app, index) in createApplications"
                    :key="app.applyId"
                    class="app-card"
                    :style="{ '--delay': index * 0.05 + 's' }"
                  >
                    <div class="app-header">
                      <div class="app-title">
                        <h3 class="app-club-name">
                          {{ app.clubName }}
                        </h3>
                        <el-tag size="small" effect="plain" type="success">创建社团</el-tag>
                      </div>
                      <el-tag :type="getCreateStatusType(app.status)" effect="light" round>
                        {{ getCreateStatusText(app.status) }}
                      </el-tag>
                    </div>
                    <div class="app-meta">
                      <div class="meta-item">
                        <span>申请时间</span>
                        <strong>{{ formatTime(app.applyTime) }}</strong>
                      </div>
                      <div class="meta-item">
                        <span>社团分类</span>
                        <strong>{{ app.categoryName || '-' }}</strong>
                      </div>
                      <div class="meta-item">
                        <span>联系电话</span>
                        <strong>{{ app.contactPhone || '-' }}</strong>
                      </div>
                    </div>
                    <div class="app-content">
                      <div class="content-block">
                        <label>社团简介</label>
                        <p>{{ app.description || '暂无' }}</p>
                      </div>
                      <div class="content-block">
                        <label>申请理由</label>
                        <p>{{ app.applyReason || '暂无' }}</p>
                      </div>
                      <div v-if="app.reviewComment" class="content-block review-comment">
                        <label>审核意见</label>
                        <p>{{ app.reviewComment }}</p>
                      </div>
                    </div>
                    <div v-if="app.status === '1'" class="app-actions">
                      <el-button
                        v-if="app.approvedClubId"
                        link
                        type="primary"
                        @click="goToApprovedClub(app)"
                      >
                        查看已创建社团
                      </el-button>
                      <span v-if="app.adminUserName" class="account-text">
                        社长后台账号：{{ app.adminUserName }}
                      </span>
                    </div>
                  </article>
                </div>
                <div v-else class="empty-state application-empty">
                  <el-empty description="暂无创建社团申请记录">
                    <template #extra>
                      <el-button type="primary" plain @click="$router.push('/user/club-apply')">去申请创建</el-button>
                    </template>
                  </el-empty>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyClubs, quitClub } from '@/api/user/club'
import { listMyActivities } from '@/api/user/activity'
import { Management, UserFilled, Picture, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeTab = ref('joined')
const clubSubTab = ref('all')
const activitySubTab = ref('all')
const applicationSubTab = ref('join')

const managedClubs = ref([])
const joinedClubs = ref([])
const favoriteClubs = ref([])
const myActivities = ref([])
const joinApplications = ref([])
const createApplications = ref([])

const validTabs = ['joined', 'activities', 'favorites', 'applications']

const visibleManagedClubs = computed(() => {
  if (clubSubTab.value === 'joined') return []
  return managedClubs.value
})

const visibleJoinedClubs = computed(() => {
  if (clubSubTab.value === 'managed') return []
  return joinedClubs.value
})

const clubEmptyDescription = computed(() => {
  if (clubSubTab.value === 'managed') return '暂无我管理的社团'
  if (clubSubTab.value === 'joined') return '暂无我加入的社团'
  return '您还没有加入任何社团'
})

const upcomingActivities = computed(() => myActivities.value.filter(activity => activity.status === '0'))
const ongoingActivities = computed(() => myActivities.value.filter(activity => activity.status === '1'))
const endedActivities = computed(() => myActivities.value.filter(activity => activity.status === '2' || activity.status === '3'))

const filteredMyActivities = computed(() => {
  if (activitySubTab.value === 'upcoming') return upcomingActivities.value
  if (activitySubTab.value === 'ongoing') return ongoingActivities.value
  if (activitySubTab.value === 'ended') return endedActivities.value
  return myActivities.value
})

const activityEmptyDescription = computed(() => {
  if (activitySubTab.value === 'upcoming') return '暂无尚未开始活动'
  if (activitySubTab.value === 'ongoing') return '暂无进行中活动'
  if (activitySubTab.value === 'ended') return '暂无已结束活动'
  return '暂无我的活动'
})

const syncTabFromQuery = () => {
  const tab = route.query?.tab
  if (typeof tab === 'string' && validTabs.includes(tab)) {
    activeTab.value = tab
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([getMyClubs(), listMyActivities()])
    const res = results[0].status === 'fulfilled' ? results[0].value : { code: 500, msg: '获取社团数据失败' }
    const myActivitiesRes = results[1].status === 'fulfilled' ? results[1].value : { code: 500 }

    if (res.code === 200) {
      managedClubs.value = res.managed || []
      joinedClubs.value = res.joined || []
      favoriteClubs.value = res.favorites || []
      joinApplications.value = res.applications || []
      createApplications.value = res.createApplications || []
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }

    if (myActivitiesRes.code === 200) {
      const allActivities = myActivitiesRes.data || myActivitiesRes.rows || []
      myActivities.value = allActivities
    } else {
      myActivities.value = []
    }
  } catch (error) {
    myActivities.value = []
    if (error.response && error.response.status === 401) {
      // redirect handled by permission guard
    }
  } finally {
    loading.value = false
  }
}

const goToDetail = (club) => {
  router.push(`/user/club/${club.clubId}`)
}

const goToManagedDetail = (club) => {
  router.push(`/user/club/${club.clubId}`)
}

const getJoinStatusType = (status) => {
  const map = { '0': 'warning', '1': 'success', '2': 'danger', '3': 'info' }
  return map[status] || 'info'
}

const getJoinStatusText = (status) => {
  const map = { '0': '审核中', '1': '已通过', '2': '已拒绝', '3': '已撤回' }
  return map[status] || '未知状态'
}

const getCreateStatusType = (status) => {
  const map = { '0': 'warning', '1': 'success', '2': 'danger' }
  return map[status] || 'info'
}

const getCreateStatusText = (status) => {
  const map = { '0': '审核中', '1': '已通过', '2': '已拒绝' }
  return map[status] || '未知状态'
}

const getActivityStatusType = (status) => {
  const map = { '0': 'warning', '1': 'success', '2': 'info', '3': 'danger' }
  return map[status] || 'info'
}

const getActivityStatusText = (status) => {
  const map = { '0': '即将开始', '1': '进行中', '2': '已结束', '3': '已取消' }
  return map[status] || '未知状态'
}

const formatTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goToApprovedClub = (app) => {
  if (!app.approvedClubId) return
  router.push(`/user/club/${app.approvedClubId}`)
}

const viewActivityDetail = (activity) => {
  if (!activity?.activityId) return
  router.push(`/user/activity/${activity.activityId}`)
}

const handleQuit = (club) => {
  ElMessageBox.confirm(
    `确定要退出社团 "${club.clubName}" 吗？退出后再次加入可能需要重新审核。`,
    '退出确认',
    {
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await quitClub(club.clubId)
      if (res.code === 200) {
        ElMessage.success('退出成功')
        fetchData()
      } else {
        ElMessage.error(res.msg || '退出失败')
      }
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {
    // cancelled
  })
}

onMounted(() => {
  syncTabFromQuery()
  fetchData()
})

watch(() => route.query.tab, () => {
  syncTabFromQuery()
})
</script>

<style lang="scss" scoped>
.my-clubs-page {
  --hero-header-overlap: 72px;
  position: relative;
  isolation: isolate;
  overflow-x: clip;
  min-height: 100vh;
  padding-bottom: 5rem;
  background: linear-gradient(180deg, #f6f5ff 0%, #f7f8ff 40%, #ffffff 100%);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Page Header / Hero Section */
.page-header {
  position: relative;
  background:
    radial-gradient(circle at 12% 18%, rgba(99, 102, 241, 0.24), transparent 46%),
    radial-gradient(circle at 88% 12%, rgba(56, 189, 248, 0.14), transparent 42%),
    linear-gradient(120deg, #eef2ff 0%, #f5f3ff 46%, #f0f9ff 100%);
  color: #0b1224;
  margin-top: calc(-1 * var(--hero-header-overlap));
  padding: calc(1rem + var(--hero-header-overlap)) 0 8rem;
  overflow: hidden;
  text-align: center;
  margin-bottom: -6rem; /* Overlap with content */

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background-image: radial-gradient(rgba(99, 102, 241, 0.16) 1.2px, transparent 1.2px);
    background-size: 22px 22px;
    opacity: 0.28;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.46), transparent 88%);
  }

  &::after {
    inset: auto 0 -1px;
    height: 128px;
    background: linear-gradient(180deg, rgba(247, 248, 255, 0), #f7f8ff 70%, #f7f8ff 100%);
  }
}

.header-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 3.5rem; /* Matched to clubs.vue */
  font-weight: 900;
  margin-bottom: 1rem;
  color: #0b1224;
  letter-spacing: -0.025em;
  
  .highlight {
    background: linear-gradient(120deg, #818cf8 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: #3b4760;
  max-width: 600px;
  margin: 0 auto 2.5rem; /* Matched to clubs.vue */
  line-height: 1.6;
}

.header-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  filter: blur(18px);
  opacity: 0.42;
}

.blob-1 {
  width: 300px;
  height: 220px;
  right: 10%;
  top: 20%;
  border-radius: 28px;
  transform: rotate(-14deg);
  background: linear-gradient(140deg, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0.06));
}

.blob-2 {
  width: 260px;
  height: 260px;
  left: -120px;
  top: -88px;
  border-radius: 40% 60% 58% 42% / 44% 36% 64% 56%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0));
}

/* Main Content Area */
.main-content {
  position: relative;
  z-index: 20;
}

.content-wrapper {
    background: linear-gradient(180deg, #ffffff, #fcfdff);
    border: 1px solid rgba(226, 232, 240, 0.78);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
    min-height: 400px;
}

.section-block {
  margin-bottom: 3.5rem;
  
  &:last-child {
      margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
  
  .el-icon {
    color: #4f46e5;
    background: #e0e7ff;
    padding: 6px;
    border-radius: 8px;
  }
}

.clubs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Matched minmax to clubs.vue */
  gap: 2rem;
}

/* Club Cards - Matched to ClubCard.vue */
.club-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #e2e8f0;

    .club-image {
      transform: scale(1.05);
    }
    
    .view-detail {
        color: #4f46e5;
    }
  }
}

.card-image-wrapper {
  height: 200px; /* Matched to ClubCard.vue */
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
}

.club-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 2rem;
}

.role-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 20px; /* Matched rounded style */
    font-size: 12px;
    font-weight: 600;
    color: white;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.manager {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }
    
    &.member {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    &.favorite {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }
}

.club-content {
  padding: 1.5rem; /* Matched to ClubCard.vue */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 12px;
}

.club-name {
  font-size: 1.25rem; /* Matched to ClubCard.vue */
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.category-tag {
  background: #eff6ff; /* Matched to ClubCard.vue */
  color: #3b82f6; /* Matched to ClubCard.vue */
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.club-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  line-height: 1.5; /* Matched to ClubCard.vue */
  height: 2.7rem; /* Matched to ClubCard.vue */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.club-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.view-detail {
  font-size: 0.85rem; /* Matched to ClubCard.vue */
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  margin-left: auto;

  &:hover {
    color: #4f46e5;
  }
}

.loading-state {
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
}

.empty-state {
  padding: 6rem 0;
  display: flex;
  justify-content: center;
}

/* Applications List Styles */
.application-sub-tabs {
  margin-top: 0.5rem;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-empty {
  padding: 3rem 0;
}

.app-card {
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.25s ease;

  &:hover {
    border-color: #c7d2fe;
    box-shadow: 0 12px 20px -12px rgba(79, 70, 229, 0.35);
    transform: translateY(-1px);
  }
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-club-name {
  font-size: 1.06rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;

  &.clickable {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #4f46e5;
    }
  }
}

.app-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.meta-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  span {
    font-size: 0.78rem;
    color: #64748b;
  }

  strong {
    font-size: 0.92rem;
    color: #0f172a;
    font-weight: 600;
  }
}

.app-content {
  display: grid;
  gap: 0.7rem;
}

.content-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.8rem;

  label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.4rem;
  }

  p {
    margin: 0;
    color: #334155;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &.review-comment {
    border-left: 3px solid #6366f1;
    background: #eef2ff;
  }
}

.app-actions {
  margin-top: 0.85rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
}

.account-text {
  font-size: 0.88rem;
  color: #334155;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
}

/* Tabs Stylings Override */
:deep(.custom-tabs) {
    .el-tabs__nav-wrap::after {
        height: 2px;
        background-color: #f1f5f9;
        z-index: 1;
    }
    
    .el-tabs__item {
        font-size: 1.05rem;
        font-weight: 600;
        color: #64748b;
        height: 54px;
        line-height: 54px;
        transition: all 0.3s;
        
        &.is-active {
             font-weight: 700;
             color: #4f46e5;
        }

        &:hover {
            color: #4f46e5;
        }
    }
    
    .el-tabs__active-bar {
        background-color: #4f46e5;
        height: 3px;
        border-radius: 3px;
    }
}

:deep(.application-sub-tabs) {
  .el-tabs__item {
    font-size: 0.96rem;
    height: 44px;
    line-height: 44px;
  }

  .el-tabs__nav-wrap::after {
    background-color: #e2e8f0;
  }
}

@media (max-width: 768px) {
  .my-clubs-page {
    --hero-header-overlap: 64px;
  }

  .blob-1 {
    width: 220px;
    height: 160px;
    right: -46px;
    top: 24%;
  }

  .blob-2 {
    width: 190px;
    height: 190px;
    left: -92px;
    top: -50px;
  }

  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Animations */
.animate-in {
  animation: slideInUp 0.6s ease forwards;
  opacity: 0;
  animation-delay: var(--delay, 0s);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

