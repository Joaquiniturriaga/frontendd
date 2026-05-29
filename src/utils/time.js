export const timeAgo = (dateStr) => {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const formatDuration = (createdAt) => {
  const m = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (m < 60)   return `${m} min`
  if (m < 1440) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${Math.floor(m / 1440)}d`
}