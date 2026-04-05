'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Volume2, Loader2, Pause, Bot, SendHorizontal, Sparkles } from 'lucide-react'
import { fadeInUp, staggerContainer, hoverScale, tapScale } from '@/lib/animations'
import { TextReveal } from '@/components/text-reveal'
import { GithubHeatmap } from '@/components/github-heatmap'

const roles = [
  'AI Engineer',
  'Cybersecurity Engineer',
  'Full Stack Developer'
]

const ABOUT_ME_AUDIO_SRC = '/audio/about-me.wav'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
}

const initialChatMessages: ChatMessage[] = [
  {
    id: 'intro',
    role: 'assistant' as const,
    text: 'Hi, I am Varun\'s AI assistant. Ask me anything about his profile, projects, and experience.',
  },
]

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const [useApiFallback, setUseApiFallback] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Typing effect
  useEffect(() => {
    const currentText = roles[currentRole]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentRole((prev) => (prev + 1) % roles.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

  useEffect(() => {
    const audio = new Audio(ABOUT_ME_AUDIO_SRC)
    audio.preload = 'auto'
    audioRef.current = audio

    audio.onended = () => setIsSpeaking(false)
    audio.onpause = () => setIsSpeaking(false)
    audio.onplaying = () => {
      setIsSpeaking(true)
      setIsPreparingAudio(false)
    }
    audio.onerror = () => {
      setIsPreparingAudio(false)
      setIsSpeaking(false)
      setUseApiFallback(true)
    }

    audio.load()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const createAudioFromApi = async () => {
    const response = await fetch('/api/about-me-tts', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Unable to load About Me audio')
    }

    const blob = await response.blob()
    if (!blob.size) {
      throw new Error('No audio received from About Me API')
    }

    const objectUrl = URL.createObjectURL(blob)
    const fallbackAudio = new Audio(objectUrl)
    fallbackAudio.preload = 'auto'
    fallbackAudio.onended = () => setIsSpeaking(false)
    fallbackAudio.onpause = () => setIsSpeaking(false)
    fallbackAudio.onplaying = () => {
      setIsSpeaking(true)
      setIsPreparingAudio(false)
    }

    audioRef.current = fallbackAudio
    setUseApiFallback(true)
  }

  const handleAboutMeAudio = async () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsSpeaking(false)
      return
    }

    if (!audioRef.current) {
      return
    }

    setIsPreparingAudio(true)

    try {
      if (useApiFallback) {
        if (!audioRef.current.src || audioRef.current.src.endsWith(ABOUT_ME_AUDIO_SRC)) {
          await createAudioFromApi()
        }
        await audioRef.current.play()
      } else {
        await audioRef.current.play()
      }

      setIsSpeaking(true)
    } catch (error) {
      const isNotSupportedError =
        error instanceof DOMException && error.name === 'NotSupportedError'

      if (isNotSupportedError && !useApiFallback) {
        try {
          await createAudioFromApi()
          if (!audioRef.current) {
            throw new Error('Fallback audio not available')
          }
          await audioRef.current.play()
          setIsSpeaking(true)
          return
        } catch (fallbackError) {
          console.error(fallbackError)
        }
      } else {
        console.error(error)
      }

      setIsSpeaking(false)
      setIsPreparingAudio(false)
    } finally {
      setIsPreparingAudio(false)
    }
  }

  const handleSendMessage = async (incoming?: string) => {
    const message = (incoming ?? chatInput).trim()
    if (!message || isBotTyping) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: message,
    }

    const nextMessages = [...chatMessages, userMessage]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsBotTyping(true)

    try {
      const response = await fetch('/api/portfolio-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = (await response.json()) as { reply?: string }
      const reply = data.reply?.trim()
      if (!reply) {
        throw new Error('Empty AI response')
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant' as const,
          text: reply,
        },
      ])
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Request failed'
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          role: 'assistant' as const,
          text: `AI chat error: ${errorText}`,
        },
      ])
    } finally {
      setIsBotTyping(false)
    }
  }

  const formatMessageText = (text: string, role: ChatMessage['role']) => {
    if (role !== 'assistant') {
      return text
    }

    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/^\s*\d+[.)]\s+/gm, '• ')
      .replace(/^\s*[*-]\s+/gm, '• ')
      .replace(/\b(Live Demo)(?!\s*:)/gi, 'Live Demo:')
      .replace(/\b(GitHub)(?!\s*:)/gi, 'GitHub:')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[78vh] flex items-start justify-center overflow-hidden pt-20 pb-6 md:pt-24 md:pb-8 lg:pt-28 lg:pb-10"
      style={{ position: 'relative' }}
    >
      {/* Floating gradient shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-secondary/50 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid items-stretch gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14"
        >
          {/* Left side content */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="relative h-full overflow-hidden rounded-3xl border border-[#dccbb9] bg-white backdrop-blur-xl shadow-[0_18px_60px_rgba(139,94,60,0.12)] px-6 py-5 md:px-8 md:py-7"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,94,60,0.08),transparent_55%)]" />
            <div className="relative space-y-5 text-center lg:text-left">
              <motion.div variants={fadeInUp} className="overflow-hidden">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-foreground tracking-tight leading-[0.95]"
                >
                  <TextReveal as="span" className="block" delay={0.05} stagger={0.08}>
                    Varun Inamdar
                  </TextReveal>
                </motion.h1>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
              >
                <motion.button
                  type="button"
                  onClick={handleAboutMeAudio}
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  disabled={isPreparingAudio}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b5e3c] text-white rounded-full font-medium text-sm border border-[#8b5e3c] hover:bg-[#6f492f] transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPreparingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading Audio...
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop About Me Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      About Me
                    </>
                  )}
                </motion.button>

                <motion.a
                  href="/NEW_RESUME_2026.pdf"
                  download
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  className="px-8 py-4 bg-[#8b5e3c] text-white rounded-full font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300"
                >
                  Download Resume
                </motion.a>

                <motion.a
                  href="#contact"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  className="px-8 py-4 bg-[#8b5e3c] text-white rounded-full font-medium text-sm border border-[#8b5e3c] hover:bg-[#6f492f] transition-colors duration-300"
                >
                  Contact Me
                </motion.a>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-10 flex items-center justify-center lg:justify-start">
                <span className="text-xl md:text-2xl text-primary font-medium">
                  {displayText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 bg-primary ml-1 align-middle"
                  />
                </span>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-0">
                <GithubHeatmap />
              </motion.div>
            </div>
          </motion.div>

          {/* Right side chatbot */}
          <motion.div variants={fadeInUp} className="w-full h-full min-h-0 max-w-xl mx-auto lg:mx-0 lg:justify-self-end">
            <motion.div
              whileHover={{ y: -4 }}
              className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#dccbb9] bg-white backdrop-blur-xl shadow-[0_18px_60px_rgba(139,94,60,0.12)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,94,60,0.12),transparent_55%)]" />

              <div className="relative border-b border-[#dccbb9] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Varun AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Portfolio Guide</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  Online
                </div>
              </div>

              <div className="relative h-[280px] px-5 py-4 overflow-y-auto space-y-3 scrollbar-hide bg-transparent md:h-[300px] lg:h-[320px]">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-[#e9dfd3] text-[#4f392a] rounded-bl-md'
                      }`}
                    >
                      <span className="whitespace-pre-wrap break-words">
                        {formatMessageText(message.text, message.role)}
                      </span>
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-[#e9dfd3] text-[#4f392a] inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse [animation-delay:120ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse [animation-delay:240ms]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative border-t border-[#dccbb9] px-4 py-3 bg-transparent">
                <div className="mb-3 flex flex-wrap gap-2">
                  {['What can Varun build?', 'Tech stack?', 'Internship impact?'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="rounded-full border border-[#dccbb9] bg-white px-3 py-1.5 text-xs text-[#7a5a45] hover:text-foreground hover:border-[#c7ae95] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about projects, stack, achievements..."
                    className="w-full rounded-xl border border-[#dccbb9] bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isBotTyping}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#8b5e3c] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  )
}
