<template>
  <div class="merchant-dashboard">
    <h1 class="page-title">经营概览</h1>
    <p class="page-desc">掌握房源经营情况与住客评价反馈</p>

    <div class="stat-grid">
      <StatCard label="在营民宿" :value="data.homestayCount || 0" icon="House" suffix="家" hint="含待审核与已下架" />
      <StatCard label="累计订单" :value="data.orderCount || 0" icon="Tickets" suffix="单" :hint="`今日新增 ${data.todayOrders || 0} 单`" color="#5b8c85" />
      <StatCard label="累计营收" :value="Number(data.revenue || 0).toFixed(0)" prefix="¥" icon="Money" color="#c0563a" hint="已支付订单金额" />
      <StatCard label="综合评分" :value="Number(data.avgScore || 0).toFixed(2)" icon="Star" color="#d4a24c" :hint="`${data.reviewCount || 0} 条评价`" />
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">
          <span>近 14 天订单与营收</span>
          <el-tag size="small" effect="plain">待处理 {{ data.pendingOrders || 0 }} 单</el-tag>
        </div>
        <EChart :option="trendOption" height="300px" />
      </div>
      <div class="panel">
        <div class="panel-title">评价维度</div>
        <EChart :option="radarOption" height="300px" />
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">最近订单</div>
        <el-table :data="data.recentOrders || []" size="small" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" width="150" />
          <el-table-column prop="homestayName" label="民宿" show-overflow-tooltip />
          <el-table-column prop="checkIn" label="入住" width="100" />
          <el-table-column label="金额" width="90" align="right">
            <template #default="{ row }">¥{{ Number(row.amount).toFixed(0) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="orderStatusType(row.status)" effect="light">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="more">
          <el-button text @click="$router.push('/merchant/orders')">查看全部订单</el-button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">评价回复率</div>
        <div class="reply-block">
          <el-progress type="dashboard" :percentage="Number(data.replyRate || 0)" :width="150" color="#b9764a">
            <template #default="{ percentage }">
              <div class="rate">{{ percentage }}%</div>
              <div class="rate-label">已回复</div>
            </template>
          </el-progress>
          <div class="reply-desc">
            <p>共收到 <b>{{ data.reviewCount || 0 }}</b> 条评价</p>
            <p>及时回复评价有助于提升住客信任度与复购率。</p>
            <el-button type="primary" plain size="small" @click="$router.push('/merchant/reviews')">
              去回复评价
            </el-button>
          </div>
        </div>
        <div class="panel-title" style="margin-top: 24px">近 6 个月评分趋势</div>
        <EChart :option="reviewTrendOption" height="180px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import StatCard from '../../components/StatCard.vue'
import EChart from '../../components/EChart.vue'
import { merchantApi } from '../../api'
import { orderStatusType } from '../../utils/format'

const data = ref({})

const trendOption = computed(() => {
  const trend = data.value.orderTrend || []
  return {
    grid: { left: 40, right: 46, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数', '营收'], right: 0, top: 0 },
    xAxis: { type: 'category', data: trend.map((t) => t.date), axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: [
      { type: 'value', name: '订单', splitLine: { lineStyle: { color: '#f0e9e1' } } },
      { type: 'value', name: '营收', splitLine: { show: false } }
    ],
    series: [
      { name: '订单数', type: 'bar', barWidth: 12, itemStyle: { color: '#d9a97e', borderRadius: [4, 4, 0, 0] }, data: trend.map((t) => t.orders) },
      { name: '营收', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 5, itemStyle: { color: '#8a5330' }, areaStyle: { color: 'rgba(185,118,74,0.12)' }, data: trend.map((t) => Number(t.revenue)) }
    ]
  }
})

const radarOption = computed(() => {
  const dims = data.value.dimensions || []
  const names = dims.length ? dims.map((d) => d.name) : ['卫生', '服务', '位置', '性价比']
  const values = [0, 1, 2, 3].map((i) => Number(dims[i]?.value || 0).toFixed(1))
  return {
    radar: {
      indicator: names.map((name) => ({ name, max: 5 })),
      radius: '62%',
      splitLine: { lineStyle: { color: '#eadfd4' } },
      splitArea: { areaStyle: { color: ['#fdfaf6', '#f8f1e9'] } },
      axisName: { color: '#7d7269' }
    },
    series: [{
      type: 'radar',
      data: [{ value: values, name: '平均分', areaStyle: { color: 'rgba(185,118,74,0.25)' }, lineStyle: { color: '#b9764a' }, itemStyle: { color: '#b9764a' } }]
    }]
  }
})

const reviewTrendOption = computed(() => {
  const rows = data.value.reviewTrend || []
  return {
    grid: { left: 36, right: 16, top: 16, bottom: 26 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: rows.map((r) => r.name) },
    yAxis: { type: 'value', min: 3, max: 5, splitLine: { lineStyle: { color: '#f0e9e1' } } },
    series: [{ type: 'line', smooth: true, symbolSize: 6, itemStyle: { color: '#5b8c85' }, data: rows.map((r) => Number(r.value || 0)) }]
  }
})

onMounted(async () => {
  const { data: res } = await merchantApi.dashboard()
  data.value = res
})
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.more {
  text-align: right;
  margin-top: 8px;
}

.reply-block {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 6px 4px 0;
}

.rate {
  font-size: 22px;
  font-weight: 600;
  color: #b9764a;
}

.rate-label {
  font-size: 12px;
  color: var(--muted);
}

.reply-desc p {
  font-size: 13px;
  color: #7d7269;
  line-height: 1.8;
  margin: 0 0 8px;
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
