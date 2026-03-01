<template>
  <div class="app-container application-stat">
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

    <!-- Charts Row 1: Trend and Distribution -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="16">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">申请趋势统计</span>
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
              <span class="title">审核状态分布</span>
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
              <span class="title">各社团申请数量排名</span>
            </div>
          </template>
          <div ref="clubChartRef" class="chart-container club-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Application List Dialog -->
    <el-dialog v-model="applicationDialogVisible" :title="dialogTitle" width="80%" destroy-on-close class="stat-dialog">
      <div class="stat-dialog__table">
      <el-table :data="applicationList" v-loading="applicationLoading" stripe border>
        <el-table-column prop="applicationId" label="申请ID" width="80" />
        <el-table-column prop="userName" label="用户名" width="100" />
        <el-table-column prop="nickName" label="昵称" width="100" />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="major" label="专业" width="120" />
        <el-table-column prop="applicationTime" label="申请时间" width="160" />
        <el-table-column prop="status" label="审核状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success">已通过</el-tag>
            <el-tag v-else-if="scope.row.status === '2'" type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyReason" label="申请理由" show-overflow-tooltip />
      </el-table>
      </div>
      <el-pagination
        v-model:current-page="applicationQueryParams.pageNum"
        v-model:page-size="applicationQueryParams.pageSize"
        :total="applicationTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleApplicationQuery"
        @current-change="handleApplicationQuery"
        class="stat-dialog__pagination"
      />
    </el-dialog>
  </div>
</template>

<script setup name="ApplicationStat">
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { getApplicationStat, listApplication } from "@/api/club/application";

// Chart instances
let trendChart = null;
let statusChart = null;
let clubChart = null;

// Refs
const trendChartRef = ref(null);
const statusChartRef = ref(null);
const clubChartRef = ref(null);
const trendTimeRange = ref('7');

// Date range filter
const dateRange = ref(null);
const dateShortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); return [start, end]; } },
  { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [start, end]; } },
  { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 3); return [start, end]; } }
];

// Data
const statCards = ref([
  { title: '总申请数', value: '0', trend: 0, icon: 'Document', type: 'primary', status: null },
  { title: '待审核', value: '0', trend: 0, icon: 'Timer', type: 'warning', status: '0' },
  { title: '已通过', value: '0', trend: 0, icon: 'CircleCheck', type: 'success', status: '1' },
  { title: '被驳回', value: '0', trend: 0, icon: 'CircleClose', type: 'danger', status: '2' }
]);

const rawTrendData = ref([]);
const trendDataByClub = ref([]);
const statusDataByClub = ref([]);
const clubRankingData = ref([]);

// Dialog data
const applicationDialogVisible = ref(false);
const dialogTitle = ref('');
const applicationList = ref([]);
const applicationLoading = ref(false);
const applicationTotal = ref(0);
const applicationQueryParams = ref({
  pageNum: 1,
  pageSize: 10,
  clubId: null,
  status: null
});
const totalApplicationCount = ref(0);

// Date change handler
const handleDateChange = () => {
  fetchData();
};

