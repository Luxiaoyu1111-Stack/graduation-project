<template>
  <div class="stat-card">
    <div class="icon" :style="{ background: color + '1a', color }">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
    <div class="content">
      <div class="label">{{ label }}</div>
      <div class="value">
        <span v-if="prefix" class="prefix">{{ prefix }}</span>{{ value }}
        <small v-if="suffix">{{ suffix }}</small>
      </div>
      <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: { type: String, default: 'DataLine' },
  color: { type: String, default: '#b9764a' },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  hint: { type: String, default: '' }
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border: 1px solid #ece5dd;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
}

.label {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 6px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.value small {
  font-size: 12px;
  font-weight: 400;
  color: var(--muted);
  margin-left: 4px;
}

.prefix {
  font-size: 15px;
  margin-right: 2px;
}

.hint {
  margin-top: 4px;
  font-size: 11px;
  color: #b3a79c;
}
</style>
