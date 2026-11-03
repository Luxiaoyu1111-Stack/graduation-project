<template>
  <div class="home">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-mask"></div>
      <div class="page-container hero-content">
        <p class="eyebrow">STAY SOMEWHERE SPECIAL</p>
        <h1 class="serif">住进风景里，<br />遇见旅途中的另一个家</h1>
        <p class="hero-sub">精选 12 家民宿，覆盖丽江、大理、厦门、杭州等 11 座城市，真实评价帮你选对每一晚</p>

        <div class="search-box">
          <div class="field">
            <label>目的地</label>
            <el-select v-model="query.city" placeholder="全部城市" clearable>
              <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="divider"></div>
          <div class="field grow">
            <label>关键词</label>
            <el-input v-model="query.keyword" placeholder="搜索民宿名称、地址或特色" clearable
                      @keyup.enter="search" />
          </div>
          <el-button type="primary" size="large" class="search-btn" @click="search">
            <el-icon><Search /></el-icon> 查找民宿
          </el-button>
        </div>

        <div class="hot-cities">
          <span>热门目的地：</span>
          <a v-for="c in ['丽江', '大理', '厦门', '杭州', '成都', '三亚']" :key="c" @click="goCity(c)">{{ c }}</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-container">
        <div class="section-head">
          <div>
            <h2 class="serif">精选民宿</h2>
            <div class="sub">根据评分与成交量为你推荐</div>
          </div>
          <el-button text @click="$router.push('/homestays')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div class="grid">
          <HomestayCard v-for="item in hotList" :key="item.id" :homestay="item" />
        </div>
      </div>
    </section>

    <section class="features">
      <div class="page-container feature-grid">
        <div class="feature">
          <el-icon><Select /></el-icon>
          <h3>真实多维评价</h3>
          <p>卫生、服务、位置、性价比四维评分，只展示真实入住后的评价</p>
        </div>
        <div class="feature">
          <el-icon><Calendar /></el-icon>
          <h3>实时房态库存</h3>
          <p>按日期查看每日房价与余量，下单即锁定房源，避免到店无房</p>
        </div>
        <div class="feature">
          <el-icon><ChatLineSquare /></el-icon>
          <h3>商家及时回复</h3>
          <p>评价可被商家回复，疑问在预订前就能问清楚</p>
        </div>
        <div class="feature">
          <el-icon><Lock /></el-icon>
          <h3>安全可靠</h3>
          <p>JWT 登录认证与角色权限控制，订单与个人信息全程加密传输</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-container two-col">
        <div>
          <div class="section-head">
            <div>
              <h2 class="serif">平台公告</h2>
              <div class="sub">预订规则与最新活动</div>
            </div>
          </div>
          <div class="notice-list">
            <div v-for="n in announcements" :key="n.id" class="notice">
              <span class="dot"></span>
              <div>
                <div class="notice-title">{{ n.title }}</div>
                <div class="notice-content">{{ n.content }}</div>
                <div class="notice-time">{{ formatDate(n.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="merchant-cta">
          <h3 class="serif">我是民宿房东</h3>
          <p>免费入驻栖居，管理房源、房态与订单，用真实评价积累口碑。</p>
          <ul>
            <li>民宿信息与房型统一管理</li>
            <li>按天设置价格与库存</li>
            <li>经营数据与评价统计一目了然</li>
          </ul>
          <el-button type="primary" size="large" @click="toMerchant">申请入驻</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import HomestayCard from '../../components/HomestayCard.vue'
import { announcementApi, homestayApi } from '../../api'
import { formatDate } from '../../utils/format'

const router = useRouter()
const hotList = ref([])
const announcements = ref([])
const cities = ref([])
const query = reactive({ city: '', keyword: '' })

const load = async () => {
  const [hot, notice, cityRes] = await Promise.all([
    homestayApi.hot(4),
    announcementApi.list(4),
    homestayApi.cities()
  ])
  hotList.value = hot.data
  announcements.value = notice.data
  cities.value = cityRes.data
}

const search = () => {
  router.push({ path: '/homestays', query: { ...query } })
}

const goCity = (city) => {
  router.push({ path: '/homestays', query: { city } })
}

const toMerchant = () => {
  router.push('/register')
}

onMounted(load)
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 540px;
  display: flex;
  align-items: center;
  color: #fff;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('/images/hero.jpg') center/cover no-repeat, linear-gradient(135deg, #6b4b36, #2f2a26);
  transform: scale(1.02);
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(32, 25, 20, 0.78) 0%, rgba(32, 25, 20, 0.42) 55%, rgba(32, 25, 20, 0.18) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 90px 0 70px;
}

.eyebrow {
  letter-spacing: 5px;
  font-size: 11px;
  color: #e2c7b0;
  margin-bottom: 18px;
}

.hero h1 {
  font-size: 50px;
  line-height: 1.28;
  margin: 0 0 18px;
  font-weight: 500;
  letter-spacing: 2px;
}

.hero-sub {
  color: #e9ded4;
  font-size: 15px;
  margin-bottom: 30px;
}

.search-box {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 860px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  color: var(--ink);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 160px;
}

.field.grow {
  flex: 1;
}

.field label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 1px;
}

.field :deep(.el-select),
.field :deep(.el-input__wrapper) {
  box-shadow: none;
  padding-left: 0;
}

.field :deep(.el-input__inner) {
  font-size: 14px;
}

.divider {
  width: 1px;
  height: 34px;
  background: var(--line);
}

.search-btn {
  height: 46px;
  padding: 0 26px;
}

.hot-cities {
  margin-top: 22px;
  font-size: 13px;
  color: #e6d8cb;
  display: flex;
  gap: 16px;
  align-items: center;
}

.hot-cities a {
  cursor: pointer;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.35);
  padding-bottom: 2px;
}

.hot-cities a:hover {
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.features {
  background: #f3ece4;
  padding: 44px 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 26px;
}

.feature {
  text-align: left;
}

.feature .el-icon {
  font-size: 26px;
  color: var(--brand);
  margin-bottom: 10px;
}

.feature h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.feature p {
  margin: 0;
  font-size: 13px;
  color: #7d7269;
  line-height: 1.7;
}

.two-col {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
  align-items: start;
}

.notice-list {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px 22px;
}

.notice {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px dashed var(--line);
}

.notice:last-child {
  border-bottom: none;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  margin-top: 8px;
  flex: none;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
}

.notice-content {
  font-size: 13px;
  color: #7d7269;
  line-height: 1.7;
  margin: 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-time {
  font-size: 12px;
  color: #b3a79c;
}

.merchant-cta {
  background: linear-gradient(160deg, #3a3029, #241e1a);
  color: #f3e9df;
  border-radius: 16px;
  padding: 38px 34px;
}

.merchant-cta h3 {
  font-size: 26px;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.merchant-cta p {
  color: #c3b4a6;
  font-size: 14px;
  line-height: 1.8;
}

.merchant-cta ul {
  padding-left: 18px;
  color: #c3b4a6;
  font-size: 13px;
  line-height: 2;
  margin: 18px 0 26px;
}

@media (max-width: 1100px) {
  .grid,
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
