<template>
  <div class="app-container activity-stat">
    <!-- Date Range Filter -->
    <div class="filter-wrapper">
      <div class="date-picker-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
          clearable
          style="width: 100%"
        />
      </div>
    </div>

    <!-- Top Statistics Cards -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="premium-card stat-card" :body-style="{ padding: '0px' }" @click="handleCardClick(card)">
          <div class="card-inner" :class="card.type">
            <div class="card-content">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-trend" :class="card.trend > 0 ? 'up' : 'neutral'">
                <el-icon v-if="card.trend > 0"><CaretTop /></el-icon>
                <span>{{ card.trend > 0 ? '+' : '' }}{{ card.trend }} 今日新增</span>
              </div>
            </div>
            <div class="card-icon">
              <el-icon :size="40"><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 1: Trend and Status Distribution -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="16">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">活动创建趋势</span>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button value="7">近7天</el-radio-button>
                <el-radio-button value="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">活动状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 2: Club Ranking -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">各社团活动数量排名</span>
            </div>
          </template>
          <div ref="clubChartRef" class="chart-container club-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Activity List Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%" destroy-on-close class="stat-dialog">
      <div class="stat-dialog__table">
        <el-table :data="activityList" v-loading="listLoading" stripe border>
        <el-table-column prop="activityId" label="活动ID" width="80" />
        <el-table-column prop="clubName" label="社团名称" width="150" />
        <el-table-column prop="activityTitle" label="活动标题" width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="活动地点" width="150" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="currentParticipants" label="参与人数" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="info">未开始</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success">进行中</el-tag>
            <el-tag v-else-if="scope.row.status === '2'" type="danger">已结束</el-tag>
            <el-tag v-else-if="scope.row.status === '3'" type="warning">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organizer" label="组织者" show-overflow-tooltip />
        </el-table>
      </div>
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="activityTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        class="stat-dialog__pagination"
      />
    </el-dialog>
  </div>
</template>

<script setup name="ActivityStat">
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { getActivityStat, listActivity } from "@/api/club/activity";

let trendChart = null;
let statusChart = null;
let clubChart = null;

const trendChartRef = ref(null);
const statusChartRef = ref(null);
const clubChartRef = ref(null);
const trendTimeRange = ref('7');

const dateRange = ref(null);
const dateShortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); return [start, end]; } },
  { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [start, end]; } },
  { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 3); return [start, end]; } }
];

const statCards = ref([
  { title: '活动总数', value: '0', trend: 0, icon: 'Calendar', type: 'primary', status: null },
  { title: '未开始', value: '0', trend: 0, icon: 'Timer', type: 'warning', status: '0' },
  { title: '进行中', value: '0', trend: 0, icon: 'VideoPlay', type: 'success', status: '1' },
  { title: '已结束', value: '0', trend: 0, icon: 'CircleCheck', type: 'danger', status: '2' }
]);

const rawTrendData = ref([]);
const clubRankingData = ref([]);
const totalActivityCount = ref(0);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const activityList = ref([]);
const listLoading = ref(false);
const activityTotal = ref(0);
const queryParams = ref({ pageNum: 1, pageSize: 10, status: null, clubId: null });

const handleDateChange = () => { fetchData(); };

const fetchData = async () => {
  const query = {};
  if (dateRange.value && dateRange.value.length === 2) {
    query.beginTime = dateRange.value[0];
    query.endTime = dateRange.value[1];
  }
  const response = await getActivityStat(query);
  if (response.code === 200) {
    const data = response.data;
    const statusStat = data.statusStat || [];
    const todayStats = data.todayStats || {};

    let totalVal = 0, upcoming = 0, ongoing = 0, ended = 0;
    statusStat.forEach(item => {
      const count = parseInt(item.count);
      totalVal += count;
      if (item.status === '0') upcoming = count;
      else if (item.status === '1') ongoing = count;
      else if (item.status === '2') ended = count;
    });

    statCards.value = [
      { title: '活动总数', value: totalVal.toLocaleString(), trend: todayStats.totalNew || 0, icon: 'Calendar', type: 'primary', status: null },
      { title: '未开始', value: upcoming.toLocaleString(), trend: todayStats.upcomingNew || 0, icon: 'Timer', type: 'warning', status: '0' },
      { title: '进行中', value: ongoing.toLocaleString(), trend: todayStats.ongoingNew || 0, icon: 'VideoPlay', type: 'success', status: '1' },
      { title: '已结束', value: ended.toLocaleString(), trend: todayStats.endedNew || 0, icon: 'CircleCheck', type: 'danger', status: '2' }
    ];
    totalActivityCount.value = totalVal;

    // Trend
    rawTrendData.value = data.trendStat || [];
    updateTrendChart();

    // Status Pie
    const pieData = [
      { value: ongoing, name: '进行中', itemStyle: { color: '#10b981' } },
      { value: upcoming, name: '未开始', itemStyle: { color: '#f59e0b' } },
      { value: ended, name: '已结束', itemStyle: { color: '#ef4444' } }
    ];
    statusChart?.setOption({
      title: {
        text: totalVal.toLocaleString(), subtext: '活动总数',
        left: 'center', top: '43%',
        textStyle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
        subtextStyle: { fontSize: 14, color: '#999' }
      },
      series: [{ data: pieData }]
    });
    statusChart?.hideLoading();

    // Club Ranking
    clubRankingData.value = data.clubRanking || [];
    const clubNames = clubRankingData.value.map(item => item.clubName).reverse();
    const clubCounts = clubRankingData.value.map(item => item.count).reverse();
    clubChart?.setOption({
      yAxis: { data: clubNames },
      series: [{ data: clubCounts }]
    });
    clubChart?.hideLoading();
  }
};

