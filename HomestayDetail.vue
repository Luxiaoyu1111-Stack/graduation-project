<template>
  <div v-loading="loading" class="detail-page">
    <template v-if="detail">
      <div class="gallery">
        <div class="page-container gallery-inner">
          <div class="main-img">
            <img :src="activeImage || fallback" alt="" @error="onImgError" />
          </div>
          <div class="thumbs">
            <div v-for="(img, i) in images" :key="i" :class="['thumb', { active: activeImage === img }]"
                 @click="activeImage = img">
              <img :src="img" alt="" @error="onImgError" />
            </div>
          </div>
        </div>
      </div>

      <div class="page-container body">
        <div class="main-col">
          <div class="head">
            <div>
              <div class="city-line">{{ homestay.city }} · {{ homestay.district }}</div>
              <h1>{{ homestay.name }}</h1>
              <div class="meta">
                <span class="score">{{ Number(homestay.score).toFixed(1) }} 分</span>
                <span class="dot">·</span>
                <span>{{ homestay.reviewCount }} 条评价</span>
                <span class="dot">·</span>
                <span>累计成交 {{ homestay.orderCount }} 单</span>
              </div>
              <p class="addr"><el-icon><Location /></el-icon> {{ homestay.address }}</p>
            </div>
            <el-button :type="detail.favorite ? 'danger' : 'default'" plain round @click="toggleFavorite">
              <el-icon><StarFilled v-if="detail.favorite" /><Star v-else /></el-icon>
              {{ detail.favorite ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div class="facilities">
            <el-tag v-for="f in homestay.facilities" :key="f" effect="plain" round>{{ f }}</el-tag>
          </div>

          <div class="panel intro">
            <div class="panel-title">民宿介绍</div>
            <p>{{ homestay.description }}</p>
          </div>

          <div class="panel">
            <div class="panel-title">
              <span>房型与价格</span>
              <span class="hint">价格为所选日期均价，实际以日历为准</span>
            </div>
            <div class="room-list">
              <div v-for="room in detail.rooms" :key="room.id" class="room">
                <img :src="room.cover || fallback" alt="" @error="onImgError" />
                <div class="room-info">
                  <h3>{{ room.name }}</h3>
                  <p class="room-desc">{{ room.description }}</p>
                  <div class="room-tags">
                    <span><el-icon><User /></el-icon> 可住 {{ room.capacity }} 人</span>
                    <span><el-icon><House /></el-icon> {{ room.bedType }}</span>
                    <span v-if="room.area"><el-icon><FullScreen /></el-icon> {{ room.area }} ㎡</span>
                  </div>
                </div>
                <div class="room-price">
                  <div class="price">¥{{ Number(room.basePrice).toFixed(0) }}<small> /晚</small></div>
                  <el-button type="primary" plain round @click="openBooking(room)">选择日期预订</el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="panel review-panel">
            <div class="panel-title">
              <span>住客评价</span>
              <span class="hint">共 {{ stats.total }} 条真实评价</span>
            </div>

            <div class="review-summary">
              <div class="avg">
                <div class="avg-num">{{ stats.avgScore }}</div>
                <el-rate :model-value="Number(stats.avgScore)" disabled />
                <div class="avg-count">{{ stats.total }} 条评价</div>
              </div>
              <div class="dims">
                <div v-for="d in stats.dimensions" :key="d.name" class="dim">
                  <span class="dim-name">{{ d.name }}</span>
                  <el-progress :percentage="Number(d.value) * 20" :show-text="false" :stroke-width="7"
                               color="#b9764a" />
                  <span class="dim-value">{{ Number(d.value || 0).toFixed(1) }}</span>
                </div>
              </div>
              <div class="dist">
                <div v-for="item in stats.distribution" :key="item.name" class="dist-row">
                  <span>{{ item.name }}</span>
                  <el-progress :percentage="distPercent(item.value)" :show-text="false" :stroke-width="7"
                               color="#d9a97e" />
                  <span class="dist-count">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <div class="review-filter">
              <el-radio-group v-model="scoreFilter" size="small" @change="reloadReviews">
                <el-radio-button :value="0">全部</el-radio-button>
                <el-radio-button :value="5">5 分</el-radio-button>
                <el-radio-button :value="4">4 分</el-radio-button>
                <el-radio-button :value="3">3 分</el-radio-button>
                <el-radio-button :value="2">2 分</el-radio-button>
                <el-radio-button :value="1">1 分</el-radio-button>
              </el-radio-group>
            </div>

            <div class="review-list">
              <div v-for="r in reviews" :key="r.id" class="review">
                <el-avatar :size="42" :src="r.avatar || ''">{{ (r.nickname || '游').slice(0, 1) }}</el-avatar>
                <div class="review-main">
                  <div class="review-head">
                    <strong>{{ r.nickname }}</strong>
                    <span class="review-date">{{ formatDate(r.createdAt) }}</span>
                  </div>
                  <div class="review-score">
                    <el-rate :model-value="Number(r.scoreTotal)" disabled size="small" />
                    <span class="total">{{ Number(r.scoreTotal).toFixed(1) }}</span>
                    <el-tag size="small" effect="plain">卫生 {{ r.scoreClean }}</el-tag>
                    <el-tag size="small" effect="plain">服务 {{ r.scoreService }}</el-tag>
                    <el-tag size="small" effect="plain">位置 {{ r.scoreLocation }}</el-tag>
                    <el-tag size="small" effect="plain">性价比 {{ r.scoreValue }}</el-tag>
                  </div>
                  <p class="review-content">{{ r.content }}</p>
                  <div v-if="r.images && r.images.length" class="review-images">
                    <el-image v-for="(img, i) in r.images" :key="i" :src="img" :preview-src-list="r.images"
                              fit="cover" />
                  </div>
                  <div v-if="r.reply" class="reply">
                    <strong>商家回复：</strong>{{ r.reply }}
                  </div>
                </div>
              </div>
              <el-empty v-if="!reviews.length" description="还没有评价" />
            </div>

            <div v-if="reviews.length < reviewTotal" class="more">
              <el-button text @click="loadMoreReviews">加载更多评价</el-button>
            </div>
          </div>
        </div>

        <aside class="side-col">
          <div class="booking-card">
            <div class="booking-price">
              <span class="price">¥{{ Number(homestay.minPrice).toFixed(0) }}</span>
              <small>起 / 晚</small>
            </div>
            <div class="booking-field">
              <label>入住日期</label>
              <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD"
                              start-placeholder="入住" end-placeholder="离店" :disabled-date="disabledDate"
                              @change="refreshCalendar" />
            </div>
            <div class="booking-field">
              <label>选择房型</label>
              <el-select v-model="selectedRoomId" @change="refreshCalendar">
                <el-option v-for="room in detail.rooms" :key="room.id" :value="room.id"
                           :label="`${room.name} · ¥${room.basePrice}`" />
              </el-select>
            </div>
            <div v-if="selectedRoom" class="booking-summary">
              <div><span>入住</span><b>{{ dateRange?.[0] || '—' }}</b></div>
              <div><span>离店</span><b>{{ dateRange?.[1] || '—' }}</b></div>
              <div><span>晚数</span><b>{{ nights }} 晚</b></div>
              <div><span>剩余房量</span><b>{{ maxStock }} 间</b></div>
            </div>
            <div class="booking-total">
              <span>合计</span>
              <span class="price">¥{{ totalPrice.toFixed(0) }}</span>
            </div>
            <el-button type="primary" size="large" class="booking-btn" @click="openBooking(selectedRoom)">
              立即预订
            </el-button>
            <p class="booking-tip">下单后 30 分钟内未支付将自动取消</p>
          </div>

          <div class="host-card">
            <div class="host-title">民宿主人</div>
            <div class="host-name">{{ homestay.merchantName }}</div>
            <p>平台认证商家，房源信息真实有效。如有特殊需求，可在预订备注中说明。</p>
            <div class="host-badges">
              <el-tag size="small" type="success" effect="plain">实名认证</el-tag>
              <el-tag size="small" effect="plain">快速回复</el-tag>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <el-dialog v-model="bookingVisible" title="确认预订" width="540px">
      <div v-if="bookingRoom" class="dialog-body">
        <div class="dialog-summary">
          <div>
            <div class="dialog-name">{{ bookingRoom.name }}</div>
            <div class="dialog-sub">{{ homestay.name }}</div>
          </div>
          <div class="dialog-price">¥{{ totalPrice.toFixed(0) }}</div>
        </div>
        <div class="dialog-dates">
          <span>{{ dateRange?.[0] }} 至 {{ dateRange?.[1] }}</span>
          <span>共 {{ nights }} 晚</span>
        </div>
        <el-form ref="bookingRef" :model="bookingForm" :rules="bookingRules" label-width="86px">
          <el-form-item label="联系人" prop="contactName">
            <el-input v-model="bookingForm.contactName" placeholder="请填写入住人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="bookingForm.contactPhone" placeholder="请填写手机号" />
          </el-form-item>
          <el-form-item label="房间数量">
            <el-input-number v-model="bookingForm.roomCount" :min="1" :max="Math.max(maxStock, 1)" />
            <span class="stock-hint">当前日期剩余 {{ maxStock }} 间</span>
          </el-form-item>
          <el-form-item label="入住人数">
            <el-input-number v-model="bookingForm.guestNum" :min="1" :max="bookingRoom.capacity * bookingForm.roomCount" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="bookingForm.remark" type="textarea" :rows="2" placeholder="选填，如接站、加床等需求" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="bookingVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitBooking">提交订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { favoriteApi, homestayApi, orderApi, roomApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { formatDate, toDateString, addDays } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const fallback = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e8dccf"/><text x="400" y="310" font-size="40" fill="#b9764a" text-anchor="middle" font-family="serif">栖居</text></svg>`
)

const loading = ref(true)
const detail = ref(null)
const activeImage = ref('')
const dateRange = ref([toDateString(addDays(new Date(), 1)), toDateString(addDays(new Date(), 3))])
const selectedRoomId = ref(null)
const calendar = ref([])
const scoreFilter = ref(0)
const reviews = ref([])
const reviewTotal = ref(0)
const reviewPage = ref(1)
const bookingVisible = ref(false)
const bookingRoom = ref(null)
const submitting = ref(false)
const bookingRef = ref()

const bookingForm = reactive({
  contactName: '',
  contactPhone: '',
  roomCount: 1,
  guestNum: 1,
  remark: ''
})

const bookingRules = {
  contactName: [{ required: true, message: '请填写联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const homestay = computed(() => detail.value?.homestay || {})
const stats = computed(() => detail.value?.reviewStats || { dimensions: [], distribution: [], avgScore: 5, total: 0 })
const images = computed(() => {
  const imgs = homestay.value.images?.length ? homestay.value.images : [homestay.value.cover]
  return imgs.filter(Boolean)
})
const selectedRoom = computed(() => detail.value?.rooms.find((r) => r.id === selectedRoomId.value))
const nights = computed(() => {
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) return 0
  return Math.round((new Date(dateRange.value[1]) - new Date(dateRange.value[0])) / 86400000)
})
const maxStock = computed(() => {
  if (!calendar.value.length) return selectedRoom.value?.stock || 0
  return Math.min(...calendar.value.map((c) => c.stock))
})
const totalPrice = computed(() => {
  if (!calendar.value.length) return 0
  return calendar.value.reduce((sum, c) => sum + Number(c.price), 0) * bookingForm.roomCount
})

const distPercent = (count) => {
  const total = stats.value.total || 1
  return Math.round((Number(count) / total) * 100)
}

const disabledDate = (date) => date < new Date(new Date().toDateString())

const onImgError = (e) => {
  e.target.src = fallback
  e.target.onerror = null
}

const loadDetail = async () => {
  const { data } = await homestayApi.detail(route.params.id)
  detail.value = data
  activeImage.value = images.value[0]
  selectedRoomId.value = data.rooms?.[0]?.id
  await refreshCalendar()
  await reloadReviews()
  loading.value = false
}

const refreshCalendar = async () => {
  if (!selectedRoomId.value || !dateRange.value?.[0]) return
  const start = dateRange.value[0]
  const end = toDateString(addDays(dateRange.value[1], 1))
  const { data } = await roomApi.calendar(selectedRoomId.value, start, end)
  calendar.value = data
}

const reloadReviews = async () => {
  reviewPage.value = 1
  const { data } = await homestayApi.reviews(route.params.id, {
    page: 1,
    size: 5,
    scoreType: scoreFilter.value || undefined
  })
  reviews.value = data.records
  reviewTotal.value = data.total
}

const loadMoreReviews = async () => {
  reviewPage.value += 1
  const { data } = await homestayApi.reviews(route.params.id, {
    page: reviewPage.value,
    size: 5,
    scoreType: scoreFilter.value || undefined
  })
  reviews.value = [...reviews.value, ...data.records]
}

const toggleFavorite = async () => {
  if (!store.isLogin) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!store.isUser) {
    ElMessage.warning('请使用游客账号收藏民宿')
    return
  }
  const { data } = await favoriteApi.toggle(homestay.value.id)
  detail.value.favorite = data
  ElMessage.success(data ? '已加入收藏' : '已取消收藏')
}

const openBooking = (room) => {
  if (!room) {
    ElMessage.warning('请先选择房型')
    return
  }
  if (!store.isLogin) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!store.isUser) {
    ElMessage.warning('请使用游客账号预订民宿')
    return
  }
  if (!dateRange.value?.[0]) {
    ElMessage.warning('请先选择入住和离店日期')
    return
  }
  if (maxStock.value < 1) {
    ElMessage.warning('所选日期已满房，请更换日期')
    return
  }
  bookingRoom.value = room
  bookingForm.contactName = store.user?.nickname || ''
  bookingForm.contactPhone = store.user?.phone || ''
  bookingForm.roomCount = 1
  bookingForm.guestNum = 1
  bookingVisible.value = true
}

const submitBooking = async () => {
  await bookingRef.value.validate()
  submitting.value = true
  try {
    const { data } = await orderApi.create({
      roomTypeId: bookingRoom.value.id,
      checkIn: dateRange.value[0],
      checkOut: dateRange.value[1],
      roomCount: bookingForm.roomCount,
      guestNum: bookingForm.guestNum,
      contactName: bookingForm.contactName,
      contactPhone: bookingForm.contactPhone,
      remark: bookingForm.remark
    })
    bookingVisible.value = false
    await ElMessageBox.confirm(
      `订单 ${data.orderNo} 已创建，应付金额 ¥${Number(data.amount).toFixed(2)}，是否立即支付？`,
      '下单成功',
      { confirmButtonText: '立即支付', cancelButtonText: '稍后支付', type: 'success' }
    )
    await orderApi.pay(data.id)
    ElMessage.success('支付成功，等待商家确认')
    router.push('/orders')
  } catch (e) {
    if (e !== 'cancel') {
      router.push('/orders')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.detail-page {
  min-height: 600px;
}

.gallery {
  background: #2b241f;
  padding: 18px 0;
}

.gallery-inner {
  display: flex;
  gap: 14px;
}

.main-img {
  flex: 1;
  aspect-ratio: 16 / 8;
  border-radius: 12px;
  overflow: hidden;
  background: #1e1a16;
}

.main-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbs {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.thumb {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.6;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumb.active {
  opacity: 1;
  border-color: #d9a97e;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  padding: 30px 0 50px;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.city-line {
  color: var(--brand);
  font-size: 12px;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.head h1 {
  margin: 0 0 10px;
  font-size: 30px;
  letter-spacing: 1px;
}

.meta {
  color: var(--muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta .score {
  color: #c0563a;
  font-weight: 600;
}

.dot {
  color: #d8ccc1;
}

.addr {
  color: var(--muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0 0;
}

.facilities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.intro p {
  margin: 0;
  line-height: 2;
  font-size: 14px;
  color: #5c534c;
  white-space: pre-line;
}

.hint {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.room {
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  gap: 16px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  align-items: center;
}

.room img {
  width: 150px;
  height: 108px;
  object-fit: cover;
  border-radius: 8px;
}

.room-info h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.room-desc {
  color: var(--muted);
  font-size: 12px;
  margin: 0 0 10px;
  line-height: 1.6;
}

.room-tags {
  display: flex;
  gap: 16px;
  color: #7d7269;
  font-size: 12px;
}

.room-tags span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.room-price .price {
  font-size: 22px;
}

.review-summary {
  display: grid;
  grid-template-columns: 140px 1fr 220px;
  gap: 26px;
  padding: 10px 0 22px;
  border-bottom: 1px solid var(--line);
}

.avg {
  text-align: center;
}

.avg-num {
  font-size: 46px;
  font-weight: 600;
  color: #c0563a;
  line-height: 1.1;
}

.avg-count {
  color: var(--muted);
  font-size: 12px;
  margin-top: 6px;
}

.dims {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.dim {
  display: grid;
  grid-template-columns: 48px 1fr 36px;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #7d7269;
}

.dim-value {
  text-align: right;
}

.dist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.dist-row {
  display: grid;
  grid-template-columns: 34px 1fr 28px;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #7d7269;
}

.review-filter {
  margin: 18px 0;
}

.review {
  display: flex;
  gap: 14px;
  padding: 18px 0;
  border-bottom: 1px dashed var(--line);
}

.review-main {
  flex: 1;
}

.review-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.review-date {
  color: #b3a79c;
  font-size: 12px;
}

.review-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  flex-wrap: wrap;
}

.review-score .total {
  color: #c0563a;
  font-weight: 600;
  font-size: 13px;
}

.review-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #4a423c;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.review-images .el-image {
  width: 84px;
  height: 84px;
  border-radius: 8px;
}

.reply {
  margin-top: 10px;
  background: #faf4ed;
  border-left: 3px solid #d9a97e;
  padding: 10px 12px;
  font-size: 13px;
  color: #6b5b4d;
  border-radius: 0 6px 6px 0;
}

.more {
  text-align: center;
  margin-top: 14px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 92px;
}

.booking-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 14px 34px rgba(60, 42, 28, 0.07);
}

.booking-price .price {
  font-size: 30px;
}

.booking-field {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-field label {
  font-size: 12px;
  color: var(--muted);
}

.booking-field :deep(.el-select),
.booking-field :deep(.el-date-editor) {
  width: 100%;
}

.booking-summary {
  margin-top: 18px;
  padding: 14px 0;
  border-top: 1px dashed var(--line);
  border-bottom: 1px dashed var(--line);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 12px;
}

.booking-summary div {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}

.booking-summary b {
  color: var(--ink);
  font-weight: 500;
}

.booking-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 16px 0;
  font-size: 14px;
}

.booking-total .price {
  font-size: 24px;
}

.booking-btn {
  width: 100%;
}

.booking-tip {
  text-align: center;
  color: #b3a79c;
  font-size: 11px;
  margin: 12px 0 0;
}

.host-card {
  background: #f7f1ea;
  border-radius: 14px;
  padding: 20px;
}

.host-title {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}

.host-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.host-card p {
  font-size: 12px;
  color: #7d7269;
  line-height: 1.8;
  margin: 0 0 12px;
}

.host-badges {
  display: flex;
  gap: 8px;
}

.dialog-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.dialog-name {
  font-size: 17px;
  font-weight: 600;
}

.dialog-sub {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

.dialog-price {
  color: #c0563a;
  font-size: 24px;
  font-weight: 600;
}

.dialog-dates {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b5b4d;
  background: #faf4ed;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 14px 0 18px;
}

.stock-hint {
  margin-left: 12px;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 1000px) {
  .body {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
  }
}
</style>

