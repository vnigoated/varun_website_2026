'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { TextReveal } from '@/components/text-reveal'
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

const content: Record<
  ChatLanguage,
  {
    sectionLabel: string
    heading: string
    description: string
  }
> = {
  en: {
    sectionLabel: 'Skills',
    heading: 'Skill Signals',
    description:
      'A staggered, card-first interaction that reflects how I deliver engineering outcomes across AI, product, and security.',
  },
  de: {
    sectionLabel: 'Fähigkeiten',
    heading: 'Skill-Signale',
    description:
      'Eine gestaffelte, kartenbasierte Interaktion, die zeigt, wie ich Engineering-Ergebnisse über KI, Produkt und Security liefere.',
  },
}

export function SkillsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [skillsLanguage, setSkillsLanguage] = useState<ChatLanguage>('en')

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setSkillsLanguage(savedLanguage)
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (nextLanguage === 'en' || nextLanguage === 'de') {
        setSkillsLanguage(nextLanguage)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    }
  }, [])

  const copy = content[skillsLanguage]

  return (
    <section ref={ref} id="skills" className="relative overflow-hidden bg-[#f6f2ec] py-28 scroll-mt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(152,107,71,0.1),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(220,201,182,0.38),transparent_38%)]" />
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <motion.div variants={fadeInUp} className="mx-auto mb-14 max-w-3xl text-center">
            <TextReveal
              as="span"
              className="inline-block text-sm font-medium uppercase tracking-[0.28em] text-primary"
              delay={0.05}
              stagger={0.04}
            >
              {copy.sectionLabel}
            </TextReveal>
            <TextReveal
              as="h2"
              className="mt-4 text-4xl font-bold text-foreground md:text-5xl"
              delay={0.08}
              stagger={0.06}
            >
              {copy.heading}
            </TextReveal>
            <TextReveal
              as="p"
              className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              delay={0.12}
              stagger={0.025}
            >
              {copy.description}
            </TextReveal>
          </motion.div>

          <div className="rounded-[2rem] border border-[#dbcbb9] bg-white/75 p-4 shadow-sm backdrop-blur-sm md:p-6 lg:p-8">
            <StaggerTestimonials />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
