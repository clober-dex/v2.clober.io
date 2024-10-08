import { UTCTimestamp } from 'lightweight-charts'
import { useCallback } from 'react'

export function getBrowserLocales(options = {}) {
  const defaultOptions = {
    languageCodeOnly: false,
  }
  const opt = {
    ...defaultOptions,
    ...options,
  }
  const browserLocales =
    navigator.languages === undefined
      ? [navigator.language]
      : navigator.languages
  if (!browserLocales) {
    return undefined
  }
  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim()
    return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale
  })
}

export function useHeaderDateFormatter() {
  const locale = getBrowserLocales()
  return useCallback(
    (time?: UTCTimestamp) => {
      if (!time || !locale) {
        return '-'
      }
      const headerTimeFormatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }
      return new Date(time * 1000).toLocaleString(
        locale,
        headerTimeFormatOptions,
      )
    },
    [locale],
  )
}
