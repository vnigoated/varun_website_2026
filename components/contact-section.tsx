'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Mail, MapPin, Phone, Github, Linkedin, Twitter, CalendarDays, ArrowUpRight } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'
import { Reveal } from '@/components/reveal'

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/vnigoated' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/varun-inamdar03/' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
]

const contactCopy: Record<
  ChatLanguage,
  {
    sectionLabel: string
    heading: string
    subheading: string
    getInTouch: string
    intro: string
    emailLabel: string
    phoneLabel: string
    locationLabel: string
    locationValue: string
    bookingTitle: string
    bookingDescription: string
    bookingButton: string
    bookingHideButton: string
    bookingEnvMessage: string
  }
> = {
  en: {
    sectionLabel: 'Contact',
    heading: "Let's Work Together",
    subheading: "Have a project in mind? Let's connect directly and schedule a focused conversation.",
    getInTouch: 'Get in Touch',
    intro:
      "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    locationLabel: 'Location',
    locationValue: 'India',
    bookingTitle: 'Book a Meeting',
    bookingDescription: 'Pick a time on my Cal.com schedule for a quick intro call.',
    bookingButton: 'Book a Meeting',
    bookingHideButton: 'Hide Booking',
    bookingEnvMessage: 'Add NEXT_PUBLIC_CAL_BOOKING_URL in your environment to enable booking.',
  },
  de: {
    sectionLabel: 'Kontakt',
    heading: 'Lass uns zusammenarbeiten',
    subheading:
      'Hast du ein Projekt im Kopf? Lass uns direkt verbinden und ein fokussiertes Gespraech planen.',
    getInTouch: 'Kontakt aufnehmen',
    intro:
      'Ich bin immer offen fuer neue Projekte, kreative Ideen oder Moeglichkeiten, Teil deiner Vision zu sein.',
    emailLabel: 'E-Mail',
    phoneLabel: 'Telefon',
    locationLabel: 'Standort',
    locationValue: 'Indien',
    bookingTitle: 'Meeting buchen',
    bookingDescription: 'Waehle einen Termin in meinem Cal.com-Kalender fuer ein kurzes Erstgespraech.',
    bookingButton: 'Meeting buchen',
    bookingHideButton: 'Buchung ausblenden',
    bookingEnvMessage:
      'Fuege NEXT_PUBLIC_CAL_BOOKING_URL in deiner Umgebung hinzu, um die Buchung zu aktivieren.',
  },
}

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [contactLanguage, setContactLanguage] = useState<ChatLanguage>('en')
  const calBookingUrl = process.env.NEXT_PUBLIC_CAL_BOOKING_URL
  const calEmbedUrl = calBookingUrl
    ? `${calBookingUrl}${calBookingUrl.includes('?') ? '&' : '?'}embed=true&theme=light`
    : ''
  const copy = contactCopy[contactLanguage]

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setContactLanguage(savedLanguage)
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (nextLanguage === 'en' || nextLanguage === 'de') {
        setContactLanguage(nextLanguage)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    }
  }, [])

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden bg-secondary/30 py-32 scroll-mt-28"
    >
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <TextReveal as="span" className="inline-block text-sm font-medium uppercase tracking-widest text-primary" delay={0.05} stagger={0.04}>
              {copy.sectionLabel}
            </TextReveal>
            <TextReveal as="h2" className="mt-4 text-4xl font-bold text-foreground md:text-5xl" delay={0.08} stagger={0.06}>
              {copy.heading}
            </TextReveal>
            <TextReveal as="p" className="mx-auto mt-4 max-w-xl text-muted-foreground" delay={0.12} stagger={0.025}>
              {copy.subheading}
            </TextReveal>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="space-y-6">
                <TextReveal as="h3" className="inline-block text-2xl font-bold text-foreground" delay={0.05} stagger={0.05}>
                  {copy.getInTouch}
                </TextReveal>
                <TextReveal as="p" className="leading-relaxed text-muted-foreground" delay={0.08} stagger={0.025}>
                  {copy.intro}
                </TextReveal>
              </div>

              <div className="space-y-4">
                <Reveal delay={0.05}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{copy.emailLabel}</p>
                      <p className="font-medium text-foreground">vninamdar03@gmail.com</p>
                    </div>
                  </motion.div>
                </Reveal>

                <Reveal delay={0.1}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{copy.phoneLabel}</p>
                      <p className="font-medium text-foreground">+91 75172 77551</p>
                    </div>
                  </motion.div>
                </Reveal>

                <Reveal delay={0.15}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{copy.locationLabel}</p>
                      <p className="font-medium text-foreground">{copy.locationValue}</p>
                    </div>
                  </motion.div>
                </Reveal>
              </div>

              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl border border-border bg-card p-3 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <Reveal delay={0.1}>
              <motion.div variants={fadeInUp}>
                <div className="glass rounded-3xl border border-border/50 p-8 shadow-xl">
                  <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{copy.bookingTitle}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {copy.bookingDescription}
                        </p>
                      </div>
                      <div className="rounded-xl bg-primary/12 p-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {calBookingUrl ? (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsBookingOpen((prev) => !prev)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25"
                        >
                          {isBookingOpen ? copy.bookingHideButton : copy.bookingButton}
                          <ArrowUpRight className="h-4 w-4" />
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {isBookingOpen ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: '70vh', marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.28, ease: 'easeInOut' }}
                              className="overflow-hidden rounded-2xl border border-[#d8c7b4] bg-[#f1e7db] p-3"
                            >
                              <iframe
                                src={calEmbedUrl}
                                title="Book a meeting"
                                className="h-full w-full rounded-xl border border-[#d8c7b4] bg-white"
                                loading="lazy"
                              />
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : (
                      <p className="mt-3 rounded-xl border border-dashed border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                        {copy.bookingEnvMessage}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
