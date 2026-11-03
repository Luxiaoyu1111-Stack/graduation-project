<template>
  <div class="admin-dashboard">
    <div class="head">
      <div>
        <h1 class="page-title">平台数据看板</h1>
        <p class="page-desc">实时掌握平台用户、房源、订单与交易情况</p>
      </div>
      <div class="quick">
        <el-badge :value="data.pendingAudit || 0" :hidden="!data.pendingAudit" type="warning">
          <el-button plain @click="$router.push('/admin/homestays')">民宿待审核</el-button>
        </el-badge>
        <el-badge :value="data.pendingMerchant || 0" :hidden="!data.pendingMerchant" type="danger">
          <el-button plain @click="$router.push('/admin/merchants')">商家待审核</el-button>
        </el-badge>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="注册游客" :value="data.userCount || 0" icon="User" suffix="人" hint="不含商家与管理员" />
      <StatCard label="入驻商家" :value="data.merchantCount || 0" icon="Shop" suffix="家" color="#5b8c85" />
      <StatCard label="在营民宿" :value="data.homestayCount || 0" icon="House" suffix="家" color="#d4a24c" />
      <StatCard label="累计订单" :value="data.orderCount || 0" icon="Tickets" suffix="单" :hint="`今日新增 ${data.todayOrders || 0} 单`" color="#7b8fb5" />
      <StatCard label="平台交易额" :value="Number(data.totalRevenue || 0).toFixed(0)" prefix="¥" icon="Money" color="#c0563a" :hint="`本月 ¥${Number(data.monthRevenue || 0).toFixed(0)}`" />
      <StatCard label="民宿平均分" :value="Number(data.avgScore || 0).toFixed(2)" icon="Star" color="#e0a800" />
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">
          <span>近 14 天订单与交易额</span>
          <el-tag size="small" effect="plain">数据实时统计</el-tag>
        </div>
        <EChart :option="trendOption" height="310px" />
      </div>
      <div class="panel">
        <div class="panel-title">订单状态分布</div>
        <EChart :option="pieOption" height="310px" />
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">城市房源分布</div>
        <EChart :option="cityOption" height="300px" />
      </div>
      <div class="panel">
        <div class="panel-title">热门民宿 TOP5</div>
        <div class="top-list">
          <div v-for="(item, index) in data.topHomestays || []" :key="item.id" class="top-item">
            <span :class="['rank', `rank-${index + 1}`]">{{ index + 1 }}</span>
            <div class="top-info">
              <div class="top-name">{{ item.name }}</div>
              <div class="top-meta">{{ item.city }} · 评分 {{ Number(item.score).toFixed(1) }}</div>
            </div>
            <div class="top-orders">{{ item.orderCount }} 单</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import StatCard from '../../components/StatCard.vue'
import EChart from '../../components/EChart.vue'
import { adminApi } from '../../api'

const data = ref({})

const trendOption = computed(() => {
  const trend = data.value.orderTrend || []
  return {
    grid: { left: 44, right: 50, top: 34, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数', '交易额'], right: 0, top: 0 },
    xAxis: { type: 'category', data: trend.map((t) => t.date), axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: [
      { type: 'value', name: '订单', splitLine: { lineStyle: { color: '#f0e9e1' } } },
      { type: 'value', name: '金额', splitLine: { show: false } }
    ],
    series: [
      { name: '订单数', type: 'bar', barWidth: 12, itemStyle: { color: '#b9764a', borderRadius: [4, 4, 0, 0] }, data: trend.map((t) => t.orders) },
      { name: '交易额', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 5, itemStyle: { color: '#5b8c85' }, areaStyle: { color: 'rgba(91,140,133,0.12)' }, data: trend.map((t) => Number(t.revenue)) }
    ]
  }
})

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}：{c} 单（{d}%）' },
  legend: { orient: 'vertical', right: 8, top: 'center', itemWidth: 10, itemHeight: 10, itemGap: 12 },
  series: [{
    type: 'pie',
    radius: ['46%', '68%'],
    center: ['38%', '50%'],
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    labelLine: { show: false },
    emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold', formatter: '{b}\n{c} 单' } },
    data: (data.value.statusStats || []).map((item) => ({ name: item.name, value: item.value }))
  }]
}))

const cityOption = computed(() => {
  const rows = [...(data.value.cityStats || [])].reverse()
  return {
    grid: { left: 70, right: 30, top: 20, bottom: 26 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0e9e1' } } },
    yAxis: { type: 'category', data: rows.map((r) => r.name), axisLine: { lineStyle: { color: '#ddd' } } },
    series: [{
      type: 'bar',
      barWidth: 16,
      itemStyle: { color: '#d9a97e', borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right' },
      data: rows.map((r) => r.value)
    }]
  }
})

onMounted(async () => {
  const { data: res } = await adminApi.dashboard()
  data.value = res
})
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quick {
  display: flex;
  gap: 18px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.top-list {
  display: flex;
  flex-direction: column;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px dashed #f0e9e1;
}

.top-item:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 12px;
  background: #f3ece4;
  color: #8c7a6b;
}

.rank-1 {
  background: #c0563a;
  color: #fff;
}

.rank-2 {
  background: #d9a97e;
  color: #fff;
}

.rank-3 {
  background: #e8c9a8;
  color: #8a5330;
}

.top-info {
  flex: 1;
}

.top-name {
  font-size: 14px;
}

.top-meta {
  font-size: 11px;
  color: #a99c90;
  margin-top: 3px;
}

.top-orders {
  font-size: 13px;
  color: #c0563a;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
