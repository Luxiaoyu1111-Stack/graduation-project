import http from './http'

export const authApi = {
  login: (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  me: () => http.get('/auth/me'),
  updateProfile: (data) => http.put('/auth/profile', data),
  changePassword: (data) => http.put('/auth/password', data)
}

export const homestayApi = {
  list: (params) => http.get('/homestays', { params }),
  hot: (limit = 4) => http.get('/homestays/hot', { params: { limit } }),
  detail: (id) => http.get(`/homestays/${id}`),
  cities: () => http.get('/homestays/cities'),
  reviews: (id, params) => http.get(`/homestays/${id}/reviews`, { params })
}

export const roomApi = {
  calendar: (roomId, start, end) => http.get(`/rooms/${roomId}/calendar`, { params: { start, end } })
}

export const orderApi = {
  create: (data) => http.post('/orders', data),
  my: (params) => http.get('/orders/my', { params }),
  detail: (id) => http.get(`/orders/${id}`),
  pay: (id) => http.put(`/orders/${id}/pay`),
  cancel: (id, reason) => http.put(`/orders/${id}/cancel`, null, { params: { reason } })
}

export const reviewApi = {
  create: (data) => http.post('/reviews', data),
  my: (params) => http.get('/reviews/my', { params })
}

export const favoriteApi = {
  list: () => http.get('/favorites'),
  toggle: (id) => http.post(`/favorites/${id}`)
}

export const announcementApi = {
  list: (limit = 5) => http.get('/announcements', { params: { limit } })
}

export const merchantApi = {
  profile: () => http.get('/merchant/profile'),
  dashboard: () => http.get('/merchant/dashboard'),
  homestays: (params) => http.get('/merchant/homestays', { params }),
  createHomestay: (data) => http.post('/merchant/homestays', data),
  updateHomestay: (id, data) => http.put(`/merchant/homestays/${id}`, data),
  changeHomestayStatus: (id, status) => http.put(`/merchant/homestays/${id}/status`, null, { params: { status } }),
  deleteHomestay: (id) => http.delete(`/merchant/homestays/${id}`),
  rooms: (homestayId) => http.get(`/merchant/homestays/${homestayId}/rooms`),
  createRoom: (data) => http.post('/merchant/rooms', data),
  updateRoom: (id, data) => http.put(`/merchant/rooms/${id}`, data),
  deleteRoom: (id) => http.delete(`/merchant/rooms/${id}`),
  inventory: (roomId, start, end) => http.get(`/merchant/rooms/${roomId}/inventory`, { params: { start, end } }),
  saveInventory: (data) => http.post('/merchant/inventory', data),
  initInventory: (roomId, days = 90) => http.post(`/merchant/rooms/${roomId}/inventory/init`, null, { params: { days } }),
  orders: (params) => http.get('/merchant/orders', { params }),
  confirm: (id) => http.put(`/merchant/orders/${id}/confirm`),
  checkin: (id) => http.put(`/merchant/orders/${id}/checkin`),
  finish: (id) => http.put(`/merchant/orders/${id}/finish`),
  reviews: (params) => http.get('/merchant/reviews', { params }),
  reply: (id, content) => http.put(`/merchant/reviews/${id}/reply`, { content })
}

export const adminApi = {
  dashboard: () => http.get('/admin/dashboard'),
  users: (params) => http.get('/admin/users', { params }),
  updateUserStatus: (id, status) => http.put(`/admin/users/${id}/status`, null, { params: { status } }),
  merchants: (params) => http.get('/admin/merchants', { params }),
  auditMerchant: (id, data) => http.put(`/admin/merchants/${id}/audit`, data),
  homestays: (params) => http.get('/admin/homestays', { params }),
  auditHomestay: (id, data) => http.put(`/admin/homestays/${id}/audit`, data),
  changeHomestayStatus: (id, status) => http.put(`/admin/homestays/${id}/status`, null, { params: { status } }),
  deleteHomestay: (id) => http.delete(`/admin/homestays/${id}`),
  orders: (params) => http.get('/admin/orders', { params }),
  cancelOrder: (id, reason) => http.put(`/admin/orders/${id}/cancel`, null, { params: { reason } }),
  reviews: (params) => http.get('/admin/reviews', { params }),
  changeReviewStatus: (id, status) => http.put(`/admin/reviews/${id}/status`, null, { params: { status } }),
  deleteReview: (id) => http.delete(`/admin/reviews/${id}`),
  announcements: (params) => http.get('/admin/announcements', { params }),
  createAnnouncement: (data) => http.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => http.put(`/admin/announcements/${id}`, data),
  changeAnnouncementStatus: (id, status) => http.put(`/admin/announcements/${id}/status`, null, { params: { status } }),
  deleteAnnouncement: (id) => http.delete(`/admin/announcements/${id}`),
  sensitiveWords: () => http.get('/admin/sensitive-words'),
  addSensitiveWord: (word) => http.post('/admin/sensitive-words', null, { params: { word } }),
  deleteSensitiveWord: (id) => http.delete(`/admin/sensitive-words/${id}`)
}
