'use client'

import { Children, isValidElement, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

type TextRevealProps = {
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
  delay?: number
  stagger?: number
}

export function TextReveal({
  children,
  as: Component = 'span',
  className,
  delay = 0,
  stagger = 0.03,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const flatText = Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      if (isValidElement(child) && typeof child.props?.children === 'string') {
        return child.props.children
      }

      return ''
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  const tokens = flatText.split(/(\s+)/)

  return (
    <Component ref={ref} className={className}>
      <span className="sr-only">{flatText}</span>
      <span aria-hidden className="whitespace-pre-wrap">
        {tokens.map((token, index) => {
          if (/^\s+$/.test(token)) {
            return token
          }

          return (
            <motion.span
              key={`${token}-${index}`}
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 12, filter: 'blur(8px)' }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: delay + index * stagger,
              }}
              className="inline-block"
            >
              {token}
            </motion.span>
          )
        })}
      </span>
    </Component>
  )
}
