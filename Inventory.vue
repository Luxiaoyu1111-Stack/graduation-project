<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-select v-model="homestayId" placeholder="选择民宿" style="width: 230px" @change="onHomestayChange">
          <el-option v-for="item in homestays" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="roomId" placeholder="选择房型" style="width: 230px" @change="loadInventory">
          <el-option v-for="item in rooms" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-date-picker v-model="startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期"
                        :disabled-date="pastDate" style="width: 160px" @change="loadInventory" />
      </div>
      <el-button :disabled="!roomId" @click="resetInventory">重置未来 90 天库存</el-button>
    </div>

    <div class="legend">
      <span><i class="dot green"></i> 库存充足</span>
      <span><i class="dot orange"></i> 库存紧张（≤2间）</span>
      <span><i class="dot red"></i> 已满房</span>
      <span class="tip">说明：周末价格默认为基准价的 1.2 倍，可逐日调整</span>
    </div>

    <el-table v-loading="loading" :data="rows" border height="560">
      <el-table-column prop="date" label="日期" width="130" />
      <el-table-column label="星期" width="90">
        <template #default="{ row }">{{ weekday(row.date) }}</template>
      </el-table-column>
      <el-table-column label="价格（元/晚）" width="160" align="right">
        <template #default="{ row }">
          <span :class="['price-text', { weekend: isWeekend(row.date) }]">¥{{ Number(row.price).toFixed(0) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="可售库存" width="140" align="center">
        <template #default="{ row }">
          <el-tag :type="row.stock === 0 ? 'danger' : row.stock <= 2 ? 'warning' : 'success'" effect="light">
            {{ row.stock }} 间
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">{{ row.stock === 0 ? '已满房' : row.stock <= 2 ? '库存紧张' : '可预订' }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="120" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">调整价格/库存</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="调整单日房态" width="420px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="日期">
          <el-input v-model="form.date" disabled />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="1" :precision="2" :step="20" />
        </el-form-item>
        <el-form-item label="可售库存">
          <el-input-number v-model="form.stock" :min="0" :max="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { merchantApi } from '../../api'
import { addDays, toDateString } from '../../utils/format'

const route = useRoute()
const homestays = ref([])
const rooms = ref([])
const homestayId = ref(null)
const roomId = ref(null)
const startDate = ref(toDateString(new Date()))
const rows = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = reactive({ roomTypeId: null, date: '', price: 0, stock: 0 })

const sortHomestays = (records) => [
  ...records.filter((r) => r.status === 1),
  ...records.filter((r) => r.status !== 1)
]
const days = 30
const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const weekday = (date) => weekNames[new Date(date).getDay()]
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay())
const pastDate = (date) => date < new Date(new Date().toDateString())

const loadHomestays = async () => {
  const { data } = await merchantApi.homestays({ page: 1, size: 50 })
  homestays.value = sortHomestays(data.records)
  homestayId.value = Number(route.query.homestayId) || homestays.value[0]?.id
  if (homestayId.value) await loadRooms()
}

const loadRooms = async () => {
  const { data } = await merchantApi.rooms(homestayId.value)
  rooms.value = data
  const target = Number(route.query.roomId)
  roomId.value = rooms.value.some((r) => r.id === target) ? target : rooms.value[0]?.id
  await loadInventory()
}

const onHomestayChange = () => {
  roomId.value = null
  loadRooms()
}

const loadInventory = async () => {
  if (!roomId.value) return
  loading.value = true
  try {
    const start = startDate.value
    const end = toDateString(addDays(new Date(start), days))
    const { data } = await merchantApi.inventory(roomId.value, start, end)
    const map = new Map(data.map((item) => [item.date, item]))
    const list = []
    for (let i = 0; i < days; i++) {
      const date = toDateString(addDays(new Date(start), i))
      const item = map.get(date)
      list.push({ date, price: item?.price ?? 0, stock: item?.stock ?? 0 })
    }
    rows.value = list
  } finally {
    loading.value = false
  }
}

const openEdit = (row) => {
  Object.assign(form, { roomTypeId: roomId.value, date: row.date, price: Number(row.price), stock: row.stock })
  dialogVisible.value = true
}

const save = async () => {
  await merchantApi.saveInventory(form)
  ElMessage.success('房态已更新')
  dialogVisible.value = false
  loadInventory()
}

const resetInventory = async () => {
  await ElMessageBox.confirm('将按房型基准价和默认库存重置未来 90 天的价格与库存，是否继续？', '重置确认', {
    type: 'warning'
  })
  await merchantApi.initInventory(roomId.value, 90)
  ElMessage.success('已重置未来90天库存')
  loadInventory()
}

onMounted(loadHomestays)
</script>

<style scoped>
.left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.legend {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 12px;
  color: #7d7269;
  margin-bottom: 12px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.green {
  background: #67c23a;
}

.orange {
  background: #e6a23c;
}

.red {
  background: #f56c6c;
}

.tip {
  margin-left: auto;
  color: #a99c90;
}

.price-text {
  font-weight: 600;
  color: #4a423c;
}

.price-text.weekend {
  color: #c0563a;
}
</style>
