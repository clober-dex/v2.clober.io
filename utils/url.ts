export const getQueryParams = () => {
  const url = new URL(window.location.href)
  const params: { [key: string]: string } = {}
  url.searchParams.forEach((val, key) => {
    params[key] = val
  })
  return params
}

export const sliceUrl = (url: string, maxLength: number) => {
  if (url.length <= maxLength) {
    return url
  }
  return `${url.slice(0, maxLength)}...`
}
