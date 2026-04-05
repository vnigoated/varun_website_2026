'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatLanguage = 'en' | 'de'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'
const LANGUAGE_CHANGE_EVENT = 'portfolio-language-change'

const navLabels: Record<ChatLanguage, Array<{ name: string; href: string }>> = {
  en: [
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Achievements', href: '#achievements' },
    { name: 'Contact', href: '#contact' },
  ],
  de: [
    { name: 'Erfahrung', href: '#experience' },
    { name: 'Projekte', href: '#projects' },
    { name: 'Fähigkeiten', href: '#skills' },
    { name: 'Auszeichnungen', href: '#achievements' },
    { name: 'Kontakt', href: '#contact' },
  ],
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navbarLanguage, setNavbarLanguage] = useState<ChatLanguage>('en')
  const navLinks = navLabels[navbarLanguage]

  const setLanguage = (language: ChatLanguage) => {
    if (language === navbarLanguage) {
      return
    }

    setNavbarLanguage(language)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language } }))
  }

  const handleNavClick = (href: string) => {
    if (href === '#') return

    const target = document.querySelector(href)
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setNavbarLanguage(savedLanguage)
    }

    const handleLanguageEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: ChatLanguage }>
      const nextLanguage = customEvent.detail?.language
      if (nextLanguage === 'en' || nextLanguage === 'de') {
        setNavbarLanguage(nextLanguage)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent as EventListener)
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass py-4' : 'py-6'
      )}
    >
      <nav className="container mx-auto px-6 relative flex items-center justify-between">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link, index) => (
            <motion.li
              key={link.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                onClick={(event) => {
                  event.preventDefault()
                  handleNavClick(link.href)
                }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Desktop Language Toggle */}
        <div className="hidden md:inline-flex items-center rounded-full border border-[#dccbb9] bg-white p-1 text-sm shadow-sm">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`rounded-full px-3 py-1 transition-colors ${
              navbarLanguage === 'en' ? 'bg-[#8b5e3c] text-white' : 'text-[#8b5e3c]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('de')}
            className={`rounded-full px-3 py-1 transition-colors ${
              navbarLanguage === 'de' ? 'bg-[#8b5e3c] text-white' : 'text-[#8b5e3c]'
            }`}
          >
            DE
          </button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass"
          >
            <ul className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <li>
                <div className="inline-flex items-center rounded-full border border-[#dccbb9] bg-white p-1 text-sm shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      navbarLanguage === 'en' ? 'bg-[#8b5e3c] text-white' : 'text-[#8b5e3c]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('de')}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      navbarLanguage === 'de' ? 'bg-[#8b5e3c] text-white' : 'text-[#8b5e3c]'
                    }`}
                  >
                    DE
                  </button>
                </div>
              </li>
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(event) => {
                      event.preventDefault()
                      handleNavClick(link.href)
                    }}
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
