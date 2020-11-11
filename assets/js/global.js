$('.btn-route').on('click', e => {
  if (!e || !e.currentTarget) return
  e.preventDefault()
  e.stopPropagation()
  const target = e.currentTarget
  const path = target.getAttribute('path')
  location.href = path
})
