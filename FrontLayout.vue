<template>
  <div class="front-layout">
    <header class="header">
      <div class="page-container header-inner">
        <router-link to="/" class="brand">
          <span class="brand-mark">栖</span>
          <span class="brand-text">
            <strong>栖居</strong>
            <small>民宿预订与评价平台</small>
          </span>
        </router-link>
        <nav class="nav">
          <router-link to="/" exact-active-class="active">首页</router-link>
          <router-link to="/homestays" active-class="active">找民宿</router-link>
          <router-link v-if="store.isUser" to="/orders" active-class="active">我的订单</router-link>
          <router-link v-if="store.isUser" to="/reviews" active-class="active">我的评价</router-link>
          <router-link v-if="store.isUser" to="/favorites" active-class="active">我的收藏</router-link>
        </nav>
        <div class="actions">
          <template v-if="store.isLogin">
            <el-dropdown trigger="click" @command="onCommand">
              <span class="user-chip">
                <el-avatar :size="30" :src="store.user?.avatar || ''">{{ store.displayName.slice(0, 1) }}</el-avatar>
                <span>{{ store.displayName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="store.isMerchant" command="merchant">商家中心</el-dropdown-item>
                  <el-dropdown-item v-if="store.isAdmin" command="admin">后台管理</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button text @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" round @click="$router.push('/register')">免费注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <div class="page-container footer-inner">
        <div>
          <div class="footer-brand">栖居 · 民宿预订与评价平台</div>
          <div class="footer-desc">发现旅途中的另一个家 · 南昌理工学院 2026 届毕业设计</div>
        </div>
        <div class="footer-meta">
          <span>SpringBoot + Vue3 + MySQL</span>
          <span>客服热线 400-800-2026</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()

const onCommand = (command) => {
  if (command === 'logout') {
    store.logout()
    router.push('/')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'merchant') {
    router.push('/merchant/dashboard')
  } else if (command === 'admin') {
    router.push('/admin/dashboard')
  }
}
</script>

<style scoped>
.front-layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 253, 250, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #c98a5e, #8a5330);
  color: #fff;
  font-family: 'Songti SC', serif;
  font-size: 22px;
  display: grid;
  place-items: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text strong {
  font-size: 20px;
  letter-spacing: 4px;
}

.brand-text small {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 1px;
}

.nav {
  flex: 1;
  display: flex;
  gap: 26px;
  font-size: 15px;
}

.nav a {
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  color: #5c534c;
}

.nav a.active,
.nav a:hover {
  color: var(--brand-dark);
  border-bottom-color: var(--brand);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #5c534c;
}

.main {
  flex: 1;
}

.footer {
  background: #2f2a26;
  color: #e9e0d7;
  margin-top: 40px;
}

.footer-inner {
  padding: 34px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-brand {
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.footer-desc,
.footer-meta {
  color: #a99c90;
  font-size: 12px;
}

.footer-meta {
  display: flex;
  gap: 22px;
}
</style>
