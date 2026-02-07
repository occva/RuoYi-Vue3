<template>
  <div class="app-container application-stat">
    <!-- Top Statistics Cards -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="premium-card stat-card" :body-style="{ padding: '0px' }">
          <div class="card-inner" :class="card.type">
            <div class="card-content">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-trend" :class="card.trend > 0 ? 'up' : 'down'">
                <el-icon><CaretTop v-if="card.trend > 0" /><CaretBottom v-else /></el-icon>
                <span>{{ Math.abs(card.trend) }}% 环比昨日</span>
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
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
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
  </div>
</template>

<script setup name="ApplicationStat">
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { getApplicationStat } from "@/api/club/application";

// Chart instances
let trendChart = null;
let statusChart = null;
let clubChart = null;

// Refs
const trendChartRef = ref(null);
const statusChartRef = ref(null);
const clubChartRef = ref(null);
const trendTimeRange = ref('7');

// Data
const statCards = ref([
  { title: '总申请数', value: '0', trend: 0, icon: 'Document', type: 'primary' },
  { title: '待审核', value: '0', trend: 0, icon: 'Timer', type: 'warning' },
  { title: '已通过', value: '0', trend: 0, icon: 'CircleCheck', type: 'success' },
  { title: '被驳回', value: '0', trend: 0, icon: 'CircleClose', type: 'danger' }
]);

const rawTrendData = ref([]);

// Fetch Data
const fetchData = async () => {
  const response = await getApplicationStat();
  if (response.code === 200) {
    const data = response.data;
    
    // 1. Map Status Stats to Cards
    const statusStat = data.statusStat || [];
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
      { title: '总申请数', value: total.toLocaleString(), trend: 0, icon: 'Document', type: 'primary' },
      { title: '待审核', value: pending.toLocaleString(), trend: 0, icon: 'Timer', type: 'warning' },
      { title: '已通过', value: approved.toLocaleString(), trend: 0, icon: 'CircleCheck', type: 'success' },
      { title: '被驳回', value: rejected.toLocaleString(), trend: 0, icon: 'CircleClose', type: 'danger' }
    ];
    
    // 2. Trend Data
    rawTrendData.value = data.trendStat || [];
    updateTrendChart();
    
    // 3. Status Distribution
    const pieData = [
      { value: approved, name: '已通过', itemStyle: { color: '#10b981' } },
      { value: pending, name: '待审核', itemStyle: { color: '#f59e0b' } },
      { value: rejected, name: '被驳回', itemStyle: { color: '#ef4444' } }
    ];
    statusChart?.setOption({ series: [{ data: pieData }] });
    statusChart?.hideLoading();
    
    // 4. Club Ranking
    const clubData = data.clubRankingStat || [];
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
      tooltip: { trigger: 'axis' },
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
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center', icon: 'circle' },
      series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: [] }]
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
</script>

<style lang="scss" scoped>
.application-stat {
  background-color: #f7f9fb;
  min-height: calc(100vh - 84px);
  padding: 24px;

  .stat-cards {
    .stat-card {
      border: none;
      transition: transform 0.3s;
      &:hover { transform: translateY(-5px); }
      
      .card-inner {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;

        &.primary .card-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        &.warning .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        &.success .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        &.danger .card-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      }

      .stat-title {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 800;
        color: #1e293b;
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
      .title { font-size: 16px; font-weight: 700; color: #1e293b; }
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
  background: #ffffff;
}
</style>
