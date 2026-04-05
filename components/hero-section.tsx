'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Volume2, Loader2, Pause, Bot, SendHorizontal, Sparkles, FileDown } from 'lucide-react'
import { fadeInUp, staggerContainer, hoverScale, tapScale } from '@/lib/animations'
import { TextReveal } from '@/components/text-reveal'
import { GithubHeatmap } from '@/components/github-heatmap'

const ABOUT_ME_AUDIO_SRC = '/audio/about-me.wav'
const ABOUT_ME_AUDIO_SRC_DE = '/audio/german_about_me.wav'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
}

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

const chatbotI18n: Record<
  ChatLanguage,
  {
    intro: string
    guide: string
    online: string
    placeholder: string
    quickPrompts: [string, string, string]
    errorPrefix: string
    thinking: string
  }
> = {
  en: {
    intro: "Hi, I am Varun's AI assistant. Ask me anything about his profile, projects, and experience.",
    guide: 'Portfolio Guide',
    online: 'Online',
    placeholder: 'Ask about projects, stack, achievements...',
    quickPrompts: ['What can Varun build?', 'Tech stack?', 'Internship impact?'],
    errorPrefix: 'AI chat error',
    thinking: 'Thinking...',
  },
  de: {
    intro: 'Hallo, ich bin Varuns KI-Assistent. Frag mich alles zu seinem Profil, seinen Projekten und seiner Erfahrung.',
    guide: 'Portfolio-Assistent',
    online: 'Online',
    placeholder: 'Frage nach Projekten, Stack, Erfolgen...',
    quickPrompts: ['Was kann Varun bauen?', 'Tech-Stack?', 'Praktikums-Impact?'],
    errorPrefix: 'KI-Chat-Fehler',
    thinking: 'Denke nach...',
  },
}

const heroI18n: Record<
  ChatLanguage,
  {
    description: string
    aboutMe: string
    stopAudio: string
    loadingAudio: string
    downloadResume: string
    contactMe: string
    seeProjects: string
    roles: [string, string, string]
  }
> = {
  en: {
    description:
      'I build intelligent and secure products that turn ideas into production-ready systems.',
    aboutMe: 'About Me',
    stopAudio: 'Stop About Me Audio',
    loadingAudio: 'Loading Audio...',
    downloadResume: 'Download Resume',
    contactMe: 'Contact Me',
    seeProjects: 'See Projects',
    roles: ['AI Engineer', 'Cybersecurity Engineer', 'Full Stack Developer'],
  },
  de: {
    description:
      'Ich entwickle intelligente und sichere Produkte, die Ideen in produktionsreife Systeme verwandeln.',
    aboutMe: 'Über mich',
    stopAudio: 'Über-mich-Audio stoppen',
    loadingAudio: 'Audio wird geladen...',
    downloadResume: 'Lebenslauf herunterladen',
    contactMe: 'Kontakt',
    seeProjects: 'Projekte ansehen',
    roles: ['KI-Ingenieur', 'Cybersecurity-Ingenieur', 'Full-Stack-Entwickler'],
  },
}

