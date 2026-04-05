import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0,
    filter: 'blur(8px)'
  },
  visible: { 
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const springScale: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  }
}

export const drawLine: Variants = {
  hidden: { 
    pathLength: 0 
  },
  visible: { 
    pathLength: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
}

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2, ease: 'easeOut' }
}

export const hoverGlow = {
  scale: 1.03,
  boxShadow: '0 20px 40px -12px rgba(139, 94, 60, 0.25)',
  transition: { duration: 0.2 }
}

export const tapScale = {
  scale: 0.98
}
