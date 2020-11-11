$('.post-preview').on('mouseenter', e => {
  const target = e.currentTarget
  target.classList.remove('shadow-sm')
  target.classList.add('shadow')
})
$('.post-preview').on('mouseleave', e => {
  const target = e.currentTarget
  target.classList.add('shadow-sm')
  target.classList.remove('shadow')
})