const updateTrendChart = () => {
  trendChart?.showLoading();
  const range = parseInt(trendTimeRange.value);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - range + 1);

  const dateMap = new Map();
  rawTrendData.value.forEach(item => { dateMap.set(item.day, item.count); });

  const days = [];
  const counts = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${month}-${day}`;
    days.push(dateStr);
    counts.push(dateMap.get(dateStr) || 0);
  }

  trendChart?.setOption({ xAxis: { data: days }, series: [{ data: counts }] });
  trendChart?.hideLoading();
};

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: [], axisLine: { lineStyle: { color: '#e2e8f0' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
      series: [{ type: 'line', smooth: true, data: [], areaStyle: { color: 'rgba(139, 92, 246, 0.1)' }, itemStyle: { color: '#8b5cf6' }, lineStyle: { width: 3 } }]
    });
    trendChart.showLoading();
  }

  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center', icon: 'circle' },
      series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: [] }]
    });
    statusChart.on('mouseover', (params) => {
      statusChart.setOption({ title: { text: params.value, subtext: params.name + ' (' + params.percent + '%)', subtextStyle: { fontSize: 14, color: '#666' } } });
    });
    statusChart.on('mouseout', () => {
      statusChart.setOption({ title: { text: totalActivityCount.value.toLocaleString(), subtext: '活动总数', subtextStyle: { fontSize: 14, color: '#999' } } });
    });
    statusChart.showLoading();
  }

  if (clubChartRef.value) {
    clubChart = echarts.init(clubChartRef.value);
    clubChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
      yAxis: { type: 'category', data: [], axisLabel: { color: '#1e293b', fontWeight: 500 } },
      series: [{ type: 'bar', data: [], itemStyle: { color: '#8b5cf6', borderRadius: [0, 6, 6, 0] }, barWidth: '60%' }]
    });
    clubChart.showLoading();

    clubChart.on('click', (params) => {
      const clubName = params.name;
      const clubInfo = clubRankingData.value.find(item => item.clubName === clubName);
      if (clubInfo) {
        handleClubClick(clubInfo.clubName, clubInfo.clubId);
      }
    });
  }
};

onMounted(async () => {
  initCharts();
  await fetchData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); });

const handleResize = () => {
  trendChart?.resize();
  statusChart?.resize();
  clubChart?.resize();
};

watch(trendTimeRange, () => { updateTrendChart(); });

const handleCardClick = (card) => {
  dialogTitle.value = card.title;
  queryParams.value.status = card.status;
  queryParams.value.clubId = null;
  queryParams.value.pageNum = 1;
  dialogVisible.value = true;
  handleQuery();
};

const handleClubClick = (clubName, clubId) => {
  dialogTitle.value = '社团活动列表 - ' + clubName;
  queryParams.value.clubId = clubId;
  queryParams.value.status = null;
  queryParams.value.pageNum = 1;
  dialogVisible.value = true;
  handleQuery();
};

const handleQuery = async () => {
  listLoading.value = true;
  try {
    const response = await listActivity(queryParams.value);
    if (response.code === 200) {
      activityList.value = response.rows;
      activityTotal.value = Number(response.total) || 0;
    }
  } finally {
    listLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.activity-stat {
  background-color: var(--app-main-bg);
  min-height: calc(100vh - 84px);
  padding: 24px;

  .filter-wrapper {
    margin-bottom: 24px;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    .date-picker-container {
      width: 320px;
      :deep(.el-range-editor.el-input__inner) { width: 100%; }
    }
  }

  .stat-cards {
    .stat-card {
      border: none;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }
      .card-inner {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--el-bg-color-overlay);
        &.primary .card-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
        &.warning .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        &.success .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        &.danger .card-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      }
      .stat-title { font-size: 14px; color: var(--el-text-color-secondary); margin-bottom: 8px; font-weight: 500; }
      .stat-value { font-size: 28px; font-weight: 800; color: var(--el-text-color-primary); margin-bottom: 8px; letter-spacing: -0.02em; }
      .stat-trend {
        display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600;
        &.up { color: #10b981; }
        &.neutral { color: var(--el-text-color-placeholder); }
      }
      .card-icon {
        width: 64px; height: 64px; border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
      }
    }
  }

  .chart-card {
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      .title { font-size: 16px; font-weight: 700; color: var(--el-text-color-primary); }
    }
    .chart-container {
      height: 350px; width: 100%;
      &.club-chart { height: 450px; }
    }
  }

  .mt20 { margin-top: 20px; }
}

.premium-card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  background: var(--el-bg-color-overlay);
}
</style>

<style lang="scss">
.stat-dialog {
  width: 80% !important;
  height: 80vh !important;
  margin-top: 10vh !important;
  display: flex !important;
  flex-direction: column !important;
  .el-dialog__body {
    flex: 1 !important;
    overflow: hidden !important;
    display: flex;
    flex-direction: column;
    min-height: 0 !important;
    padding: 20px !important;
  }
  .stat-dialog__table {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .stat-dialog__pagination {
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    z-index: 2;
    background: var(--el-bg-color-overlay);
    border-top: 1px solid #f0f0f0;
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