function createInitialChatMessages(language: ChatLanguage): ChatMessage[] {
  return [
    {
      id: `intro-${language}`,
      role: 'assistant' as const,
      text: chatbotI18n[language].intro,
    },
  ]
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [activeAudioLanguage, setActiveAudioLanguage] = useState<ChatLanguage>('en')
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const [useApiFallback, setUseApiFallback] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [chatLanguage, setChatLanguage] = useState<ChatLanguage>('en')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(createInitialChatMessages('en'))
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const chatText = chatbotI18n[chatLanguage]
  const heroText = heroI18n[chatLanguage]

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setChatLanguage(savedLanguage)
      setChatMessages(createInitialChatMessages(savedLanguage))
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (!nextLanguage || nextLanguage === chatLanguage) {
        return
      }

      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        setIsSpeaking(false)
      }

      setChatLanguage(nextLanguage)
      setCurrentRole(0)
      setDisplayText('')
      setIsDeleting(false)
      setChatInput('')
      setIsBotTyping(false)
      setChatMessages(createInitialChatMessages(nextLanguage))
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    }
  }, [chatLanguage])

  const handleLanguageChange = (language: ChatLanguage) => {
    if (language === chatLanguage) {
      return
    }

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }

    setChatLanguage(language)
    setCurrentRole(0)
    setDisplayText('')
    setIsDeleting(false)
    setChatInput('')
    setIsBotTyping(false)
    setChatMessages(createInitialChatMessages(language))
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language } }))
  }

  // Typing effect
  useEffect(() => {
    const currentText = heroText.roles[currentRole]
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
          setCurrentRole((prev) => (prev + 1) % heroText.roles.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole, heroText.roles])

  useEffect(() => {
    const audio = new Audio(ABOUT_ME_AUDIO_SRC)
    audio.preload = 'auto'
    audioRef.current = audio
    setActiveAudioLanguage('en')

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

  const createAudioFromStatic = async (src: string, language: ChatLanguage) => {
    const nextAudio = new Audio(src)
    nextAudio.preload = 'auto'
    nextAudio.onended = () => setIsSpeaking(false)
    nextAudio.onpause = () => setIsSpeaking(false)
    nextAudio.onplaying = () => {
      setIsSpeaking(true)
      setIsPreparingAudio(false)
    }

    audioRef.current = nextAudio
    setActiveAudioLanguage(language)
  }

  const createAudioFromApi = async (language: ChatLanguage) => {
    const response = await fetch('/api/about-me-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language }),
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
    setUseApiFallback(language === 'en')
    setActiveAudioLanguage(language)
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
      if (chatLanguage === 'de') {
        const shouldRefreshGermanAudio =
          activeAudioLanguage !== 'de' ||
          !audioRef.current.src ||
          !audioRef.current.src.includes(ABOUT_ME_AUDIO_SRC_DE)

        if (shouldRefreshGermanAudio) {
          await createAudioFromStatic(ABOUT_ME_AUDIO_SRC_DE, 'de')
        }

        await audioRef.current.play()
      } else if (useApiFallback) {
        const shouldRefreshAudio =
          activeAudioLanguage !== 'en' ||
          !audioRef.current.src ||
          audioRef.current.src.endsWith(ABOUT_ME_AUDIO_SRC)

        if (shouldRefreshAudio) {
          await createAudioFromApi('en')
        }
        await audioRef.current.play()
      } else {
        if (!audioRef.current.src || !audioRef.current.src.includes(ABOUT_ME_AUDIO_SRC)) {
          await createAudioFromStatic(ABOUT_ME_AUDIO_SRC, 'en')
        }
        await audioRef.current.play()
        setActiveAudioLanguage('en')
      }

      setIsSpeaking(true)
    } catch (error) {
      const isNotSupportedError =
        error instanceof DOMException && error.name === 'NotSupportedError'

      if (chatLanguage === 'de') {
        try {
          await createAudioFromStatic(ABOUT_ME_AUDIO_SRC, 'en')
          if (!audioRef.current) {
            throw new Error('English fallback audio not available')
          }
          await audioRef.current.play()
          setIsSpeaking(true)
          return
        } catch (fallbackError) {
          console.error(fallbackError)
        }
      } else if (isNotSupportedError && !useApiFallback) {
        try {
          await createAudioFromApi('en')
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
          language: chatLanguage,
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
          text: `${chatText.errorPrefix}: ${errorText}`,
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
      className="relative min-h-[142vh] flex items-start justify-center overflow-hidden pt-20 pb-24 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32"
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
          className="grid items-stretch gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10"
        >
          {/* Left side content */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="relative h-full overflow-hidden rounded-3xl border border-[#dccbb9] bg-gradient-to-br from-white to-[#fbf7f3] backdrop-blur-xl shadow-[0_18px_60px_rgba(139,94,60,0.12)] px-6 py-6 md:px-8 md:py-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,94,60,0.08),transparent_55%)]" />
            <div className="relative space-y-6 text-center lg:text-left">
              <motion.div variants={fadeInUp} className="overflow-hidden">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-foreground tracking-tight leading-[0.95]"
                >
                  <TextReveal as="span" className="block" delay={0.05} stagger={0.08}>
                    Varun Inamdar
                  </TextReveal>
                </motion.h1>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground lg:mx-0 md:text-base"
              >
                {heroText.description}
              </motion.p>

              <motion.div variants={fadeInUp} className="min-h-[36px] flex items-center justify-center lg:justify-start">
                <span className="text-lg md:text-xl text-primary font-medium">
                  {displayText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 bg-primary ml-1 align-middle"
                  />
                </span>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <motion.button
                  type="button"
                  onClick={handleAboutMeAudio}
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  disabled={isPreparingAudio}
                  className="inline-flex items-center gap-2 rounded-full border border-[#cfb8a1] bg-white px-5 py-2.5 text-sm font-medium text-[#6f4e3a] transition-colors duration-300 hover:bg-[#f8f1ea] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPreparingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {heroText.loadingAudio}
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4" />
                      {heroText.stopAudio}
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      {heroText.aboutMe}
                    </>
                  )}
                </motion.button>

                <motion.a
                  href="/NEW_RESUME_2026.pdf"
                  download
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors duration-300 hover:bg-[#704a30]"
                >
                  <FileDown className="h-4 w-4" />
                  {heroText.downloadResume}
                </motion.a>

                <motion.a
                  href="#contact"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  className="rounded-full border border-[#cfb8a1] bg-white px-6 py-3 text-sm font-medium text-[#6f4e3a] transition-colors duration-300 hover:bg-[#f8f1ea]"
                >
                  {heroText.contactMe}
                </motion.a>

                <motion.a
                  href="#projects"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  className="inline-flex items-center px-2 py-2 text-sm font-medium text-[#8b5e3c] underline underline-offset-4"
                >
                  {heroText.seeProjects}
                </motion.a>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-1">
                <GithubHeatmap language={chatLanguage} />
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
                    <p className="text-xs text-muted-foreground">{chatText.guide}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4e8dc] px-3 py-1 text-xs text-[#8b5e3c]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {chatText.online}
                  </div>
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
                    <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-[#e9dfd3] text-[#4f392a] inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse [animation-delay:120ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse [animation-delay:240ms]" />
                      <span className="text-xs">{chatText.thinking}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative border-t border-[#dccbb9] px-4 py-3 bg-transparent">
                <div className="mb-3 flex flex-wrap gap-2">
                  {chatText.quickPrompts.map((q) => (
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
                    placeholder={chatText.placeholder}
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
