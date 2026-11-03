<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-input v-model="query.keyword" placeholder="搜索民宿名称" clearable style="width: 220px" @keyup.enter="reload" />
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px" @change="reload">
          <el-option label="待审核" :value="0" />
          <el-option label="已上架" :value="1" />
          <el-option label="已下架" :value="2" />
          <el-option label="审核驳回" :value="3" />
        </el-select>
        <el-button type="primary" plain @click="reload">查询</el-button>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon> 新增民宿
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="封面" width="110">
        <template #default="{ row }">
          <img :src="row.cover" class="cover" alt="" @error="onImgError" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="民宿名称" min-width="180" show-overflow-tooltip />
      <el-table-column label="城市 / 地址" min-width="200">
        <template #default="{ row }">
          <div>{{ row.city }} · {{ row.district }}</div>
          <div class="sub">{{ row.address }}</div>
        </template>
      </el-table-column>
      <el-table-column label="起步价" width="100" align="right">
        <template #default="{ row }">¥{{ Number(row.minPrice).toFixed(0) }}</template>
      </el-table-column>
      <el-table-column label="评分" width="90" align="center">
        <template #default="{ row }">
          <span class="score">{{ Number(row.score).toFixed(1) }}</span>
          <div class="sub">{{ row.reviewCount }} 条</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.status === 1" link type="warning" @click="changeStatus(row, 2)">下架</el-button>
          <el-button v-else-if="row.status !== 0" link type="success" @click="changeStatus(row, 1)">上架</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="query.size"
                     :current-page="query.page" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑民宿' : '新增民宿'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="民宿名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：丽江古城云栖客栈" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="例如：丽江" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商圈/区县">
              <el-input v-model="form.district" placeholder="例如：古城区" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="起步价" prop="minPrice">
          <el-input-number v-model="form.minPrice" :min="1" :precision="2" :step="10" />
          <span class="unit">元 / 晚</span>
        </el-form-item>
        <el-form-item label="设施标签">
          <el-input v-model="form.facilities" placeholder="用英文逗号分隔，如：免费WiFi,停车场,早餐" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.cover" placeholder="图片地址，如 /images/hs1.jpg" />
        </el-form-item>
        <el-form-item label="民宿介绍">
          <el-input v-model="form.description" type="textarea" :rows="4" maxlength="1000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { merchantApi } from '../../api'

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref()

const query = reactive({ keyword: '', status: null, page: 1, size: 8 })
const form = reactive({
  id: null,
  name: '',
  city: '',
  district: '',
  address: '',
  minPrice: 300,
  facilities: '',
  cover: '/images/hs1.jpg',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入民宿名称', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  minPrice: [{ required: true, message: '请输入起步价', trigger: 'blur' }]
}

const statusText = (status) => ({ 0: '待审核', 1: '已上架', 2: '已下架', 3: '已驳回' }[status] || '未知')
const statusType = (status) => ({ 0: 'warning', 1: 'success', 2: 'info', 3: 'danger' }[status] || 'info')

const onImgError = (e) => {
  e.target.style.visibility = 'hidden'
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await merchantApi.homestays({
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

const openCreate = () => {
  Object.assign(form, {
    id: null, name: '', city: '', district: '', address: '', minPrice: 300,
    facilities: '免费WiFi,停车场,早餐', cover: '/images/hs1.jpg', description: ''
  })
  dialogVisible.value = true
}

const openEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    city: row.city,
    district: row.district,
    address: row.address,
    minPrice: Number(row.minPrice),
    facilities: (row.facilities || []).join(','),
    cover: row.cover,
    description: row.description
  })
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value.validate()
  saving.value = true
  try {
    if (form.id) {
      await merchantApi.updateHomestay(form.id, form)
      ElMessage.success('保存成功，修改后将重新进入审核')
    } else {
      await merchantApi.createHomestay(form)
      ElMessage.success('已提交，等待平台审核')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

const changeStatus = async (row, status) => {
  await merchantApi.changeHomestayStatus(row.id, status)
  ElMessage.success(status === 1 ? '已上架' : '已下架')
  load()
}

const remove = async (row) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」？该操作不可恢复。`, '删除确认', { type: 'warning' })
  await merchantApi.deleteHomestay(row.id)
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
  width: 84px;
  height: 58px;
  object-fit: cover;
  border-radius: 6px;
  background: #f2ece5;
}

.sub {
  font-size: 11px;
  color: #a99c90;
  margin-top: 2px;
}

.score {
  color: #c0563a;
  font-weight: 600;
}

.unit {
  margin-left: 10px;
  color: var(--muted);
  font-size: 12px;
}
</style>
