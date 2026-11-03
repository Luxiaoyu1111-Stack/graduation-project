<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-input v-model="query.keyword" placeholder="搜索评价内容" clearable style="width: 220px"
                  @keyup.enter="reload" />
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px" @change="reload">
          <el-option label="正常显示" :value="1" />
          <el-option label="已隐藏" :value="0" />
        </el-select>
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 条评价</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="民宿 / 用户" min-width="180">
        <template #default="{ row }">
          <div>{{ row.homestayName }}</div>
          <div class="sub">{{ row.nickname }}</div>
        </template>
      </el-table-column>
      <el-table-column label="评分" width="150">
        <template #default="{ row }">
          <el-rate :model-value="Number(row.scoreTotal)" disabled size="small" />
          <div class="sub">卫生{{ row.scoreClean }} 服务{{ row.scoreService }} 位置{{ row.scoreLocation }} 性价比{{ row.scoreValue }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" min-width="280" show-overflow-tooltip />
      <el-table-column label="商家回复" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.reply || '未回复' }}</template>
      </el-table-column>
      <el-table-column label="时间" width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt, true) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light" size="small">
            {{ row.status === 1 ? '正常' : '已隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="toggle(row)">{{ row.status === 1 ? '隐藏' : '恢复' }}</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
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
import { formatDate } from '../../utils/format'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ keyword: '', status: null, page: 1, size: 10 })

const load = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.reviews({
      keyword: query.keyword || undefined,
      status: query.status ?? undefined,
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

const toggle = async (row) => {
  const status = row.status === 1 ? 0 : 1
  if (status === 0) {
    await ElMessageBox.confirm('隐藏后该评价将不再展示，且会重新计算民宿评分，是否继续？', '隐藏评价', {
      type: 'warning'
    })
  }
  await adminApi.changeReviewStatus(row.id, status)
  ElMessage.success('操作成功')
  load()
}

const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该评价？删除后将重新计算民宿评分。', '删除确认', { type: 'warning' })
  await adminApi.deleteReview(row.id)
  ElMessage.success('已删除')
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
  margin-top: 2px;
}

.total {
  font-size: 12px;
  color: var(--muted);
}
</style>
