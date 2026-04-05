'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { ExternalLink, Github, Brain, Leaf, Car, ShieldCheck, Zap, Code2 } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

const projects = [
  {
    title: 'GradeU',
    description: 'An AI-powered educational platform that personalizes learning experiences using advanced LLM technology. Features intelligent tutoring, adaptive assessments, and real-time feedback systems.',
    tags: ['Next.js', 'OpenAI', 'PostgreSQL', 'LangChain'],
    icon: Brain,
    featured: true,
    videoUrl: 'https://ik.imagekit.io/ig88d0ddi/Finalvideo.mp4',
    liveUrl: 'https://www.gradeu.in/',
    githubUrl: 'https://github.com/vnigoated/GradeU'
  },
  {
    title: 'Diet Plan RAG Agent',
    description: 'An autonomous AI agent that creates personalized nutrition plans using Retrieval-Augmented Generation. Integrates medical research and user health data for optimal recommendations.',
    tags: ['IBM Granite', 'RAG', 'LangChain', 'Streamlit'],
    icon: Leaf,
    featured: false,
    videoUrl: 'https://ik.imagekit.io/broggzhnf/InShot_20251029_022226940.mp4?updatedAt=1762349006752',
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    title: 'Skoda AI Energy System',
    description: 'Predictive energy management system for electric vehicles using machine learning. Optimizes battery usage and charging schedules based on driving patterns and environmental data.',
    tags: ['TensorFlow', 'IoT', 'AWS', 'Real-time'],
    icon: Car,
    featured: false,
    imageUrl: '/skoda-logo.jpg',
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    title: 'CallComply',
    description: 'CallComply is a multilingual AI-powered platform that analyzes customer call recordings and automatically generates compliance insights.',
    tags: ['NLP', 'FastAPI', 'STT', 'Vector DB'],
    icon: ShieldCheck,
    featured: true,
    videoUrl: 'https://ik.imagekit.io/ig88d0ddi/video_demo.mp4',
    liveUrl: 'https://callcomply.movinglines.co.in/',
    githubUrl: 'https://github.com/vnigoated/call_comply'
  },
  {
    title: 'Cyber Defenders',
    description: 'Developed an interactive cybersecurity simulation platform that trains users to detect phishing and social engineering attacks through real-world scenarios, incorporating decision-based learning and performance scoring.',
    tags: ['3JS', 'TypeScript', 'Cybersecurity'],
    icon: Zap,
    featured: true,
    imageUrl: '/cyber-defenders.png',
    liveUrl: 'https://cybergame.sparkstudio.co.in/',
    githubUrl: 'https://github.com/vnigoated/cyber_game'
  },
  {
    title: 'CoEdit',
    description: 'A real-time collaborative editing platform for code and text with LLM-powered suggestions, summarization, Q&A, and error detection.',
    tags: ['Yjs', 'Websockets', 'Tiptap', 'AWS EC2', 'LLM'],
    icon: Code2,
    featured: true,
    videoUrl: 'https://ik.imagekit.io/ig88d0ddi/Main.mp4?updatedAt=1775384468979',
    videoAutoplay: true,
    liveUrl: 'https://coedit.sparkstudio.co.in/',
    githubUrl: 'https://github.com/vnigoated/coedit'
  }
]

const projectCopyI18n: Record<
  ChatLanguage,
  Record<string, { description: string; previewAlt: (title: string) => string }>
