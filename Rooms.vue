<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <span class="label">选择民宿</span>
        <el-select v-model="homestayId" placeholder="请选择民宿" style="width: 260px" @change="loadRooms">
          <el-option v-for="item in homestays" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
      <el-button type="primary" :disabled="!homestayId" @click="openCreate">
        <el-icon><Plus /></el-icon> 新增房型
      </el-button>
    </div>

    <el-table v-loading="loading" :data="rooms" border stripe>
      <el-table-column label="房型" min-width="200">
        <template #default="{ row }">
          <div class="room-name">
            <img :src="row.cover" alt="" @error="onImgError" />
            <div>
              <div>{{ row.name }}</div>
              <div class="sub">{{ row.bedType }} · {{ row.area }}㎡</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="可住人数" width="100" align="center" />
      <el-table-column label="基准价" width="110" align="right">
        <template #default="{ row }">¥{{ Number(row.basePrice).toFixed(0) }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="默认库存" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'" effect="light">
            {{ row.status === 1 ? '可预订' : '停售' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="success" @click="goInventory(row)">库存日历</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!homestayId" description="请先选择要管理的民宿" />

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑房型' : '新增房型'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="房型名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：云栖·庭院大床房" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="可住人数" prop="capacity">
              <el-input-number v-model="form.capacity" :min="1" :max="10" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(㎡)">
              <el-input-number v-model="form.area" :min="10" :max="300" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="床型">
          <el-input v-model="form.bedType" placeholder="例如：1.8米大床" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="基准价" prop="basePrice">
              <el-input-number v-model="form.basePrice" :min="1" :precision="2" :step="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="房型图片">
          <el-input v-model="form.cover" placeholder="图片地址，如 /images/room1.jpg" />
        </el-form-item>
        <el-form-item label="房型说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="可预订" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { merchantApi } from '../../api'

const router = useRouter()
const homestays = ref([])
const homestayId = ref(null)
const rooms = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  homestayId: null,
  name: '',
  capacity: 2,
  bedType: '1.8米大床',
  area: 30,
  basePrice: 388,
  stock: 3,
  cover: '/images/room1.jpg',
  description: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入可住人数', trigger: 'blur' }],
  basePrice: [{ required: true, message: '请输入基准价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const onImgError = (e) => {
  e.target.style.visibility = 'hidden'
}

const loadHomestays = async () => {
  const { data } = await merchantApi.homestays({ page: 1, size: 50 })
  homestays.value = [
    ...data.records.filter((r) => r.status === 1),
    ...data.records.filter((r) => r.status !== 1)
  ]
  if (homestays.value.length) {
    homestayId.value = homestays.value[0].id
    await loadRooms()
  }
}

const loadRooms = async () => {
  if (!homestayId.value) return
  loading.value = true
  try {
    const { data } = await merchantApi.rooms(homestayId.value)
    rooms.value = data
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  Object.assign(form, {
    id: null, homestayId: homestayId.value, name: '', capacity: 2, bedType: '1.8米大床',
    area: 30, basePrice: 388, stock: 3, cover: '/images/room1.jpg', description: '', status: 1
  })
  dialogVisible.value = true
}

const openEdit = (row) => {
  Object.assign(form, {
    ...row,
    basePrice: Number(row.basePrice),
    homestayId: row.homestayId
  })
  dialogVisible.value = true
}

const submit = async () => {
  await formRef.value.validate()
  saving.value = true
  try {
    if (form.id) {
      await merchantApi.updateRoom(form.id, form)
      ElMessage.success('房型已更新')
    } else {
      await merchantApi.createRoom(form)
      ElMessage.success('房型已创建，并初始化了未来90天库存')
    }
    dialogVisible.value = false
    loadRooms()
  } finally {
    saving.value = false
  }
}

const goInventory = (row) => {
  router.push({ path: '/merchant/inventory', query: { homestayId: homestayId.value, roomId: row.id } })
}

const remove = async (row) => {
  await ElMessageBox.confirm(`确认删除房型「${row.name}」？`, '删除确认', { type: 'warning' })
  await merchantApi.deleteRoom(row.id)
  ElMessage.success('已删除')
  loadRooms()
}

onMounted(loadHomestays)
</script>

<style scoped>
.left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.label {
  font-size: 13px;
  color: var(--muted);
}

.room-name {
  display: flex;
  gap: 10px;
  align-items: center;
}

.room-name img {
  width: 64px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  background: #f2ece5;
}

.sub {
  font-size: 11px;
  color: #a99c90;
  margin-top: 2px;
}
</style>
