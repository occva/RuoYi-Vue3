<template>
  <div class="app-container member-stat">
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

    <!-- Charts Row 1: Trend and Role Distribution -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="16">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">成员入社趋势</span>
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
              <span class="title">角色分布</span>
            </div>
          </template>
          <div ref="roleChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 2: Club Ranking -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card class="premium-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="title">各社团成员数量排名</span>
            </div>
          </template>
          <div ref="clubChartRef" class="chart-container club-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Member List Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%" destroy-on-close class="stat-dialog">
      <div class="stat-dialog__table">
        <el-table :data="memberList" v-loading="listLoading" stripe border>
        <el-table-column prop="memberId" label="成员ID" width="80" />
        <el-table-column prop="clubName" label="社团名称" width="150" />
        <el-table-column prop="userName" label="用户名" width="100" />
        <el-table-column prop="nickName" label="昵称" width="100" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="roleType" label="角色" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.roleType === '1'" type="danger">社长</el-tag>
            <el-tag v-else-if="scope.row.roleType === '2'" type="warning">副社长</el-tag>
            <el-tag v-else type="info">普通成员</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="加入日期" width="160" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else type="danger">已退出</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="positionName" label="职位" show-overflow-tooltip />
        </el-table>
      </div>
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="memberTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        class="stat-dialog__pagination"
      />
    </el-dialog>
  </div>
</template>

<script setup name="MemberStat">
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { getMemberStat, listMember } from "@/api/club/member";

let trendChart = null;
let roleChart = null;
let clubChart = null;

const trendChartRef = ref(null);
const roleChartRef = ref(null);
const clubChartRef = ref(null);
const trendTimeRange = ref('7');

const dateRange = ref(null);
const dateShortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); return [start, end]; } },
  { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [start, end]; } },
  { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 3); return [start, end]; } }
];

const statCards = ref([
  { title: '成员总数', value: '0', trend: 0, icon: 'User', type: 'primary', status: null, roleType: null },
  { title: '正常成员', value: '0', trend: 0, icon: 'CircleCheck', type: 'success', status: '0', roleType: null },
  { title: '已退出', value: '0', trend: 0, icon: 'CircleClose', type: 'danger', status: '1', roleType: null },
  { title: '社长/副社长', value: '0', trend: 0, icon: 'UserFilled', type: 'warning', status: '0', roleType: '1,2' }
]);

const rawTrendData = ref([]);
const roleData = ref([]);
const clubRankingData = ref([]);
const totalMemberCount = ref(0);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const memberList = ref([]);
const listLoading = ref(false);
const memberTotal = ref(0);
const queryParams = ref({ pageNum: 1, pageSize: 10, status: null, clubId: null, roleType: null });

const handleDateChange = () => { fetchData(); };

const fetchData = async () => {
  const query = {};
  if (dateRange.value && dateRange.value.length === 2) {
    query.beginTime = dateRange.value[0];
    query.endTime = dateRange.value[1];
  }
  const response = await getMemberStat(query);
  if (response.code === 200) {
    const data = response.data;
    const statusStat = data.statusStat || [];
    const todayStats = data.todayStats || {};

    let totalVal = 0, active = 0, exited = 0;
    statusStat.forEach(item => {
      const count = parseInt(item.count);
      totalVal += count;
      if (item.status === '0') active = count;
      else if (item.status === '1') exited = count;
    });

    // Count leaders from role stat
    const roleStat = data.roleStat || [];
    let leaders = 0;
    roleStat.forEach(item => {
      if (item.roleType === '1' || item.roleType === '2') {
        leaders += parseInt(item.count);
      }
    });

    statCards.value = [
      { title: '成员总数', value: totalVal.toLocaleString(), trend: todayStats.totalNew || 0, icon: 'User', type: 'primary', status: null, roleType: null },
      { title: '正常成员', value: active.toLocaleString(), trend: todayStats.activeNew || 0, icon: 'CircleCheck', type: 'success', status: '0', roleType: null },
      { title: '已退出', value: exited.toLocaleString(), trend: todayStats.exitedNew || 0, icon: 'CircleClose', type: 'danger', status: '1', roleType: null },
      { title: '社长/副社长', value: leaders.toLocaleString(), trend: 0, icon: 'UserFilled', type: 'warning', status: '0', roleType: '1,2' }
    ];
    totalMemberCount.value = totalVal;

    // Trend
    rawTrendData.value = data.trendStat || [];
    updateTrendChart();

    // Role Distribution Pie
    roleData.value = roleStat;
    const roleMap = { '1': '社长', '2': '副社长', '3': '普通成员' };
    const roleColors = { '1': '#ef4444', '2': '#f59e0b', '3': '#3b82f6' };
    const pieData = roleData.value.map(item => ({
      value: item.count, name: roleMap[item.roleType] || '其他',
      itemStyle: { color: roleColors[item.roleType] || '#94a3b8' }
    }));
    roleChart?.setOption({
      title: {
        text: active.toLocaleString(), subtext: '活跃成员',
        left: 'center', top: '43%',
        textStyle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
        subtextStyle: { fontSize: 14, color: '#999' }
      },
      series: [{ data: pieData }]
    });
    roleChart?.hideLoading();

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
      series: [{ type: 'line', smooth: true, data: [], areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }, itemStyle: { color: '#10b981' }, lineStyle: { width: 3 } }]
    });
    trendChart.showLoading();
  }

  if (roleChartRef.value) {
    roleChart = echarts.init(roleChartRef.value);
    roleChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center', icon: 'circle' },
      series: [{ type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: [] }]
    });
    roleChart.on('mouseover', (params) => {
      roleChart.setOption({ title: { text: params.value, subtext: params.name + ' (' + params.percent + '%)', subtextStyle: { fontSize: 14, color: '#666' } } });
    });
    roleChart.on('mouseout', () => {
      roleChart.setOption({ title: { text: totalMemberCount.value.toLocaleString(), subtext: '活跃成员', subtextStyle: { fontSize: 14, color: '#999' } } });
    });
    roleChart.showLoading();
  }

  if (clubChartRef.value) {
    clubChart = echarts.init(clubChartRef.value);
    clubChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
      yAxis: { type: 'category', data: [], axisLabel: { color: '#1e293b', fontWeight: 500 } },
      series: [{ type: 'bar', data: [], itemStyle: { color: '#10b981', borderRadius: [0, 6, 6, 0] }, barWidth: '60%' }]
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
  roleChart?.resize();
  clubChart?.resize();
};

watch(trendTimeRange, () => { updateTrendChart(); });

const handleCardClick = (card) => {
  dialogTitle.value = card.title;
  queryParams.value.status = card.status ?? null;
  queryParams.value.clubId = null;
  queryParams.value.roleType = card.roleType ?? null;
  queryParams.value.pageNum = 1;
  dialogVisible.value = true;
  handleQuery();
};

const handleClubClick = (clubName, clubId) => {
  dialogTitle.value = '社团成员列表 - ' + clubName;
  queryParams.value.clubId = clubId;
  queryParams.value.status = null;
  queryParams.value.roleType = null;
  queryParams.value.pageNum = 1;
  dialogVisible.value = true;
  handleQuery();
};

const handleQuery = async () => {
  listLoading.value = true;
  try {
    const response = await listMember(queryParams.value);
    if (response.code === 200) {
      memberList.value = response.rows;
      memberTotal.value = Number(response.total) || 0;
    }
  } finally {
    listLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.member-stat {
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

