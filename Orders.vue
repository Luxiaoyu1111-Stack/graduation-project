<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px" @change="reload">
          <el-option v-for="(item, key) in orderStatusMap" :key="key" :label="item.text" :value="Number(key)" />
        </el-select>
        <el-input v-model="query.keyword" placeholder="订单号 / 联系人 / 手机号" clearable style="width: 240px"
                  @keyup.enter="reload" />
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 条订单</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="orderNo" label="订单号" width="165" />
      <el-table-column label="民宿 / 房型" min-width="180">
        <template #default="{ row }">
          <div>{{ row.homestayName }}</div>
          <div class="sub">{{ row.roomName }} × {{ row.roomCount }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="merchantName" label="商家" width="130" show-overflow-tooltip />
      <el-table-column label="入住人" width="130">
        <template #default="{ row }">
          <div>{{ row.contactName }}</div>
          <div class="sub">{{ row.contactPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="入离日期" width="180">
        <template #default="{ row }">
          <div>{{ row.checkIn }}</div>
          <div class="sub">{{ row.checkOut }}（{{ row.nights }} 晚）</div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="95" align="center">
        <template #default="{ row }">
          <el-tag :type="orderStatusType(row.status)" effect="light" size="small">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status <= 2" link type="danger" @click="cancel(row)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="query.size"
                     :current-page="query.page" @current-change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../../api'
import { orderStatusMap, orderStatusType } from '../../utils/format'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ status: null, keyword: '', page: 1, size: 10 })

const load = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.orders({
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

const cancel = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入平台取消原因（将同步通知游客与商家）', '取消订单', {
    inputValue: '平台介入取消',
    inputPlaceholder: '取消原因'
  })
  await adminApi.cancelOrder(row.id, value)
  ElMessage.success('订单已取消')
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
