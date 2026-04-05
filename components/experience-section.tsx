'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Briefcase, Calendar, TrendingUp, Cpu, Shield, ChevronRight } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'
import { Reveal } from '@/components/reveal'

type ExperienceItem = {
  id: string
  title: string
  company: string
  period: string
  roleLabel: string
  description: string
  highlights: string[]
  technologies: string[]
  icon: typeof Briefcase
  impactStats: Array<{
    label: string
    value: string
    note: string
  }>
}

const experiences: ExperienceItem[] = [
  {
    id: 'buildup-mirai',
    title: 'Software Developer Intern',
    company: 'BuildUp Mirai',
    period: 'Jan 2026 - Present',
    roleLabel: 'Current Role',
    description:
      'I contributed to production-ready AI platform engineering by improving deployment reliability, reducing API failure rates, and accelerating prototype-to-release delivery for enterprise use cases.',
    highlights: [
      'Improved prototype-to-release time by 30%',
      'Reduced API failure rate by 40%',
      'Strengthened CI/CD quality checks',
    ],
    technologies: ['FastAPI', 'LLM Pipelines', 'CI/CD', 'Production Reliability'],
    icon: Briefcase,
    impactStats: [
      {
        label: 'Prototype to Release',
        value: '30% Faster',
        note: 'Delivery acceleration in internship workflow',
      },
      {
        label: 'API Reliability',
        value: '40% Fewer Failures',
        note: 'Stability improvements in production flow',
      },
      {
        label: 'Hands-on Domains',
        value: 'AI + Edge + Backend',
        note: 'Built across product, infra, and applied ML',
      },
    ],
  },
  {
    id: 'bootcoding',
    title: 'Software Developer Intern',
    company: 'Bootcoding',
    period: 'Oct 2025 - Nov 2025',
    roleLabel: 'Internship',
    description:
      'Built practical AI workflows including a resume analyzer and YouTube/PDF summarization pipelines focused on real-world utility and performance.',
    highlights: ['Resume Analyzer pipeline', 'YouTube/PDF summarizer', 'Applied AI delivery'],
    technologies: ['Python', 'RAG', 'NLP', 'Applied AI'],
    icon: Cpu,
    impactStats: [
      {
        label: 'Pipeline Development',
        value: '2 Core AI Pipelines',
        note: 'Resume analyzer + document/video summarizer',
      },
      {
        label: 'Delivery Focus',
        value: 'Production-minded',
        note: 'Built for practical utility and stable execution',
      },
      {
        label: 'Applied Scope',
        value: 'NLP + Summarization',
        note: 'End-to-end implementation for real use cases',
      },
    ],
  },
  {
    id: 'payload-drone',
    title: 'AI Engineer Intern',
    company: 'Payload Drone - Vishwakarma University',
    period: 'Jun 2024 - Dec 2024',
    roleLabel: 'Internship',
    description:
      'Worked on autonomous drone intelligence by designing high-payload systems and building GPS-independent visual SLAM capabilities.',
    highlights: ['Autonomous drone system', 'Visual SLAM pipeline', 'Edge AI implementation'],
    technologies: ['Computer Vision', 'SLAM', 'Edge AI', 'Autonomy'],
    icon: Shield,
    impactStats: [
      {
        label: 'Autonomy Engineering',
        value: 'GPS-Independent Vision',
        note: 'Designed visual navigation for drone reliability',
      },
      {
        label: 'System Capability',
        value: 'High-Payload Design',
        note: 'Balanced performance and intelligent control',
      },
      {
        label: 'Applied Domain',
        value: 'Edge Robotics AI',
        note: 'Computer vision integrated with real hardware',
      },
    ],
  },
]

export function ExperienceSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeExperienceId, setActiveExperienceId] = useState(experiences[0].id)
  const [hasSelectedExperience, setHasSelectedExperience] = useState(false)

  const featuredExperience =
    experiences.find((experience) => experience.id === activeExperienceId) ?? experiences[0]

  const compactExperiences = experiences.filter(
    (experience) => experience.id !== featuredExperience.id,
  )

  const handleSelectExperience = (experienceId: string) => {
    setHasSelectedExperience(true)
    if (activeExperienceId !== experienceId) {
      setActiveExperienceId(experienceId)
    }
  }

  return (
    <section
      ref={ref}
      id="experience"
      className="py-32 bg-secondary/30 relative overflow-hidden scroll-mt-28"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <TextReveal as="span" className="text-sm uppercase tracking-widest text-primary font-medium inline-block" delay={0.05} stagger={0.04}>
              Experience
            </TextReveal>
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              Career in Motion
            </TextReveal>
          </motion.div>

          <AnimatePresence initial={false} mode="wait">
          {hasSelectedExperience ? (
            <motion.div
              key="expanded-bento"
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-6"
            >
              {compactExperiences.map((experience) => (
                <motion.div
                  key={experience.id}
                  layout
                  className="lg:col-span-6"
                  layout="position"
                >
                  <motion.article
                    layout
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.5 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    onClick={() => handleSelectExperience(experience.id)}
                    className="group h-full p-7 bg-card rounded-3xl border border-border shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <experience.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{experience.company}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{experience.period}</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {experience.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {experience.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {experience.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between text-sm text-primary font-medium">
                      <span>View full experience</span>
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </motion.article>
                </motion.div>
              ))}

              <motion.div
                layout
                className="lg:col-span-8"
                initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              >
                <motion.article
                  key={featuredExperience.id}
                  layout
                  transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="h-full p-8 md:p-10 bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10">
                        <featuredExperience.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wider text-primary font-medium">{featuredExperience.roleLabel}</p>
                        <p className="text-foreground font-semibold">{featuredExperience.company}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-full px-4 py-2">
                      <Calendar className="w-4 h-4" />
                      {featuredExperience.period}
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {featuredExperience.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featuredExperience.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {featuredExperience.highlights.map((item, idx) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        transition={{ delay: 0.15 + idx * 0.08, duration: 0.35 }}
                        className="rounded-2xl bg-secondary/60 border border-border px-4 py-3 text-sm font-medium text-foreground"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {featuredExperience.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.article>
              </motion.div>

              <div className="lg:col-span-4 grid gap-6">
                {featuredExperience.impactStats.map((stat, index) => (
                  <Reveal key={stat.label} delay={0.08 + index * 0.08}>
                    <motion.article
                      whileHover={{ y: -4 }}
                      className="h-full p-6 bg-card rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="inline-flex items-center gap-2 text-primary mb-3">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-semibold">Impact</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground mb-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{stat.note}</p>
                    </motion.article>
                  </Reveal>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="initial-grid"
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {experiences.map((experience, index) => (
                <motion.article
                  key={experience.id}
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 + index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => handleSelectExperience(experience.id)}
                  className="group h-full p-7 bg-card rounded-3xl border border-border shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <experience.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">{experience.company}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{experience.period}</span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {experience.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {experience.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {experience.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between text-sm text-primary font-medium">
                    <span>View full experience</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
