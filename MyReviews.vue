<template>
  <div class="page-container reviews-page">
    <h1 class="page-title">我的评价</h1>
    <p class="page-desc">你发表过的每一条评价，都会帮助后来的旅人</p>

    <div v-loading="loading" class="review-list">
      <div v-for="r in list" :key="r.id" class="review-card">
        <div class="review-head">
          <div>
            <h3>{{ r.homestayName }}</h3>
            <span class="time">{{ formatDate(r.createdAt, true) }}</span>
          </div>
          <div class="score">
            <el-rate :model-value="Number(r.scoreTotal)" disabled size="small" />
            <strong>{{ Number(r.scoreTotal).toFixed(1) }}</strong>
          </div>
        </div>
        <div class="dims">
          <el-tag size="small" effect="plain">卫生 {{ r.scoreClean }}</el-tag>
          <el-tag size="small" effect="plain">服务 {{ r.scoreService }}</el-tag>
          <el-tag size="small" effect="plain">位置 {{ r.scoreLocation }}</el-tag>
          <el-tag size="small" effect="plain">性价比 {{ r.scoreValue }}</el-tag>
          <el-tag v-if="r.status === 0" size="small" type="info">已被管理员隐藏</el-tag>
        </div>
        <p class="content">{{ r.content }}</p>
        <div v-if="r.images && r.images.length" class="images">
          <el-image v-for="(img, i) in r.images" :key="i" :src="img" :preview-src-list="r.images" fit="cover" />
        </div>
        <div v-if="r.reply" class="reply"><strong>商家回复：</strong>{{ r.reply }}</div>
        <div v-else class="no-reply">商家暂未回复</div>
      </div>
      <el-empty v-if="!loading && !list.length" description="还没有发表过评价">
        <el-button type="primary" @click="$router.push('/orders')">去完成订单并评价</el-button>
      </el-empty>
    </div>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size"
                     :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { reviewApi } from '../../api'
import { formatDate } from '../../utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = 5
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const { data } = await reviewApi.my({ page: page.value, size })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const onPageChange = (value) => {
  page.value = value
  load()
}

onMounted(load)
</script>

<style scoped>
.reviews-page {
  padding: 34px 0 10px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 240px;
}

.review-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.review-head h3 {
  margin: 0 0 4px;
  font-size: 17px;
}

.time {
  font-size: 12px;
  color: #b3a79c;
}

.score {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c0563a;
}

.dims {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.content {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #4a423c;
}

.images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.images .el-image {
  width: 90px;
  height: 90px;
  border-radius: 8px;
}

.reply {
  margin-top: 14px;
  background: #faf4ed;
  border-left: 3px solid #d9a97e;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: #6b5b4d;
}

.no-reply {
  margin-top: 12px;
  font-size: 12px;
  color: #b3a79c;
}
</style>
