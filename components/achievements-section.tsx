'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp, staggerContainer, springScale } from '@/lib/animations'
import { Trophy, Award, Medal, FileText, Users } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'
import { Reveal } from '@/components/reveal'

const achievements = [
  {
    title: 'IBM Hackathon Winner',
    description: 'First place in IBM\'s global AI hackathon, developing an innovative solution for enterprise knowledge management.',
    icon: Trophy,
    color: 'from-amber-500 to-amber-600'
  },
  {
    title: 'Codeathon ML Winner',
    description: 'Won the machine learning track with a real-time anomaly detection system for IoT devices.',
    icon: Award,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'VOIS Marathon Winner',
    description: 'Developed a winning accessibility solution that helps visually impaired users navigate digital interfaces.',
    icon: Medal,
    color: 'from-sky-500 to-sky-600'
  },
  {
    title: 'Published Research Paper',
    description: 'Authored a peer-reviewed paper on advanced SLAM algorithms for autonomous navigation systems.',
    icon: FileText,
    color: 'from-violet-500 to-violet-600'
  },
  {
    title: 'AI Crowd System - 200K+ Users',
    description: 'Built and deployed an AI-powered crowd management system serving over 200,000 active users.',
    icon: Users,
    color: 'from-rose-500 to-rose-600'
  }
]

export function AchievementsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="achievements"
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
            <TextReveal as="span" className="text-sm uppercase tracking-widest text-primary font-medium inline-block" delay={0.05} stagger={0.04}>
              Achievements
            </TextReveal>
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              Recognition & Impact
            </TextReveal>
            <TextReveal as="p" className="text-muted-foreground mt-4 max-w-xl mx-auto" delay={0.12} stagger={0.025}>
              Highlights from competitions, research, and projects that made a real difference.
            </TextReveal>
          </motion.div>

          {/* Achievements grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Reveal key={achievement.title} delay={index * 0.08}>
                <motion.div
                  variants={springScale}
                  custom={index}
                  whileHover={{ 
                    y: -8,
                    boxShadow: '0 25px 50px -12px rgba(139, 94, 60, 0.2)'
                  }}
                  className="group relative p-8 bg-card rounded-3xl border border-border overflow-hidden transition-all duration-300"
                >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg`}
                >
                  <achievement.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {achievement.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {achievement.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
