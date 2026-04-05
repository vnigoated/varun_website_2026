'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorFollower() {
  const [isVisible, setIsVisible] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 200 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12)
      cursorY.set(e.clientY - 12)
      if (!isVisible) setIsVisible(true)
    }

    const hideCursor = () => setIsVisible(false)
    const showCursor = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseleave', hideCursor)
    document.addEventListener('mouseenter', showCursor)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', hideCursor)
      document.removeEventListener('mouseenter', showCursor)
    }
  }, [cursorX, cursorY, isVisible])

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <motion.div
      className="cursor-follower hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 0.3 : 0
      }}
    />
  )
}
