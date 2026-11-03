<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px" @change="reload">
          <el-option v-for="(item, key) in orderStatusMap" :key="key" :label="item.text" :value="Number(key)" />
        </el-select>
        <el-input v-model="query.keyword" placeholder="订单号 / 联系人 / 手机号" clearable style="width: 240px"
                  @keyup.enter="reload" />
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 条订单</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="orderNo" label="订单号" width="170" />
      <el-table-column label="民宿 / 房型" min-width="200">
        <template #default="{ row }">
          <div>{{ row.homestayName }}</div>
          <div class="sub">{{ row.roomName }} × {{ row.roomCount }}</div>
        </template>
      </el-table-column>
      <el-table-column label="入住 / 离店" width="190">
        <template #default="{ row }">
          <div>{{ row.checkIn }} 至</div>
          <div>{{ row.checkOut }}（{{ row.nights }} 晚）</div>
        </template>
      </el-table-column>
      <el-table-column label="入住人" width="150">
        <template #default="{ row }">
          <div>{{ row.contactName }}</div>
          <div class="sub">{{ row.contactPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="orderStatusType(row.status)" effect="light" size="small">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 1" link type="primary" @click="act(row, 'confirm')">确认接单</el-button>
          <el-button v-if="row.status === 2" link type="success" @click="act(row, 'checkin')">办理入住</el-button>
          <el-button v-if="row.status === 3" link type="warning" @click="act(row, 'finish')">完成订单</el-button>
          <el-button link @click="show(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="query.size"
                     :current-page="query.page" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="540px">
      <el-descriptions v-if="current" :column="1" border size="small">
        <el-descriptions-item label="订单编号">{{ current.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="民宿">{{ current.homestayName }}</el-descriptions-item>
        <el-descriptions-item label="房型">{{ current.roomName }} × {{ current.roomCount }}</el-descriptions-item>
        <el-descriptions-item label="入离日期">{{ current.checkIn }} 至 {{ current.checkOut }}</el-descriptions-item>
        <el-descriptions-item label="入住人数">{{ current.guestNum }} 人</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ current.contactName }} {{ current.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ current.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ Number(current.amount).toFixed(2) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantApi } from '../../api'
import { orderStatusMap, orderStatusType } from '../../utils/format'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const detailVisible = ref(false)
const current = ref(null)
const query = reactive({ status: null, keyword: '', page: 1, size: 10 })

const load = async () => {
  loading.value = true
  try {
    const { data } = await merchantApi.orders({
      status: query.status ?? undefined,
      keyword: query.keyword || undefined,
      page: query.page,
      size: query.size
    })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const reload = () => {
  query.page = 1
  load()
}

const onPageChange = (value) => {
  query.page = value
  load()
}

const show = (row) => {
  current.value = row
  detailVisible.value = true
}

const act = async (row, action) => {
  const map = {
    confirm: { fn: merchantApi.confirm, text: '确认接单' },
    checkin: { fn: merchantApi.checkin, text: '办理入住' },
    finish: { fn: merchantApi.finish, text: '完成订单' }
  }
  await map[action].fn(row.id)
  ElMessage.success(`${map[action].text}成功`)
  load()
}

onMounted(load)
</script>

<style scoped>
.left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sub {
  font-size: 11px;
  color: #a99c90;
}

.total {
  font-size: 12px;
  color: var(--muted);
}
</style>
