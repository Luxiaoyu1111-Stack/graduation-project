<template>
  <div class="list-page">
    <div class="list-hero">
      <div class="page-container">
        <h1 class="serif">发现值得住的民宿</h1>
        <p>共 {{ total }} 家民宿 · 按你的节奏挑选</p>
      </div>
    </div>

    <div class="page-container">
      <div class="filter-bar">
        <el-select v-model="query.city" placeholder="全部城市" clearable @change="reload">
          <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="priceRange" placeholder="价格区间" clearable @change="onPriceChange">
          <el-option label="300 元以下" value="0-300" />
          <el-option label="300-500 元" value="300-500" />
          <el-option label="500-800 元" value="500-800" />
          <el-option label="800 元以上" value="800-99999" />
        </el-select>
        <el-select v-model="query.sort" @change="reload">
          <el-option label="综合推荐" value="default" />
          <el-option label="评分优先" value="score" />
          <el-option label="价格从低到高" value="priceAsc" />
          <el-option label="价格从高到低" value="priceDesc" />
          <el-option label="销量优先" value="orders" />
        </el-select>
        <el-input v-model="query.keyword" placeholder="搜索民宿名称或地址" clearable class="keyword"
                  @keyup.enter="reload">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="reload">筛选</el-button>
      </div>

      <div v-loading="loading" class="result">
        <div v-if="list.length" class="grid">
          <HomestayCard v-for="item in list" :key="item.id" :homestay="item" />
        </div>
        <el-empty v-else description="没有找到符合条件的民宿，换个条件试试" />
      </div>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next, total" :total="total"
                       :page-size="query.size" :current-page="query.page" @current-change="onPageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import HomestayCard from '../../components/HomestayCard.vue'
import { homestayApi } from '../../api'

const route = useRoute()
const list = ref([])
const cities = ref([])
const total = ref(0)
const loading = ref(false)
const priceRange = ref('')
const query = reactive({
  city: route.query.city || '',
  keyword: route.query.keyword || '',
  sort: 'default',
  minPrice: null,
  maxPrice: null,
  page: 1,
  size: 9
})

const load = async () => {
  loading.value = true
  try {
    const { data } = await homestayApi.list({
      city: query.city || undefined,
      keyword: query.keyword || undefined,
      sort: query.sort,
      minPrice: query.minPrice ?? undefined,
      maxPrice: query.maxPrice ?? undefined,
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

const onPriceChange = (value) => {
  if (!value) {
    query.minPrice = null
    query.maxPrice = null
  } else {
    const [min, max] = value.split('-')
    query.minPrice = Number(min)
    query.maxPrice = Number(max)
  }
  reload()
}

const onPageChange = (page) => {
  query.page = page
  load()
}

onMounted(async () => {
  const { data } = await homestayApi.cities()
  cities.value = data
  load()
})
</script>

<style scoped>
.list-hero {
  background: linear-gradient(120deg, #4a3a2f, #332a24);
  color: #f6ede4;
  padding: 54px 0 46px;
}

.list-hero h1 {
  font-size: 34px;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.list-hero p {
  margin: 0;
  color: #c9b8a8;
  font-size: 14px;
}

.filter-bar {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  gap: 12px;
  align-items: center;
  margin: -28px 0 28px;
  position: relative;
  box-shadow: 0 12px 30px rgba(55, 40, 28, 0.06);
  flex-wrap: wrap;
}

.filter-bar .keyword {
  flex: 1;
  min-width: 200px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.result {
  min-height: 300px;
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
