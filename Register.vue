<template>
  <div class="register-page">
    <div class="panel-left">
      <router-link to="/" class="brand"><span class="mark">栖</span> 栖居</router-link>
      <h1 class="serif">加入栖居</h1>
      <p class="desc">游客注册后即可预订与评价；民宿房东注册后提交资质，审核通过即可上架房源。</p>
      <ul>
        <li><el-icon><Select /></el-icon> 真实评价体系，口碑看得见</li>
        <li><el-icon><Calendar /></el-icon> 按天管理房价与库存</li>
        <li><el-icon><DataLine /></el-icon> 经营数据可视化统计</li>
      </ul>
      <img src="/images/register.jpg" alt="" @error="hideImage" />
    </div>

    <div class="panel-right">
      <div class="form-wrap">
        <h2>创建账号</h2>
        <p class="sub">已有账号？<router-link to="/login">直接登录</router-link></p>

        <el-radio-group v-model="form.role" class="role-group">
          <el-radio-button label="USER">我是游客</el-radio-button>
          <el-radio-button label="MERCHANT">我是民宿房东</el-radio-button>
        </el-radio-group>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="4-20 位字母、数字或下划线" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="展示在评价与个人中心" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="用于接收订单通知" />
          </el-form-item>
          <template v-if="form.role === 'MERCHANT'">
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="form.shopName" placeholder="例如：丽江云栖民宿" />
            </el-form-item>
            <el-form-item label="营业执照编号" prop="licenseNo">
              <el-input v-model="form.licenseNo" placeholder="选填，审核时可补充" />
            </el-form-item>
          </template>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="6-20 位" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model="form.confirm" type="password" show-password placeholder="再次输入密码" />
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="submit">注 册</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({
  role: 'USER',
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirm: '',
  shopName: '',
  licenseNo: ''
})

const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '账号为4-20位字母、数字或下划线', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirm: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
}

const hideImage = (e) => {
  e.target.style.display = 'none'
}

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await authApi.register({
      role: form.role,
      username: form.username,
      nickname: form.nickname,
      phone: form.phone,
      password: form.password,
      shopName: form.role === 'MERCHANT' ? form.shopName : undefined,
      licenseNo: form.role === 'MERCHANT' ? form.licenseNo : undefined
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.panel-left {
  background: linear-gradient(160deg, #3a3029, #241e1a);
  color: #f3e9df;
  padding: 46px 56px;
  position: relative;
  overflow: hidden;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  letter-spacing: 4px;
}

.mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #c98a5e, #8a5330);
  display: grid;
  place-items: center;
}

.panel-left h1 {
  font-size: 40px;
  margin: 70px 0 16px;
  letter-spacing: 3px;
  font-weight: 500;
}

.desc {
  color: #c9b8a8;
  line-height: 1.9;
  font-size: 14px;
  max-width: 380px;
}

.panel-left ul {
  list-style: none;
  padding: 0;
  margin-top: 34px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #d8c9ba;
  font-size: 14px;
}

.panel-left li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-left img {
  position: absolute;
  right: -40px;
  bottom: -30px;
  width: 60%;
  border-radius: 16px;
  opacity: 0.85;
}

.panel-right {
  display: grid;
  place-items: center;
  background: #fdfbf8;
  padding: 40px;
  overflow-y: auto;
}

.form-wrap {
  width: min(420px, 100%);
}

.form-wrap h2 {
  font-size: 28px;
  margin: 0 0 8px;
}

.sub {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 22px;
}

.role-group {
  margin-bottom: 18px;
}

.submit {
  width: 100%;
  height: 46px;
  letter-spacing: 6px;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .register-page {
    grid-template-columns: 1fr;
  }

  .panel-left {
    display: none;
  }
}
</style>
