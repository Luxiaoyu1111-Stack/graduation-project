<template>
  <div class="page-container fav-page">
    <h1 class="page-title">我的收藏</h1>
    <p class="page-desc">收藏的民宿会保存在这里，方便下次快速找到</p>

    <div v-loading="loading">
      <div v-if="list.length" class="grid">
        <div v-for="item in list" :key="item.id" class="fav-item">
          <HomestayCard :homestay="item" />
          <el-button class="remove" circle size="small" @click.stop="remove(item)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      <el-empty v-else description="还没有收藏的民宿">
        <el-button type="primary" @click="$router.push('/homestays')">去发现好民宿</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import HomestayCard from '../../components/HomestayCard.vue'
import { favoriteApi } from '../../api'

const list = ref([])
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const { data } = await favoriteApi.list()
    list.value = data
  } finally {
    loading.value = false
  }
}

const remove = async (item) => {
  await favoriteApi.toggle(item.id)
  ElMessage.success('已取消收藏')
  load()
}

onMounted(load)
</script>

<style scoped>
.fav-page {
  padding: 34px 0 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.fav-item {
  position: relative;
}

.remove {
  position: absolute;
  right: 10px;
  bottom: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.fav-item:hover .remove {
  opacity: 1;
}
</style>
