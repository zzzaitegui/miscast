const COLOR_STOPS = [
  { r: 0,   rgb: [176, 0,   32]  },
  { r: 2.5, rgb: [220, 80,  0]   },
  { r: 5,   rgb: [255, 185, 0]   },
  { r: 7.5, rgb: [30,  185, 92]  },
  { r: 10,  rgb: [28,  104, 204] },
]

export function getVoteCountColor(count) {
  if (count == null) return 'rgb(80, 80, 80)'
  const score = Math.max(0, Math.min(10,
    (Math.log10(Math.max(count, 1000)) - 3) / (Math.log10(30000) - 3) * 10
  ))
  return getRatingColor(score)
}

export function getRatingColor(rating) {
  if (rating == null) return 'rgb(80, 80, 80)'
  const v = Math.max(0, Math.min(10, rating))
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i], hi = COLOR_STOPS[i + 1]
    if (v <= hi.r) {
      const t = (v - lo.r) / (hi.r - lo.r)
      const r = Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * t)
      const g = Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * t)
      const b = Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * t)
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  return `rgb(${COLOR_STOPS.at(-1).rgb.join(',')})`
}
