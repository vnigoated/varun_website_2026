'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { TextReveal } from '@/components/text-reveal'

const skills = [
  'Python', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'TensorFlow', 'PyTorch', 'LangChain', 'RAG Systems',
  'AWS', 'Docker', 'PostgreSQL', 'MongoDB',
  'Penetration Testing', 'Network Security'
]

export function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="about"
      className="py-32 relative overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <TextReveal as="span" className="text-sm uppercase tracking-widest text-primary font-medium inline-block" delay={0.05} stagger={0.04}>
              About Me
            </TextReveal>
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              Crafting the Future with AI
            </TextReveal>
          </motion.div>

          {/* About content */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <TextReveal as="p" className="text-lg text-muted-foreground leading-relaxed" delay={0.1} stagger={0.03}>
              I&apos;m a passionate AI Engineer and Full Stack Developer with a deep interest in building intelligent systems that solve real-world problems. With expertise spanning machine learning, cybersecurity, and scalable web applications, I bring a unique perspective to every project.
            </TextReveal>
            <TextReveal as="p" className="text-lg text-muted-foreground leading-relaxed" delay={0.15} stagger={0.03}>
              My journey has taken me through developing LLM pipelines, creating autonomous agents, and building security-focused applications. I thrive on the intersection of cutting-edge AI research and practical software engineering.
            </TextReveal>
          </motion.div>

          {/* Skills tags */}
          <motion.div variants={fadeInUp} className="mt-12">
            <TextReveal as="h3" className="text-sm uppercase tracking-widest text-primary font-medium mb-6 inline-block" delay={0.05} stagger={0.04}>
              Technologies I Work With
            </TextReveal>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{
                    delay: 0.5 + index * 0.05,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ 
                    y: -4, 
                    boxShadow: '0 10px 30px -10px rgba(139, 94, 60, 0.3)'
                  }}
                  className="px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground border border-border cursor-default transition-colors hover:border-primary/50"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
