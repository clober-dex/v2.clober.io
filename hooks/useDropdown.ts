import React, { useRef, useEffect, useState } from 'react'

export default function useDropdown() {
  const [showDropdown, setShowDropdown] = useState(false)
  const clickBuffer = useRef(false)
  const clickBufferTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (clickBuffer.current) {
        return
      }
      setShowDropdown(false)
      event.stopPropagation()
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown, setShowDropdown])

  return {
    showDropdown,
    setShowDropdown: (_: React.SetStateAction<boolean>) => {
      if (clickBufferTimeout.current) {
        clearTimeout(clickBufferTimeout.current)
      }
      clickBuffer.current = true
      // @ts-ignore
      clickBufferTimeout.current = setTimeout(() => {
        clickBuffer.current = false
      }, 100)
      setShowDropdown(_)
    },
  }
}
