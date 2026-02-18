<template>
  <div class="app-container club-stat">
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

    <!-- Charts Row 1: Trend and Category Distribution -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="16">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">社团创建趋势</span>
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
              <span class="title">社团分类分布</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 2: Member Ranking -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">社团成员数排名</span>
            </div>
          </template>
          <div ref="rankingChartRef" class="chart-container club-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Club List Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%" destroy-on-close class="stat-dialog">
      <div class="stat-dialog__table">
        <el-table :data="clubList" v-loading="listLoading" stripe border>
        <el-table-column prop="clubId" label="社团ID" width="80" />
        <el-table-column prop="clubName" label="社团名称" width="150" />
        <el-table-column prop="clubCode" label="社团编码" width="120" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="presidentName" label="社长" width="100" />
        <el-table-column prop="memberCount" label="成员数" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        </el-table>
      </div>
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        class="stat-dialog__pagination"
      />
    </el-dialog>
  </div>
</template>

<script setup name="ClubStat">
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { getClubStat, listClub } from "@/api/club/club";

let trendChart = null;
let categoryChart = null;
let rankingChart = null;

const trendChartRef = ref(null);
const categoryChartRef = ref(null);
const rankingChartRef = ref(null);
const trendTimeRange = ref('7');

const dateRange = ref(null);
const dateShortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); return [start, end]; } },
  { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [start, end]; } },
  { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 3); return [start, end]; } }
];

const statCards = ref([
  { title: '社团总数', value: '0', trend: 0, icon: 'OfficeBuilding', type: 'primary', status: null, isRecruiting: null },
  { title: '正常社团', value: '0', trend: 0, icon: 'CircleCheck', type: 'success', status: '0', isRecruiting: null },
  { title: '停用社团', value: '0', trend: 0, icon: 'CircleClose', type: 'danger', status: '1', isRecruiting: null },
  { title: '招新中', value: '0', trend: 0, icon: 'Bell', type: 'warning', status: null, isRecruiting: '1' }
]);

const rawTrendData = ref([]);
const categoryData = ref([]);
const rankingData = ref([]);
const totalCount = ref(0);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const clubList = ref([]);
const listLoading = ref(false);
const total = ref(0);
const queryParams = ref({ pageNum: 1, pageSize: 10, status: null, isRecruiting: null });

const handleDateChange = () => { fetchData(); };

const fetchData = async () => {
  const query = {};
  if (dateRange.value && dateRange.value.length === 2) {
    query.beginTime = dateRange.value[0];
    query.endTime = dateRange.value[1];
  }
  const response = await getClubStat(query);
  if (response.code === 200) {
    const data = response.data;
    const statusStat = data.statusStat || [];
    const todayStats = data.todayStats || {};

    let totalVal = 0, active = 0, disabled = 0;
    statusStat.forEach(item => {
      const count = parseInt(item.count);
      totalVal += count;
      if (item.status === '0') active = count;
      else if (item.status === '1') disabled = count;
    });

    const recruitingCount = Number(data.recruitingCount) || 0;

    statCards.value = [
      { title: '社团总数', value: totalVal.toLocaleString(), trend: todayStats.totalNew || 0, icon: 'OfficeBuilding', type: 'primary', status: null, isRecruiting: null },
      { title: '正常社团', value: active.toLocaleString(), trend: todayStats.activeNew || 0, icon: 'CircleCheck', type: 'success', status: '0', isRecruiting: null },
      { title: '停用社团', value: disabled.toLocaleString(), trend: todayStats.disabledNew || 0, icon: 'CircleClose', type: 'danger', status: '1', isRecruiting: null },
      { title: '招新中', value: recruitingCount.toLocaleString(), trend: todayStats.recruitingNew || 0, icon: 'Bell', type: 'warning', status: null, isRecruiting: '1' }
    ];
    totalCount.value = totalVal;

    // Trend
    rawTrendData.value = data.trendStat || [];
    updateTrendChart();

    // Category Pie
    categoryData.value = data.categoryStat || [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    const pieData = categoryData.value.map((item, i) => ({
      value: item.count, name: item.categoryName || '未分类',
      itemStyle: { color: colors[i % colors.length] }
    }));
    categoryChart?.setOption({
      title: {
        text: totalVal.toLocaleString(), subtext: '社团总数',
        left: 'center', top: '43%',
        textStyle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
        subtextStyle: { fontSize: 14, color: '#999' }
      },
      series: [{ data: pieData }]
    });
    categoryChart?.hideLoading();

    // Ranking
    rankingData.value = data.memberRanking || [];
    const clubNames = rankingData.value.map(item => item.clubName).reverse();
    const memberCounts = rankingData.value.map(item => item.memberCount || 0).reverse();
    rankingChart?.setOption({
      yAxis: { data: clubNames },
      series: [{ data: memberCounts }]
    });
    rankingChart?.hideLoading();
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
      series: [{ type: 'line', smooth: true, data: [], areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }, itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 } }]
    });
    trendChart.showLoading();
  }

  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value);
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center', icon: 'circle' },
      series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: [] }]
    });
    categoryChart.on('mouseover', (params) => {
      categoryChart.setOption({ title: { text: params.value, subtext: params.name + ' (' + params.percent + '%)', subtextStyle: { fontSize: 14, color: '#666' } } });
    });
    categoryChart.on('mouseout', () => {
      categoryChart.setOption({ title: { text: totalCount.value.toLocaleString(), subtext: '社团总数', subtextStyle: { fontSize: 14, color: '#999' } } });
    });
    categoryChart.showLoading();
  }

  if (rankingChartRef.value) {
    rankingChart = echarts.init(rankingChartRef.value);
    rankingChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
      yAxis: { type: 'category', data: [], axisLabel: { color: '#1e293b', fontWeight: 500 } },
      series: [{ type: 'bar', data: [], itemStyle: { color: '#3b82f6', borderRadius: [0, 6, 6, 0] }, barWidth: '60%' }]
    });
    rankingChart.showLoading();
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
  categoryChart?.resize();
  rankingChart?.resize();
};

watch(trendTimeRange, () => { updateTrendChart(); });

const handleCardClick = (card) => {
  dialogTitle.value = card.title;
  queryParams.value.status = card.status ?? null;
  queryParams.value.isRecruiting = card.isRecruiting ?? null;
  queryParams.value.pageNum = 1;
  dialogVisible.value = true;
  handleQuery();
};

const handleQuery = async () => {
  listLoading.value = true;
  try {
    const response = await listClub(queryParams.value);
    if (response.code === 200) {
      clubList.value = response.rows;
      total.value = Number(response.total) || 0;
    }
  } finally {
    listLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.club-stat {
  background-color: #f7f9fb;
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
        background: white;
        &.primary .card-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        &.warning .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        &.success .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        &.danger .card-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      }
      .stat-title { font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: 500; }
      .stat-value { font-size: 28px; font-weight: 800; color: #1e293b; margin-bottom: 8px; letter-spacing: -0.02em; }
      .stat-trend {
        display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600;
        &.up { color: #10b981; }
        &.neutral { color: #94a3b8; }
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
      .title { font-size: 16px; font-weight: 700; color: #1e293b; }
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
  background: #ffffff;
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
    background: #fff;
    border-top: 1px solid #f0f0f0;
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
