<template>
  <div>
    <div class="table-toolbar">
      <div class="left">
        <el-radio-group v-model="replied" @change="reload">
          <el-radio-button :value="null">全部评价</el-radio-button>
          <el-radio-button :value="0">待回复</el-radio-button>
          <el-radio-button :value="1">已回复</el-radio-button>
        </el-radio-group>
        <el-input v-model="keyword" placeholder="搜索评价内容" clearable style="width: 220px" @keyup.enter="reload" />
      </div>
      <span class="total">共 {{ total }} 条评价</span>
    </div>

    <div v-loading="loading" class="review-list">
      <div v-for="item in list" :key="item.id" class="review-card">
        <div class="review-head">
          <div class="user">
            <el-avatar :size="38">{{ (item.nickname || '游').slice(0, 1) }}</el-avatar>
            <div>
              <div class="name">{{ item.nickname }}</div>
              <div class="sub">{{ item.homestayName }} · {{ formatDate(item.createdAt, true) }}</div>
            </div>
          </div>
          <div class="score">
            <el-rate :model-value="Number(item.scoreTotal)" disabled size="small" />
            <strong>{{ Number(item.scoreTotal).toFixed(1) }}</strong>
          </div>
        </div>
        <div class="dims">
          <el-tag size="small" effect="plain">卫生 {{ item.scoreClean }}</el-tag>
          <el-tag size="small" effect="plain">服务 {{ item.scoreService }}</el-tag>
          <el-tag size="small" effect="plain">位置 {{ item.scoreLocation }}</el-tag>
          <el-tag size="small" effect="plain">性价比 {{ item.scoreValue }}</el-tag>
        </div>
        <p class="content">{{ item.content }}</p>
        <div v-if="item.reply" class="reply">
          <strong>我的回复：</strong>{{ item.reply }}
          <span class="reply-time">{{ formatDate(item.replyAt, true) }}</span>
        </div>
        <div v-else class="reply-actions">
          <el-input v-model="replyText[item.id]" placeholder="回复住客的评价，展现你的服务态度" maxlength="300"
                    show-word-limit />
          <el-button type="primary" @click="reply(item)">回复</el-button>
        </div>
      </div>
      <el-empty v-if="!loading && !list.length" description="暂无评价" />
    </div>

    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size"
                     :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantApi } from '../../api'
import { formatDate } from '../../utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = 5
const loading = ref(false)
const replied = ref(null)
const keyword = ref('')
const replyText = reactive({})

const load = async () => {
  loading.value = true
  try {
    const { data } = await merchantApi.reviews({
      replied: replied.value ?? undefined,
      keyword: keyword.value || undefined,
      page: page.value,
      size
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

const reply = async (item) => {
  const content = (replyText[item.id] || '').trim()
  if (!content) {
    ElMessage.warning('请填写回复内容')
    return
  }
  await merchantApi.reply(item.id, content)
  ElMessage.success('回复成功')
  replyText[item.id] = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.total {
  font-size: 12px;
  color: var(--muted);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 200px;
}

.review-card {
  background: #fff;
  border: 1px solid #ece5dd;
  border-radius: 12px;
  padding: 18px 20px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user {
  display: flex;
  gap: 10px;
  align-items: center;
}

.name {
  font-size: 14px;
  font-weight: 600;
}

.sub {
  font-size: 11px;
  color: #a99c90;
  margin-top: 3px;
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
  margin: 12px 0 10px;
}

.content {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #4a423c;
}

.reply {
  margin-top: 12px;
  background: #faf4ed;
  border-left: 3px solid #d9a97e;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: #6b5b4d;
}

.reply-time {
  color: #a99c90;
  font-size: 11px;
  margin-left: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
</style>
