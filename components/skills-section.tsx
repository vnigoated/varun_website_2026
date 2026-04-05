'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Code2, Layers, Brain, Database, Shield } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'
import { Reveal } from '@/components/reveal'

const skillCategories = [
  {
    title: 'Languages',
    icon: Code2,
    skills: [
      { name: 'Python', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'JavaScript', level: 90 },
      { name: 'Go', level: 70 },
      { name: 'Rust', level: 60 },
    ]
  },
  {
    title: 'Frameworks',
    icon: Layers,
    skills: [
      { name: 'React/Next.js', level: 95 },
      { name: 'Node.js', level: 85 },
      { name: 'FastAPI', level: 90 },
      { name: 'Django', level: 75 },
      { name: 'Express', level: 80 },
    ]
  },
  {
    title: 'AI/ML',
    icon: Brain,
    skills: [
      { name: 'TensorFlow', level: 85 },
      { name: 'PyTorch', level: 80 },
      { name: 'LangChain', level: 90 },
      { name: 'OpenAI/GPT', level: 95 },
      { name: 'Computer Vision', level: 75 },
    ]
  },
  {
    title: 'Databases',
    icon: Database,
    skills: [
      { name: 'PostgreSQL', level: 90 },
      { name: 'MongoDB', level: 85 },
      { name: 'Redis', level: 80 },
      { name: 'Pinecone', level: 85 },
      { name: 'Supabase', level: 90 },
    ]
  },
  {
    title: 'Cybersecurity',
    icon: Shield,
    skills: [
      { name: 'Pen Testing', level: 80 },
      { name: 'Network Security', level: 75 },
      { name: 'OWASP', level: 85 },
      { name: 'Cryptography', level: 70 },
      { name: 'Security Auditing', level: 75 },
    ]
  }
]

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
        />
      </div>
    </div>
  )
}

export function SkillsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="skills"
      className="py-32 bg-secondary/30 relative overflow-hidden scroll-mt-28"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <TextReveal as="span" className="text-sm uppercase tracking-widest text-primary font-medium inline-block" delay={0.05} stagger={0.04}>
              Skills
            </TextReveal>
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              Technical Expertise
            </TextReveal>
            <TextReveal as="p" className="text-muted-foreground mt-4 max-w-xl mx-auto" delay={0.12} stagger={0.025}>
              A comprehensive toolkit for building intelligent, scalable, and secure applications.
            </TextReveal>
          </motion.div>

          {/* Skills grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, categoryIndex) => (
              <Reveal key={category.title} delay={categoryIndex * 0.08} className="h-full">
                <motion.div
                  variants={fadeInUp}
                  custom={categoryIndex}
                  whileHover={{ y: -4 }}
                  className="p-8 bg-card rounded-3xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                  </div>

                  {/* Skills */}
                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={categoryIndex * 0.1 + skillIndex * 0.1}
                      />
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
