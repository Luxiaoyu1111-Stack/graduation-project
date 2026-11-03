<template>
  <div class="manage-layout">
    <aside class="sidebar">
      <div class="logo">
        <span class="mark">栖</span>
        <div>
          <div class="logo-title">栖居管理后台</div>
          <div class="logo-sub">{{ store.isAdmin ? '平台管理员' : '商家工作台' }}</div>
        </div>
      </div>
      <el-menu :default-active="activeMenu" router class="menu" background-color="transparent"
               text-color="#cbbfb4" active-text-color="#fff">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <router-link to="/">返回前台</router-link>
      </div>
    </aside>

    <div class="content">
      <header class="topbar">
        <div class="crumb">{{ currentTitle }}</div>
        <div class="topbar-right">
          <el-tag v-if="store.isMerchant && merchantStatus !== null" :type="merchantStatus === 1 ? 'success' : 'warning'" effect="light" round>
            {{ merchantStatus === 1 ? '资质已认证' : merchantStatus === 0 ? '资质审核中' : '资质被驳回' }}
          </el-tag>
          <el-dropdown trigger="click" @command="onCommand">
            <span class="user-chip">
              <el-avatar :size="30">{{ store.displayName.slice(0, 1) }}</el-avatar>
              <span>{{ store.displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="front">返回前台</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="page">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { merchantApi } from '../api'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const merchantStatus = ref(null)

const merchantMenus = [
  { path: '/merchant/dashboard', label: '经营概览', icon: 'DataLine' },
  { path: '/merchant/homestays', label: '民宿管理', icon: 'House' },
  { path: '/merchant/rooms', label: '房型管理', icon: 'Bed' },
  { path: '/merchant/inventory', label: '库存日历', icon: 'Calendar' },
  { path: '/merchant/orders', label: '订单处理', icon: 'Tickets' },
  { path: '/merchant/reviews', label: '评价回复', icon: 'ChatDotSquare' }
]

const adminMenus = [
  { path: '/admin/dashboard', label: '数据看板', icon: 'DataLine' },
  { path: '/admin/users', label: '用户管理', icon: 'User' },
  { path: '/admin/merchants', label: '商家管理', icon: 'Shop' },
  { path: '/admin/homestays', label: '民宿审核', icon: 'House' },
  { path: '/admin/orders', label: '订单监管', icon: 'Tickets' },
  { path: '/admin/reviews', label: '评价监管', icon: 'ChatDotSquare' },
  { path: '/admin/announcements', label: '公告管理', icon: 'Bell' },
  { path: '/admin/settings', label: '敏感词设置', icon: 'SetUp' }
]

const menus = computed(() => (store.isAdmin ? adminMenus : merchantMenus))
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => menus.value.find((m) => m.path === route.path)?.label || '')

onMounted(async () => {
  if (store.isMerchant) {
    try {
      const { data } = await merchantApi.profile()
      merchantStatus.value = data.merchant.status
    } catch (e) {
      merchantStatus.value = null
    }
  }
})

const onCommand = (command) => {
  if (command === 'logout') {
    store.logout()
    router.push('/login')
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.manage-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f2ee;
}

.sidebar {
  width: 232px;
  background: #2b2622;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.logo {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 22px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mark {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, #c98a5e, #8a5330);
  display: grid;
  place-items: center;
  font-family: 'Songti SC', serif;
  font-size: 20px;
}

.logo-title {
  font-size: 15px;
  letter-spacing: 1px;
}

.logo-sub {
  font-size: 11px;
  color: #a99c90;
  margin-top: 4px;
}

.menu {
  border-right: none;
  padding: 10px 8px;
  flex: 1;
}

.menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 4px;
  height: 44px;
}

.menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #b9764a, #8a5330);
  color: #fff;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
}

.sidebar-footer a {
  color: #a99c90;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #ece5dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.crumb {
  font-size: 16px;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.page {
  padding: 24px 26px 40px;
}
</style>
