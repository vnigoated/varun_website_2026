'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { fadeInUp, staggerContainer, hoverScale, tapScale } from '@/lib/animations'
import { Mail, MapPin, Phone, Send, Github, Linkedin, Twitter, CheckCircle, AlertCircle } from 'lucide-react'
import { TextReveal } from '@/components/text-reveal'
import { Reveal } from '@/components/reveal'

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
]

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Randomly succeed or fail for demo
    setFormState('success')
    setFormData({ name: '', email: '', message: '' })
    
    // Reset after 3 seconds
    setTimeout(() => setFormState('idle'), 3000)
  }

  return (
    <section
      ref={ref}
      id="contact"
      className="py-32 bg-secondary/30 relative overflow-hidden scroll-mt-28"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <TextReveal as="span" className="text-sm uppercase tracking-widest text-primary font-medium inline-block" delay={0.05} stagger={0.04}>
              Contact
            </TextReveal>
            <TextReveal as="h2" className="text-4xl md:text-5xl font-bold text-foreground mt-4" delay={0.08} stagger={0.06}>
              Let&apos;s Work Together
            </TextReveal>
            <TextReveal as="p" className="text-muted-foreground mt-4 max-w-xl mx-auto" delay={0.12} stagger={0.025}>
              Have a project in mind? I&apos;d love to hear about it. Let&apos;s connect and create something amazing.
            </TextReveal>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact info */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="space-y-6">
                <TextReveal as="h3" className="text-2xl font-bold text-foreground inline-block" delay={0.05} stagger={0.05}>
                  Get in Touch
                </TextReveal>
                <TextReveal as="p" className="text-muted-foreground leading-relaxed" delay={0.08} stagger={0.025}>
                  I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                </TextReveal>
              </div>

              {/* Contact details */}
              <div className="space-y-4">
                <Reveal delay={0.05}>
                  <motion.div 
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">varun@example.com</p>
                    </div>
                  </motion.div>
                </Reveal>

                <Reveal delay={0.1}>
                  <motion.div 
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">+91 98765 43210</p>
                    </div>
                  </motion.div>
                </Reveal>

                <Reveal delay={0.15}>
                  <motion.div 
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">Mumbai, India</p>
                    </div>
                  </motion.div>
                </Reveal>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-card rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact form */}
            <Reveal delay={0.1}>
              <motion.div variants={fadeInUp}>
                <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl border border-border/50 shadow-xl">
                  <div className="space-y-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Message
                    </label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={formState === 'loading' || formState === 'success'}
                    whileHover={formState === 'idle' ? hoverScale : undefined}
                    whileTap={formState === 'idle' ? tapScale : undefined}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formState === 'idle' && (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                    {formState === 'loading' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                    )}
                    {formState === 'success' && (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Message Sent!
                      </>
                    )}
                    {formState === 'error' && (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Try Again
                      </>
                    )}
                  </motion.button>
                  </div>
                </form>
              </motion.div>
            </Reveal>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
