<template>
  <div class="page-container profile-page">
    <h1 class="page-title">个人中心</h1>
    <p class="page-desc">管理你的个人资料与账号安全</p>

    <div class="profile-grid">
      <div class="panel user-card">
        <el-avatar :size="78" :src="store.user?.avatar || ''">{{ store.displayName.slice(0, 1) }}</el-avatar>
        <h2>{{ store.displayName }}</h2>
        <el-tag :type="roleTag.type" effect="light" round>{{ roleTag.text }}</el-tag>
        <div class="user-meta">
          <div><span>账号</span><b>{{ store.user?.username }}</b></div>
          <div><span>手机号</span><b>{{ store.user?.phone || '未填写' }}</b></div>
          <div><span>邮箱</span><b>{{ store.user?.email || '未填写' }}</b></div>
          <div><span>注册时间</span><b>{{ formatDate(store.user?.createdAt) }}</b></div>
        </div>
        <el-button v-if="store.isMerchant" type="primary" plain class="to-manage" @click="$router.push('/merchant/dashboard')">
          进入商家中心
        </el-button>
        <el-button v-if="store.isAdmin" type="primary" plain class="to-manage" @click="$router.push('/admin/dashboard')">
          进入后台管理
        </el-button>
      </div>

      <div class="forms">
        <div class="panel">
          <div class="panel-title">基本资料</div>
          <el-form :model="profileForm" label-width="80px">
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item label="头像地址">
              <el-input v-model="profileForm.avatar" placeholder="可粘贴图片地址" />
            </el-form-item>
            <el-button type="primary" :loading="saving" @click="saveProfile">保存资料</el-button>
          </el-form>
        </div>

        <div class="panel">
          <div class="panel-title">修改密码</div>
          <el-form ref="pwdRef" :model="pwdForm" :rules="pwdRules" label-width="80px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-button type="primary" :loading="changing" @click="changePassword">修改密码</el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { formatDate } from '../../utils/format'

const store = useUserStore()
const saving = ref(false)
const changing = ref(false)
const pwdRef = ref()

const profileForm = reactive({ nickname: '', phone: '', email: '', avatar: '' })
const pwdForm = reactive({ oldPassword: '', newPassword: '' })

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '新密码至少6位', trigger: 'blur' }]
}

const roleTag = computed(() => {
  const map = {
    USER: { text: '民宿游客', type: 'success' },
    MERCHANT: { text: '认证商家', type: 'warning' },
    ADMIN: { text: '平台管理员', type: 'danger' }
  }
  return map[store.role] || { text: '游客', type: 'info' }
})

const load = () => {
  profileForm.nickname = store.user?.nickname || ''
  profileForm.phone = store.user?.phone || ''
  profileForm.email = store.user?.email || ''
  profileForm.avatar = store.user?.avatar || ''
}

const saveProfile = async () => {
  saving.value = true
  try {
    const { data } = await authApi.updateProfile(profileForm)
    store.setUser(data)
    ElMessage.success('资料已更新')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  await pwdRef.value.validate()
  changing.value = true
  try {
    await authApi.changePassword(pwdForm)
    ElMessage.success('密码修改成功，请重新登录')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
  } finally {
    changing.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.profile-page {
  padding: 34px 0 10px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

.user-card {
  text-align: center;
  padding: 30px 24px;
}

.user-card h2 {
  margin: 14px 0 10px;
  font-size: 20px;
}

.user-meta {
  margin: 22px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  font-size: 13px;
}

.user-meta div {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  border-bottom: 1px dashed var(--line);
  padding-bottom: 10px;
}

.user-meta b {
  color: var(--ink);
  font-weight: 500;
}

.to-manage {
  width: 100%;
}

.forms {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