> = {
  en: {
    GradeU: {
      description:
        'An AI-powered educational platform that personalizes learning experiences using advanced LLM technology. Features intelligent tutoring, adaptive assessments, and real-time feedback systems.',
      previewAlt: (title) => `${title} preview`,
    },
    'Diet Plan RAG Agent': {
      description:
        'An autonomous AI agent that creates personalized nutrition plans using Retrieval-Augmented Generation. Integrates medical research and user health data for optimal recommendations.',
      previewAlt: (title) => `${title} preview`,
    },
    'Skoda AI Energy System': {
      description:
        'Predictive energy management system for electric vehicles using machine learning. Optimizes battery usage and charging schedules based on driving patterns and environmental data.',
      previewAlt: (title) => `${title} preview`,
    },
    CallComply: {
      description:
        'CallComply is a multilingual AI-powered platform that analyzes customer call recordings and automatically generates compliance insights.',
      previewAlt: (title) => `${title} preview`,
    },
    'Cyber Defenders': {
      description:
        'Developed an interactive cybersecurity simulation platform that trains users to detect phishing and social engineering attacks through real-world scenarios, incorporating decision-based learning and performance scoring.',
      previewAlt: (title) => `${title} preview`,
    },
    CoEdit: {
      description:
        'A real-time collaborative editing platform for code and text with LLM-powered suggestions, summarization, Q&A, and error detection.',
      previewAlt: (title) => `${title} preview`,
    },
  },
  de: {
    GradeU: {
      description:
        'Eine KI-gestützte Bildungsplattform, die Lernerfahrungen mit fortschrittlicher LLM-Technologie personalisiert. Mit intelligentem Tutoring, adaptiven Prüfungen und Echtzeit-Feedback-Systemen.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
    'Diet Plan RAG Agent': {
      description:
        'Ein autonomer KI-Agent, der personalisierte Ernährungspläne mit Retrieval-Augmented Generation erstellt. Er verbindet medizinische Forschung und Nutzerdaten für optimale Empfehlungen.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
    'Skoda AI Energy System': {
      description:
        'Ein prädiktives Energiemanagementsystem für Elektrofahrzeuge mit Machine Learning. Es optimiert Batterienutzung und Ladepläne anhand von Fahrmustern und Umweltdaten.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
    CallComply: {
      description:
        'CallComply ist eine mehrsprachige, KI-gestützte Plattform, die Kundenanrufaufnahmen analysiert und automatisch Compliance-Einblicke erzeugt.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
    'Cyber Defenders': {
      description:
        'Eine interaktive Cybersecurity-Simulationsplattform, die Nutzer durch praxisnahe Szenarien darin schult, Phishing- und Social-Engineering-Angriffe zu erkennen, ergänzt durch entscheidungsbasiertes Lernen und Performance-Bewertung.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
    CoEdit: {
      description:
        'Eine Echtzeit-Kollaborationsplattform für Code und Text mit KI-gestützten Vorschlägen, Zusammenfassungen, Q&A und Fehlererkennung.',
      previewAlt: (title) => `Vorschau von ${title}`,
    },
  },
}

const projectsI18n: Record<
  ChatLanguage,
  {
    heading: string
    description: string
    liveDemo: string
    building: string
    githubAria: (title: string) => string
    liveAria: (title: string) => string
  }
> = {
  en: {
    heading: 'My Work',
    description:
      'A selection of projects that showcase my expertise in AI, full-stack development, and innovative problem-solving.',
    liveDemo: 'Live Demo',
    building: 'Building',
    githubAria: (title) => `View ${title} on GitHub`,
    liveAria: (title) => `View ${title} live`,
  },
  de: {
    heading: 'My Work',
    description:
      'Eine Auswahl an Projekten, die meine Erfahrung in KI, Full-Stack-Entwicklung und kreativem Problemlösen zeigen.',
    liveDemo: 'Live-Demo',
    building: 'In Arbeit',
    githubAria: (title) => `${title} auf GitHub ansehen`,
    liveAria: (title) => `${title} live ansehen`,
  },
}

export function ProjectsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [projectLanguage, setProjectLanguage] = useState<ChatLanguage>('en')
  const scrollingProjects = [...projects, ...projects]
  const projectText = projectsI18n[projectLanguage]

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setProjectLanguage(savedLanguage)
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (nextLanguage === 'en' || nextLanguage === 'de') {
        setProjectLanguage(nextLanguage)
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
      id="projects"
      className="py-32 relative overflow-hidden scroll-mt-28"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              {projectText.heading}
            </TextReveal>
            <TextReveal as="p" className="text-muted-foreground mt-4 max-w-xl mx-auto" delay={0.12} stagger={0.025}>
              {projectText.description}
            </TextReveal>
          </motion.div>

          {/* Projects auto-scroll row */}
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <motion.div
              className="flex items-stretch gap-6 w-max"
              animate={isInView ? { x: ['0%', '-50%'] } : undefined}
              transition={{
                duration: 34,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              {scrollingProjects.map((project, index) => {
                const copy = projectCopyI18n[projectLanguage][project.title] ?? projectCopyI18n.en[project.title]

                return (
                  <motion.div
                    key={`${project.title}-${index}`}
                    whileHover={{ y: -8 }}
                    className="group relative p-8 bg-card rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col w-[390px] min-h-[350px]"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6"
                      >
                        <project.icon className="w-7 h-7 text-primary" />
                      </motion.div>

                      {/* Project media preview */}
                      {project.videoUrl ? (
                        <div className="mb-5 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40">
                          <video
                            src={project.videoUrl}
                            autoPlay={project.videoAutoplay}
                            muted
                            playsInline
                            controls
                            preload="metadata"
                            className="w-full h-44 object-cover"
                          />
                        </div>
                      ) : project.imageUrl ? (
                        <div className="mb-5 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40">
                          <img
                            src={project.imageUrl}
                            alt={copy.previewAlt(project.title)}
                            className="w-full h-44 object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                        {copy.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-4">
                        {project.title === 'Skoda AI Energy System' ? (
                          <span className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-100 text-amber-900 rounded-full text-sm font-medium border border-amber-200">
                            {projectText.building}
                          </span>
                        ) : (
                          <>
                            {project.featured && project.liveUrl && (
                              <motion.a
                                href={project.liveUrl}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg shadow-primary/25"
                              >
                                {projectText.liveDemo}
                                <ExternalLink className="w-4 h-4" />
                              </motion.a>
                            )}
                            <motion.a
                              href={project.githubUrl}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2.5 bg-secondary rounded-full text-secondary-foreground hover:bg-secondary/80 transition-colors"
                              aria-label={projectText.githubAria(project.title)}
                            >
                              <Github className="w-5 h-5" />
                            </motion.a>
                            {!project.featured && (
                              <motion.a
                                href={project.liveUrl}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 bg-secondary rounded-full text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                aria-label={projectText.liveAria(project.title)}
                              >
                                <ExternalLink className="w-5 h-5" />
                              </motion.a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
