<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand">
        <span class="mark">栖</span>
        <span class="serif">栖居</span>
      </div>
      <div class="slogan">
        <h1 class="serif">每一段旅程，<br />都值得一处好住处</h1>
        <p>真实评价、实时房态、安心预订<br />让民宿预订像回家一样简单</p>
      </div>
      <div class="stats">
        <div><strong>12</strong><span>精选民宿</span></div>
        <div><strong>4.7</strong><span>平均评分</span></div>
        <div><strong>11</strong><span>城市覆盖</span></div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-wrap">
        <h2>欢迎回来</h2>
        <p class="sub">登录后即可预订民宿、管理订单与评价</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password
                      @keyup.enter="submit">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="submit">登 录</el-button>
        </el-form>

        <div class="demo">
          <div class="demo-title">演示账号（密码均为 123456）</div>
          <div class="demo-btns">
            <el-button size="small" @click="fill('user1')">游客 user1</el-button>
            <el-button size="small" @click="fill('merchant1')">商家 merchant1</el-button>
            <el-button size="small" @click="fill('admin')">管理员 admin</el-button>
          </div>
        </div>

        <div class="foot">
          还没有账号？<router-link to="/register">立即注册</router-link>
          <span class="sep">|</span>
          <router-link to="/">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const store = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const fill = (username) => {
  form.username = username
  form.password = '123456'
}

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    const { data } = await authApi.login(form)
    store.setLogin(data)
    ElMessage.success(`欢迎回来，${data.user.nickname}`)
    if (route.query.redirect) {
      router.push(route.query.redirect)
    } else if (data.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (data.user.role === 'MERCHANT') {
      router.push('/merchant/dashboard')
    } else {
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
}

.auth-left {
  background: url('/images/login.jpg') center/cover no-repeat, #3a2f27;
  position: relative;
  color: #fff;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.auth-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(30, 23, 18, 0.75), rgba(30, 23, 18, 0.35));
}

.auth-left > * {
  position: relative;
  z-index: 2;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  letter-spacing: 4px;
}

.mark {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: grid;
  place-items: center;
  font-size: 22px;
}

.slogan h1 {
  font-size: 42px;
  line-height: 1.35;
  font-weight: 500;
  margin: 0 0 20px;
}

.slogan p {
  color: #ded0c2;
  font-size: 14px;
  line-height: 1.9;
}

.stats {
  display: flex;
  gap: 48px;
}

.stats div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats strong {
  font-size: 28px;
  font-weight: 500;
}

.stats span {
  font-size: 12px;
  color: #c9b8a8;
}

.auth-right {
  display: grid;
  place-items: center;
  background: #fdfbf8;
  padding: 40px;
}

.form-wrap {
  width: min(400px, 100%);
}

.form-wrap h2 {
  font-size: 28px;
  margin: 0 0 8px;
}

.sub {
  color: var(--muted);
  font-size: 13px;
  margin: 0 0 28px;
}

.submit {
  width: 100%;
  height: 46px;
  margin-top: 8px;
  letter-spacing: 6px;
}

.demo {
  margin-top: 26px;
  background: #f6f1ea;
  border: 1px dashed #e2d3c4;
  border-radius: 10px;
  padding: 14px 16px;
}

.demo-title {
  font-size: 12px;
  color: #8c7a6b;
  margin-bottom: 10px;
}

.demo-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.foot {
  margin-top: 26px;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.foot a {
  color: var(--brand);
}

.sep {
  margin: 0 10px;
  color: #d8ccc1;
}

@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }
}
</style>
