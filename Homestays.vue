<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-input v-model="query.keyword" placeholder="民宿名称 / 城市" clearable style="width: 220px"
                  @keyup.enter="reload" />
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px" @change="reload">
          <el-option label="待审核" :value="0" />
          <el-option label="已上架" :value="1" />
          <el-option label="已下架" :value="2" />
          <el-option label="审核驳回" :value="3" />
        </el-select>
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 家民宿</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <img :src="row.cover" class="cover" alt="" @error="onImgError" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="民宿名称" min-width="170" show-overflow-tooltip />
      <el-table-column prop="merchantName" label="所属商家" width="140" show-overflow-tooltip />
      <el-table-column prop="city" label="城市" width="90" />
      <el-table-column label="起步价" width="100" align="right">
        <template #default="{ row }">¥{{ Number(row.minPrice).toFixed(0) }}</template>
      </el-table-column>
      <el-table-column label="评分" width="80" align="center">
        <template #default="{ row }">
          <span class="score">{{ Number(row.score).toFixed(1) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0 || row.status === 3" link type="primary" @click="openAudit(row)">
            审核
          </el-button>
          <el-button v-if="row.status === 1" link type="warning" @click="changeStatus(row, 2)">下架</el-button>
          <el-button v-else-if="row.status === 2" link type="success" @click="changeStatus(row, 1)">上架</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="query.size"
                     :current-page="query.page" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="dialogVisible" title="民宿上架审核" width="520px">
      <div v-if="current" class="audit-info">
        <img :src="current.cover" alt="" @error="onImgError" />
        <div>
          <h3>{{ current.name }}</h3>
          <p>{{ current.city }} · {{ current.district }}</p>
          <p>{{ current.address }}</p>
          <p class="desc">{{ current.description }}</p>
        </div>
      </div>
      <el-form label-width="90px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="audit.status">
            <el-radio :value="1">通过并上架</el-radio>
            <el-radio :value="3">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="audit.remark" type="textarea" :rows="3" placeholder="驳回时请填写具体原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../../api'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ keyword: '', status: null, page: 1, size: 10 })
const dialogVisible = ref(false)
const current = ref(null)
const audit = reactive({ status: 1, remark: '' })

const statusText = (status) => ({ 0: '待审核', 1: '已上架', 2: '已下架', 3: '审核驳回' }[status] || '未知')
const statusType = (status) => ({ 0: 'warning', 1: 'success', 2: 'info', 3: 'danger' }[status] || 'info')

const onImgError = (e) => {
  e.target.style.visibility = 'hidden'
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.homestays({
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

const openAudit = (row) => {
  current.value = row
  audit.status = 1
  audit.remark = ''
  dialogVisible.value = true
}

const submit = async () => {
  await adminApi.auditHomestay(current.value.id, audit)
  ElMessage.success('审核完成')
  dialogVisible.value = false
  load()
}

const changeStatus = async (row, status) => {
  await adminApi.changeHomestayStatus(row.id, status)
  ElMessage.success('操作成功')
  load()
}

const remove = async (row) => {
  await ElMessageBox.confirm(`确认删除民宿「${row.name}」？`, '删除确认', { type: 'warning' })
  await adminApi.deleteHomestay(row.id)
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

.cover {
  width: 76px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
  background: #f2ece5;
}

.score {
  color: #c0563a;
  font-weight: 600;
}

.total {
  font-size: 12px;
  color: var(--muted);
}

.audit-info {
  display: flex;
  gap: 14px;
  background: #faf6f1;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 18px;
}

.audit-info img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}

.audit-info h3 {
  margin: 0 0 6px;
  font-size: 15px;
}

.audit-info p {
  margin: 3px 0;
  font-size: 12px;
  color: #7d7269;
}

.desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
