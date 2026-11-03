export const formatDate = (value, withTime = false) => {
  if (!value) return ''
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  if (!withTime) return `${y}-${m}-${d}`
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

export const orderStatusMap = {
  0: { text: '待支付', type: 'warning' },
  1: { text: '待确认', type: 'primary' },
  2: { text: '待入住', type: 'success' },
  3: { text: '已入住', type: 'info' },
  4: { text: '已完成', type: 'info' },
  5: { text: '已取消', type: 'danger' }
}

export const orderStatusText = (status) => orderStatusMap[status]?.text || '未知'

export const orderStatusType = (status) => orderStatusMap[status]?.type || 'info'

export const toDateString = (date) => {
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 10)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export const nightsBetween = (start, end) => {
  if (!start || !end) return 0
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 86400000))
}
