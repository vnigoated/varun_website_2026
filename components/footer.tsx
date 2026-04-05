'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'

export function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            <TextReveal as="span" className="inline-block" delay={0.05} stagger={0.03}>
              © {new Date().getFullYear()} Varun Inamdar. All rights reserved.
            </TextReveal>
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm text-muted-foreground flex items-center gap-1"
          >
            <TextReveal as="span" className="inline-block" delay={0.05} stagger={0.03}>
              Made with
            </TextReveal>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <TextReveal as="span" className="inline-block" delay={0.12} stagger={0.03}>
              and lots of coffee
            </TextReveal>
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
