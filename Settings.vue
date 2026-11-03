<template>
  <div>
    <div class="panel">
      <div class="panel-title">
        <span>敏感词库</span>
        <span class="hint">用于评价与商家回复内容过滤，命中词将替换为 *</span>
      </div>
      <div class="add-row">
        <el-input v-model="newWord" placeholder="输入需要过滤的敏感词" style="width: 260px" maxlength="20"
                  @keyup.enter="add" />
        <el-button type="primary" @click="add">添加敏感词</el-button>
      </div>
      <div class="words">
        <el-tag v-for="item in words" :key="item.id" closable size="large" effect="plain" class="word"
                @close="remove(item)">
          {{ item.word }}
        </el-tag>
        <el-empty v-if="!words.length" description="暂无敏感词" />
      </div>
    </div>

    <div class="panel" style="margin-top: 16px">
      <div class="panel-title">过滤效果示例</div>
      <div class="demo">
        <el-input v-model="demoText" type="textarea" :rows="3" placeholder="输入一段文字测试过滤效果" />
        <div class="result">
          <span class="label">过滤结果：</span>
          <span>{{ filtered }}</span>
        </div>
        <div class="tip">
          说明：前端仅做效果预览，实际过滤在服务端提交评价时执行，采用 DFA 字典树算法，
          时间复杂度为 O(n)，可满足实时过滤需求。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../../api'

const words = ref([])
const newWord = ref('')
const demoText = ref('这家民宿服务太差了，简直是黑店，大家不要来。')

const filtered = computed(() => {
  let text = demoText.value
  words.value.forEach((item) => {
    if (item.word) {
      text = text.split(item.word).join('*'.repeat(item.word.length))
    }
  })
  return text
})

const load = async () => {
  const { data } = await adminApi.sensitiveWords()
  words.value = data
}

const add = async () => {
  const word = newWord.value.trim()
  if (!word) {
    ElMessage.warning('请输入敏感词')
    return
  }
  await adminApi.addSensitiveWord(word)
  ElMessage.success('已添加')
  newWord.value = ''
  load()
}

const remove = async (item) => {
  await ElMessageBox.confirm(`确认移除敏感词「${item.word}」？`, '移除确认', { type: 'warning' })
  await adminApi.deleteSensitiveWord(item.id)
  ElMessage.success('已移除')
  load()
}

onMounted(load)
</script>

<style scoped>
.hint {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
}

.add-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.words {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 60px;
}

.word {
  font-size: 14px;
}

.demo {
  max-width: 720px;
}

.result {
  margin-top: 12px;
  background: #faf6f1;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: #4a423c;
}

.label {
  color: var(--muted);
  margin-right: 8px;
}

.tip {
  margin-top: 12px;
  font-size: 12px;
  color: #a99c90;
  line-height: 1.8;
}
</style>
