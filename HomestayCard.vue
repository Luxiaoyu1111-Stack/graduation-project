<template>
  <div class="hs-card card-hover" @click="$router.push(`/homestays/${homestay.id}`)">
    <div class="cover">
      <img :src="homestay.cover || fallback" :alt="homestay.name" @error="onError" />
      <span class="city-tag">{{ homestay.city }}</span>
      <span v-if="homestay.score" class="score-tag">
        <el-icon><StarFilled /></el-icon>{{ Number(homestay.score).toFixed(1) }}
      </span>
    </div>
    <div class="body">
      <h3>{{ homestay.name }}</h3>
      <p class="addr">{{ homestay.district }} · {{ homestay.address }}</p>
      <div class="tags">
        <el-tag v-for="f in homestay.facilities.slice(0, 3)" :key="f" size="small" effect="plain">{{ f }}</el-tag>
      </div>
      <div class="foot">
        <div>
          <span class="price">¥{{ Number(homestay.minPrice).toFixed(0) }}</span>
          <small> / 晚起</small>
        </div>
        <span class="review">{{ homestay.reviewCount }} 条评价</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  homestay: { type: Object, required: true }
})

const fallback = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e8dccf"/><text x="300" y="205" font-size="26" fill="#b9764a" text-anchor="middle" font-family="serif">栖居</text></svg>`
)

const onError = (e) => {
  e.target.src = fallback
}
</script>

<style scoped>
.hs-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--line);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.cover {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #eee;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.hs-card:hover .cover img {
  transform: scale(1.04);
}

.city-tag {
  position: absolute;
  left: 12px;
  top: 12px;
  background: rgba(47, 42, 38, 0.62);
  color: #fff;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.score-tag {
  position: absolute;
  right: 12px;
  top: 12px;
  background: rgba(255, 255, 255, 0.94);
  color: #b9764a;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.body h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.addr {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 4px;
}

.price {
  font-size: 20px;
}

.review {
  color: var(--muted);
  font-size: 12px;
}
</style>
