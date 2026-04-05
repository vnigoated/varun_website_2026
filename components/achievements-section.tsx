'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { TextReveal } from '@/components/text-reveal'
import { CircularTestimonials } from '@/components/ui/circular-testimonials'

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

type AchievementSlide = {
  title: string
  description: string
  impact: string
  year: string
  image: string
}

const achievementSlides: Record<ChatLanguage, AchievementSlide[]> = {
  en: [
    {
      title: 'IBM Hackathon Winner',
      description:
        "First place in IBM's global AI hackathon for building an enterprise knowledge workflow that reduced search friction and response time.",
      impact:
        'Delivered a production-lean prototype that proved measurable value in enterprise information retrieval.',
      year: '2025',
      image: '/ibm_hackathon.png',
    },
    {
      title: 'Codeathon ML Winner',
      description:
        'Won the machine learning track with a real-time anomaly detection system for IoT device streams.',
      impact: 'Improved anomaly detection speed while preserving model precision in live event flows.',
      year: '2025',
      image: '/codathon.jpg',
    },
    {
      title: 'VOIS Marathon Winner',
      description:
        'Built an accessibility-focused solution that helped visually impaired users navigate digital interfaces.',
      impact: 'Improved usability and task completion confidence in assistive navigation scenarios.',
      year: '2024',
      image: '/vois_hackathon.jpeg',
    },
    {
      title: 'Document Summarizer: A Machine Learning Approach to PDF Summarization',
      description:
        'Published a research paper focused on machine learning-driven PDF summarization workflows for faster document understanding.',
      impact:
        'Demonstrated practical summarization performance and structured pipeline design for real-world document processing.',
      year: '2025',
      image: '/document_paper.png',
    },
    {
      title: 'AI Crowd System - 200K+ Users',
      description:
        'Designed and deployed an AI-enabled crowd management system for high-volume user traffic.',
      impact: 'Supported reliable scaling for over 200,000 active users with stable response behavior.',
      year: '2025',
      image: '/navratri.webp',
    },
  ],
  de: [
    {
      title: 'IBM Hackathon-Sieger',
      description:
        'Erster Platz beim globalen IBM KI-Hackathon für einen Enterprise-Wissensworkflow, der Suchaufwand und Antwortzeit reduzierte.',
      impact:
        'Lieferte einen produktionsnahen Prototypen, der messbaren Mehrwert für die Enterprise-Informationssuche zeigte.',
      year: '2025',
      image: '/ibm_hackathon.png',
    },
    {
      title: 'Codeathon ML-Sieger',
      description:
        'Gewann die Machine-Learning-Kategorie mit einem Echtzeit-Anomalieerkennungssystem für IoT-Gerätestreams.',
      impact: 'Verbesserte die Erkennungsgeschwindigkeit bei gleichbleibender Modellpräzision in Live-Event-Flows.',
      year: '2025',
      image: '/codathon.jpg',
    },
    {
      title: 'VOIS Marathon-Sieger',
      description:
        'Entwickelte eine barrierefreie Lösung, die sehbehinderten Menschen die Navigation in digitalen Oberflächen erleichtert.',
      impact:
        'Steigerte die Benutzerfreundlichkeit und das Vertrauen bei assistiven Navigationsszenarien.',
      year: '2024',
      image: '/vois_hackathon.jpeg',
    },
    {
      title: 'Dokumentzusammenfassung: Ein Machine-Learning-Ansatz zur PDF-Zusammenfassung',
      description:
        'Veröffentlichte eine Forschungsarbeit zu Machine-Learning-gestützten PDF-Zusammenfassungs-Workflows für schnelleres Dokumentenverständnis.',
      impact:
        'Zeigte praxisnahe Zusammenfassungsleistung und eine strukturierte Pipeline für reale Dokumentenverarbeitung.',
      year: '2025',
      image: '/document_paper.png',
    },
    {
      title: 'AI Crowd System - 200K+ Nutzer',
      description:
        'Entwarf und implementierte ein KI-gestütztes Crowd-Management-System für hohe Benutzerlasten.',
      impact:
        'Unterstützte zuverlässige Skalierung für über 200.000 aktive Nutzer mit stabilem Antwortverhalten.',
      year: '2025',
      image: '/navratri.webp',
    },
  ],
}

