<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-input v-model="query.keyword" placeholder="账号 / 昵称 / 手机号" clearable style="width: 220px"
                  @keyup.enter="reload" />
        <el-select v-model="query.role" placeholder="全部角色" clearable style="width: 130px" @change="reload">
          <el-option label="游客" value="USER" />
          <el-option label="商家" value="MERCHANT" />
          <el-option label="管理员" value="ADMIN" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px" @change="reload">
          <el-option label="正常" :value="1" />
          <el-option label="已禁用" :value="0" />
        </el-select>
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <span class="total">共 {{ total }} 个账号</span>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="username" label="账号" width="140" />
      <el-table-column prop="nickname" label="昵称" width="130" />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="roleType(row.role)" effect="light" size="small">{{ roleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="shopName" label="店铺名称" min-width="150" />
      <el-table-column label="注册时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt, true) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" :disabled="row.role === 'ADMIN'"
                     @change="(value) => toggle(row, value)" />
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
const query = reactive({ keyword: '', role: null, status: null, page: 1, size: 10 })

const roleText = (role) => ({ USER: '游客', MERCHANT: '商家', ADMIN: '管理员' }[role] || role)
const roleType = (role) => ({ USER: 'success', MERCHANT: 'warning', ADMIN: 'danger' }[role] || 'info')

const load = async () => {
  loading.value = true
  try {
    const { data } = await adminApi.users({
      keyword: query.keyword || undefined,
      role: query.role || undefined,
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

const toggle = async (row, value) => {
  const status = value ? 1 : 0
  await ElMessageBox.confirm(
    status === 0 ? `确认禁用账号「${row.username}」？禁用后该账号将无法登录。` : `确认恢复账号「${row.username}」？`,
    '状态确认',
    { type: 'warning' }
  )
  await adminApi.updateUserStatus(row.id, status)
  ElMessage.success('操作成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.total {
  font-size: 12px;
  color: var(--muted);
}
</style>
