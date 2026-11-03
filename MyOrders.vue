<template>
  <div class="page-container orders-page">
    <h1 class="page-title">我的订单</h1>
    <p class="page-desc">查看预订进度、支付订单或对已完成的行程发表评价</p>

    <div class="tabs">
      <el-radio-group v-model="status" @change="reload">
        <el-radio-button :value="-1">全部</el-radio-button>
        <el-radio-button v-for="(item, key) in orderStatusMap" :key="key" :value="Number(key)">
          {{ item.text }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="order-list">
      <div v-for="order in list" :key="order.id" class="order-card">
        <div class="order-top">
          <div class="order-no">
            <span>订单号 {{ order.orderNo }}</span>
            <span class="time">{{ formatDate(order.createdAt, true) }}</span>
          </div>
          <el-tag :type="orderStatusType(order.status)" effect="light">{{ order.statusText }}</el-tag>
        </div>
        <div class="order-body">
          <img :src="order.homestayCover || fallback" alt="" @error="onImgError" />
          <div class="order-info">
            <h3>{{ order.homestayName }}</h3>
            <p class="room">{{ order.roomName }} · {{ order.roomCount }} 间 · {{ order.guestNum }} 人</p>
            <p class="date">
              <el-icon><Calendar /></el-icon>
              {{ order.checkIn }} 至 {{ order.checkOut }}（{{ order.nights }} 晚）
            </p>
            <p class="contact">联系人：{{ order.contactName }} {{ order.contactPhone }}</p>
          </div>
          <div class="order-amount">
            <div class="price">¥{{ Number(order.amount).toFixed(2) }}</div>
            <div class="amount-label">订单金额</div>
          </div>
        </div>
        <div class="order-actions">
          <el-button size="small" text @click="showDetail(order)">订单详情</el-button>
          <template v-if="order.status === 0">
            <el-button size="small" type="primary" @click="pay(order)">去支付</el-button>
            <el-button size="small" @click="cancel(order)">取消订单</el-button>
          </template>
          <template v-else-if="order.status <= 2">
            <el-button size="small" @click="cancel(order)">取消订单</el-button>
          </template>
          <template v-else-if="order.status === 4 && !order.reviewed">
            <el-button size="small" type="primary" @click="openReview(order)">去评价</el-button>
          </template>
          <el-tag v-else-if="order.status === 4 && order.reviewed" size="small" type="success" effect="plain">
            已评价
          </el-tag>
        </div>
      </div>
      <el-empty v-if="!loading && !list.length" description="暂无相关订单，去挑选一家心仪的民宿吧">
        <el-button type="primary" @click="$router.push('/homestays')">去找民宿</el-button>
      </el-empty>
    </div>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size"
                     :current-page="page" @current-change="onPageChange" />
    </div>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="560px">
      <el-descriptions v-if="current" :column="1" border size="small">
        <el-descriptions-item label="订单编号">{{ current.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="民宿名称">{{ current.homestayName }}</el-descriptions-item>
        <el-descriptions-item label="房型">{{ current.roomName }} × {{ current.roomCount }}</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ current.checkIn }} 至 {{ current.checkOut }}（{{ current.nights }} 晚）</el-descriptions-item>
        <el-descriptions-item label="入住人数">{{ current.guestNum }} 人</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ current.contactName }} {{ current.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ Number(current.amount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ current.statusText }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ current.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item v-if="current.cancelReason" label="取消原因">{{ current.cancelReason }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 评价 -->
    <el-dialog v-model="reviewVisible" title="发表评价" width="560px">
      <div v-if="reviewOrder" class="review-target">
        <strong>{{ reviewOrder.homestayName }}</strong>
        <span>{{ reviewOrder.roomName }} · {{ reviewOrder.checkIn }} 至 {{ reviewOrder.checkOut }}</span>
      </div>
      <el-form :model="reviewForm" label-width="90px">
        <el-form-item label="卫生">
          <el-rate v-model="reviewForm.scoreClean" show-text :texts="rateTexts" />
        </el-form-item>
        <el-form-item label="服务">
          <el-rate v-model="reviewForm.scoreService" show-text :texts="rateTexts" />
        </el-form-item>
        <el-form-item label="位置">
          <el-rate v-model="reviewForm.scoreLocation" show-text :texts="rateTexts" />
        </el-form-item>
        <el-form-item label="性价比">
          <el-rate v-model="reviewForm.scoreValue" show-text :texts="rateTexts" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="reviewForm.content" type="textarea" :rows="4" maxlength="1000" show-word-limit
                    placeholder="说说你的入住体验，帮助更多旅人做选择" />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload action="/api/upload" list-type="picture-card" :headers="uploadHeaders" :limit="3"
                     :on-success="onUploadSuccess" :on-remove="onUploadRemove" :file-list="fileList">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReview">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi, reviewApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { formatDate, orderStatusMap, orderStatusType } from '../../utils/format'

const store = useUserStore()
const fallback = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e8dccf"/></svg>`
)

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = 5
const status = ref(-1)
const detailVisible = ref(false)
const current = ref(null)
const reviewVisible = ref(false)
const reviewOrder = ref(null)
const submitting = ref(false)
const fileList = ref([])
const rateTexts = ['很差', '较差', '一般', '满意', '超赞']

const reviewForm = reactive({
  scoreClean: 5,
  scoreService: 5,
  scoreLocation: 5,
  scoreValue: 5,
  content: '',
  images: []
})

const uploadHeaders = computed(() => ({ Authorization: `Bearer ${store.token}` }))

const onImgError = (e) => {
  e.target.src = fallback
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await orderApi.my({
      page: page.value,
      size,
      status: status.value === -1 ? undefined : status.value
    })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const reload = () => {
  page.value = 1
  load()
}

const onPageChange = (value) => {
  page.value = value
  load()
}

const showDetail = (order) => {
  current.value = order
  detailVisible.value = true
}

const pay = async (order) => {
  await ElMessageBox.confirm(`确认支付 ¥${Number(order.amount).toFixed(2)}？`, '支付确认', { type: 'warning' })
  await orderApi.pay(order.id)
  ElMessage.success('支付成功，等待商家确认')
  load()
}

const cancel = async (order) => {
  const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
    inputValue: '行程有变',
    inputPlaceholder: '取消原因'
  })
  await orderApi.cancel(order.id, value)
  ElMessage.success('订单已取消')
  load()
}

const openReview = (order) => {
  reviewOrder.value = order
  reviewForm.scoreClean = 5
  reviewForm.scoreService = 5
  reviewForm.scoreLocation = 5
  reviewForm.scoreValue = 5
  reviewForm.content = ''
  reviewForm.images = []
  fileList.value = []
  reviewVisible.value = true
}

const onUploadSuccess = (response) => {
  if (response.code === 200) {
    reviewForm.images.push(response.data)
  } else {
    ElMessage.error(response.message)
  }
}

const onUploadRemove = (file) => {
  const url = file.response?.data || file.url
  reviewForm.images = reviewForm.images.filter((item) => item !== url)
}

const submitReview = async () => {
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }
  submitting.value = true
  try {
    await reviewApi.create({ orderId: reviewOrder.value.id, ...reviewForm })
    ElMessage.success('评价提交成功')
    reviewVisible.value = false
    load()
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.orders-page {
  padding: 34px 0 10px;
}

.tabs {
  margin-bottom: 22px;
}

.order-list {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #faf6f1;
  border-bottom: 1px solid var(--line);
  font-size: 12px;
  color: #7d7269;
}

.order-no {
  display: flex;
  gap: 16px;
}

.time {
  color: #b3a79c;
}

.order-body {
  display: flex;
  gap: 18px;
  padding: 18px 20px;
  align-items: center;
}

.order-body img {
  width: 150px;
  height: 104px;
  object-fit: cover;
  border-radius: 8px;
}

.order-info {
  flex: 1;
}

.order-info h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.order-info p {
  margin: 4px 0;
  color: var(--muted);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-amount {
  text-align: right;
}

.order-amount .price {
  font-size: 22px;
}

.amount-label {
  font-size: 11px;
  color: #b3a79c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px dashed var(--line);
}

.review-target {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #faf4ed;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 18px;
  font-size: 13px;
}

.review-target span {
  color: var(--muted);
  font-size: 12px;
}

.pagination {
  margin-top: 22px;
}
</style>