// Fetch Data
const fetchData = async () => {
  const query = {};
  if (dateRange.value && dateRange.value.length === 2) {
    query.beginTime = dateRange.value[0];
    query.endTime = dateRange.value[1];
  }
  const response = await getApplicationStat(query);
  if (response.code === 200) {
    const data = response.data;
    
    // 1. Map Status Stats to Cards
    const statusStat = data.statusStat || [];
    const todayStats = data.todayStats || {};
    
    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    statusStat.forEach(item => {
      const count = parseInt(item.count);
      total += count;
      if (item.status === '0') pending = count;
      else if (item.status === '1') approved = count;
      else if (item.status === '2') rejected = count;
    });
    
    statCards.value = [
      { title: '总申请数', value: total.toLocaleString(), trend: todayStats.totalNew || 0, icon: 'Document', type: 'primary', status: null },
      { title: '待审核', value: pending.toLocaleString(), trend: todayStats.pendingNew || 0, icon: 'Timer', type: 'warning', status: '0' },
      { title: '已通过', value: approved.toLocaleString(), trend: todayStats.approvedNew || 0, icon: 'CircleCheck', type: 'success', status: '1' },
      { title: '被驳回', value: rejected.toLocaleString(), trend: todayStats.rejectedNew || 0, icon: 'CircleClose', type: 'danger', status: '2' }
    ];
    
    totalApplicationCount.value = total;

    // 2. Trend Data
    rawTrendData.value = data.trendStat || [];
    trendDataByClub.value = data.trendStatByClub || [];
    updateTrendChart();
    
    // 3. Status Distribution
    statusDataByClub.value = data.statusStatByClub || [];
    const pieData = [
      { value: approved, name: '已通过', itemStyle: { color: '#10b981' } },
      { value: pending, name: '待审核', itemStyle: { color: '#f59e0b' } },
      { value: rejected, name: '被驳回', itemStyle: { color: '#ef4444' } }
    ];
    statusChart?.setOption({
      title: {
        text: total.toLocaleString(),
        subtext: '总申请数',
        left: 'center',
        top: '43%', // Adjust to optical center
        textStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 14,
          color: '#999'
        }
      },
      series: [{ data: pieData }]
    });
    statusChart?.hideLoading();
    
    // 4. Club Ranking
    clubRankingData.value = data.clubRankingStat || [];
    const clubData = clubRankingData.value;
    const clubNames = clubData.map(item => item.clubName).reverse();
    const clubCounts = clubData.map(item => item.count).reverse();
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
  rawTrendData.value.forEach(item => {
    dateMap.set(item.day, item.count);
  });
  
  const days = [];
  const counts = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${month}-${day}`;
    days.push(dateStr);
    counts.push(dateMap.get(dateStr) || 0);
  }
  
  trendChart?.setOption({
    xAxis: { data: days },
    series: [{ data: counts }]
  });
  trendChart?.hideLoading();
};

// Initialize Charts with default empty options
const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: { 
        trigger: 'axis',
        formatter: (params) => {
          const day = params[0].axisValue;
          let result = `${day}<br/>总数: ${params[0].value}`;
          
          // Add club-specific data
          const clubData = trendDataByClub.value.filter(item => item.day === day);
          if (clubData.length > 0) {
            clubData.forEach(club => {
              result += `<br/>${club.clubName}: ${club.count}`;
            });
          }
          return result;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: [], axisLine: { lineStyle: { color: '#e2e8f0' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
      series: [{ type: 'line', smooth: true, data: [], areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }, itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 } }]
    });
    trendChart.showLoading();
  }
  
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption({
      tooltip: { 
        trigger: 'item',
        formatter: (params) => {
          const statusName = params.name;
          let result = `${statusName}: ${params.value}`;
          
          // Map status name to status code
          const statusMap = { '待审核': '0', '已通过': '1', '被驳回': '2' };
          const statusCode = statusMap[statusName];
          
          // Add club-specific data
          if (statusCode) {
            const clubData = statusDataByClub.value.filter(item => item.status === statusCode);
            if (clubData.length > 0) {
              clubData.forEach(club => {
                const name = club.clubName || club.clubname || club.CLUBNAME || '未知社团';
                result += `<br/>${name}: ${club.count}`;
              });
            }
          }
          return result;
        }
      },
      legend: { bottom: '5%', left: 'center', icon: 'circle' },
      series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: [] }]
    });
    statusChart.on('mouseover', (params) => {
      const { name, value, percent } = params;
      statusChart.setOption({
        title: {
          text: value,
          subtext: name + ' (' + percent + '%)',
          subtextStyle: { fontSize: 14, color: '#666' }
        }
      });
    });
    statusChart.on('mouseout', () => {
      statusChart.setOption({
        title: {
          text: totalApplicationCount.value.toLocaleString(),
          subtext: '总申请数',
          subtextStyle: { fontSize: 14, color: '#999' }
        }
      });
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
      series: [{ type: 'bar', data: [], itemStyle: { color: '#3b82f6', borderRadius: [0, 6, 6, 0] }, barWidth: '60%' }]
    });
    clubChart.showLoading();
    
    // Add click event for club ranking chart
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

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  trendChart?.resize();
  statusChart?.resize();
  clubChart?.resize();
};

watch(trendTimeRange, () => {
  updateTrendChart();
});

// Handle stat card click
const handleCardClick = (card) => {
  dialogTitle.value = card.title;
  applicationQueryParams.value.status = card.status;
  applicationQueryParams.value.clubId = null;
  applicationQueryParams.value.pageNum = 1;
  applicationDialogVisible.value = true;
  handleApplicationQuery();
};

// Handle club ranking click
const handleClubClick = async (clubName, clubId) => {
  dialogTitle.value = '入社申请列表 - ' + clubName;
  applicationQueryParams.value.clubId = clubId;
  applicationQueryParams.value.status = null;
  applicationQueryParams.value.pageNum = 1;
  applicationDialogVisible.value = true;
  await handleApplicationQuery();
};

// Fetch application list for dialog
const handleApplicationQuery = async () => {
  applicationLoading.value = true;
  try {
    const response = await listApplication(applicationQueryParams.value);
    if (response.code === 200) {
      applicationList.value = response.rows;
      applicationTotal.value = Number(response.total) || 0;
    }
  } finally {
    applicationLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.application-stat {
  background-color: var(--app-main-bg);
  min-height: calc(100vh - 84px);
  padding: 24px;

  .filter-wrapper {
    margin-bottom: 24px;
    display: flex;
    justify-content: flex-end;
    width: 100%;

    .date-picker-container {
      width: 320px; /* Set fixed width for the date picker wrapper */
      
      :deep(.el-range-editor.el-input__inner) {
        width: 100%;
      }
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

        &.primary .card-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        &.warning .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        &.success .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        &.danger .card-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      }

      .stat-title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 800;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        letter-spacing: -0.02em;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;

        &.up { color: #10b981; }
        &.down { color: #ef4444; }
        &.neutral { color: var(--el-text-color-placeholder); }
      }

      .card-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title { font-size: 16px; font-weight: 700; color: var(--el-text-color-primary); }
    }
    
    .chart-container {
      height: 350px;
      width: 100%;
      
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
/* Dialog size: 80% width x 80% viewport height */
.stat-dialog {
  width: 80% !important;
  height: 80vh !important;
  margin-top: 10vh !important; /* Vertically center roughly */
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
    background: var(--el-bg-color-overlay);
    border-top: 1px solid #f0f0f0;
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