const copy: Record<ChatLanguage, {
  sectionLabel: string
  heading: string
  description: string
  highlightsLabel: string
  highlightsDescription: string
  paperButton: string
}> = {
  en: {
    sectionLabel: 'Achievements',
    heading: 'Recognition, in motion',
    description:
      'Selected wins and publications are presented as a rotating gallery so the section stays compact, readable, and easy to scan.',
    highlightsLabel: 'Selected highlights',
    highlightsDescription:
      'Click through the carousel to inspect each recognition. The research paper remains linked below for direct access.',
    paperButton: 'Open paper',
  },
  de: {
    sectionLabel: 'Auszeichnungen',
    heading: 'Anerkennung in Bewegung',
    description:
      'Ausgewählte Erfolge und Veröffentlichungen werden als rotierende Galerie dargestellt, damit der Abschnitt kompakt, lesbar und schnell erfassbar bleibt.',
    highlightsLabel: 'Ausgewählte Highlights',
    highlightsDescription:
      'Klicke dich durch das Karussell, um jede Auszeichnung anzusehen. Die Forschungsarbeit ist unten direkt verlinkt.',
    paperButton: 'Paper öffnen',
  },
}

const testimonialColors = {
  name: '#3f2f24',
  designation: '#7a6251',
  testimony: '#5a4639',
  arrowBackground: '#8b5e3c',
  arrowForeground: '#faf7f2',
  arrowHoverBackground: '#6f4b31',
}

const testimonialFontSizes = {
  name: '2rem',
  designation: '1rem',
  quote: '1.05rem',
}

const paperLink = 'https://www.atlantis-press.com/proceedings/icsiaiml-25/126021200'

export function AchievementsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [language, setLanguage] = useState<ChatLanguage>('en')

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setLanguage(savedLanguage)
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (nextLanguage === 'en' || nextLanguage === 'de') {
        setLanguage(nextLanguage)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    }
  }, [])

  const activeCopy = copy[language]

  const testimonials = useMemo(
    () =>
      achievementSlides[language].map((achievement) => ({
        quote: `${achievement.description} ${achievement.impact}`,
        name: achievement.title,
        designation: `${achievement.year} • ${language === 'en' ? 'Recognition' : 'Anerkennung'}`,
        src: achievement.image,
      })),
    [language],
  )

  return (
    <section
      ref={ref}
      id="achievements"
      className="relative overflow-hidden bg-gradient-to-br from-[#f8f4ee] via-[#f5efe5] to-[#efe4d6] py-28 scroll-mt-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(176,122,73,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(176,122,73,0.07)_1px,transparent_1px)] bg-[size:64px_64px] opacity-25" />
        <div className="absolute left-0 top-20 h-60 w-60 rounded-full bg-[#d7bb9d]/35 blur-3xl" />
        <div className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-[#cfad89]/25 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInUp} className="mb-12 text-center">
            <TextReveal
              as="span"
              className="inline-block text-sm uppercase tracking-[0.3em] text-[#8c5f3a] font-medium"
              delay={0.05}
              stagger={0.04}
            >
              {activeCopy.sectionLabel}
            </TextReveal>
            <TextReveal
              as="h2"
              className="mt-4 font-serif text-4xl md:text-5xl font-semibold text-[#3f2f24]"
              delay={0.08}
              stagger={0.06}
            >
              {activeCopy.heading}
            </TextReveal>
            <TextReveal
              as="p"
              className="mt-4 max-w-2xl mx-auto text-[#705c4b]"
              delay={0.12}
              stagger={0.025}
            >
              {activeCopy.description}
            </TextReveal>
          </motion.div>

          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#dcc8b2] bg-white/50 p-4 shadow-2xl shadow-[#8c5f3a]/10 backdrop-blur-sm md:p-6">
            <div className="rounded-[2rem] border border-[#ead9c7] bg-[#fbf7f1]/85 p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7d8c7] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8a6040] font-medium">{activeCopy.highlightsLabel}</p>
                  <p className="mt-2 max-w-2xl text-sm md:text-base text-[#6f5848]">
                    {activeCopy.highlightsDescription}
                  </p>
                </div>

                <a
                  href={paperLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#caa886] bg-white/80 px-4 py-2 text-sm font-semibold text-[#6e4b31] transition-colors hover:bg-[#f4e5d5]"
                >
                  {activeCopy.paperButton}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-4 flex justify-center">
                <CircularTestimonials
                  testimonials={testimonials}
                  autoplay={true}
                  colors={testimonialColors}
                  fontSizes={testimonialFontSizes}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}