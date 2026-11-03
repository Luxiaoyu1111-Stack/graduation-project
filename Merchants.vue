<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-input v-model="query.keyword" placeholder="店铺名称 / 联系人 / 电话" clearable style="width: 240px"
                  @keyup.enter="reload" />
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px" @change="reload">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 家商家</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="shopName" label="店铺名称" min-width="160" />
      <el-table-column label="联系人" width="150">
        <template #default="{ row }">
          <div>{{ row.contactName }}</div>
          <div class="sub">{{ row.username }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="contactPhone" label="联系电话" width="140" />
      <el-table-column prop="licenseNo" label="营业执照" min-width="180" show-overflow-tooltip />
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt, true) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="row.status === 1" @click="openAudit(row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="query.size"
                     :current-page="query.page" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="dialogVisible" title="商家资质审核" width="480px">
      <div v-if="current" class="audit-info">
        <p><span>店铺名称</span>{{ current.shopName }}</p>
        <p><span>联系人</span>{{ current.contactName }} · {{ current.contactPhone }}</p>
        <p><span>营业执照</span>{{ current.licenseNo || '未提交' }}</p>
        <p><span>商家简介</span>{{ current.description || '无' }}</p>
      </div>
      <el-form label-width="90px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="audit.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="audit.remark" type="textarea" :rows="3" placeholder="选填，驳回时请说明原因" />
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
import { ElMessage } from 'element-plus'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/format'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ keyword: '', status: null, page: 1, size: 10 })
const dialogVisible = ref(false)
const current = ref(null)
const audit = reactive({ status: 1, remark: '' })

const statusText = (status) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status] || '未知')
const statusType = (status) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[status] || 'info')

const load = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.merchants({
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
  await adminApi.auditMerchant(current.value.id, audit)
  ElMessage.success('审核完成')
  dialogVisible.value = false
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

.audit-info {
  background: #faf6f1;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 18px;
}

.audit-info p {
  margin: 6px 0;
  font-size: 13px;
  display: flex;
  gap: 12px;
}

.audit-info span {
  color: var(--muted);
  width: 70px;
  flex: none;
}
</style>
