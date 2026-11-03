import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('homestay_token') || '',
    user: JSON.parse(localStorage.getItem('homestay_user') || 'null')
  }),
  getters: {
    isLogin: (state) => !!state.token,
    role: (state) => state.user?.role || '',
    isUser: (state) => state.user?.role === 'USER',
    isMerchant: (state) => state.user?.role === 'MERCHANT',
    isAdmin: (state) => state.user?.role === 'ADMIN',
    displayName: (state) => state.user?.nickname || state.user?.username || '游客'
  },
  actions: {
    setLogin(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('homestay_token', data.token)
      localStorage.setItem('homestay_user', JSON.stringify(data.user))
    },
    setUser(user) {
      this.user = user
      localStorage.setItem('homestay_user', JSON.stringify(user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('homestay_token')
      localStorage.removeItem('homestay_user')
    }
  }
})
