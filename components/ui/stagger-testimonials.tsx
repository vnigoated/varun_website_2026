"use client"

import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SQRT_5000 = Math.sqrt(5000)

const testimonials = [
  {
    tempId: 0,
    testimonial: 'Python, JavaScript, TypeScript',
    by: 'Languages',
    imgSrc: 'https://i.pravatar.cc/150?img=1',
  },
  {
    tempId: 1,
    testimonial: 'React, Next, Node, Express, Flask, FastAPI, TailwindCSS',
    by: 'Frameworks',
    imgSrc: 'https://i.pravatar.cc/150?img=2',
  },
  {
    tempId: 2,
    testimonial:
      'PyTorch, Scikit-learn, Pydantic, spaCy, Transformers, OpenCV, LangChain, LangGraph, LlamaIndex, Langflow',
    by: 'AI/ML Stack',
    imgSrc: 'https://i.pravatar.cc/150?img=3',
  },
  {
    tempId: 3,
    testimonial: 'PostgreSQL, MongoDB, Redis, FAISS, Pinecone',
    by: 'Databases',
    imgSrc: 'https://i.pravatar.cc/150?img=4',
  },
  {
    tempId: 4,
    testimonial: 'Natural Language Processing, RAG, Agentic AI',
    by: 'Specializations',
    imgSrc: 'https://i.pravatar.cc/150?img=5',
  },
  {
    tempId: 5,
    testimonial: 'Git, n8n, Firebase, Docker, AWS, Vercel, MLflow, Ollama',
    by: 'DevOps & Tools',
    imgSrc: 'https://i.pravatar.cc/150?img=6',
  },
  {
    tempId: 6,
    testimonial: 'OWASP ZAP, BurpSuite, VAPT',
    by: 'Cybersecurity',
    imgSrc: 'https://i.pravatar.cc/150?img=7',
  },
]

interface TestimonialCardProps {
  position: number
  testimonial: (typeof testimonials)[0]
  handleMove: (steps: number) => void
  cardSize: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0
  const skills = testimonial.testimonial
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
  const showTwoColumns = skills.length >= 6
  const firstThreeSkills = skills.slice(0, 3)
  const lastThreeSkills = skills.slice(-3)

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        'absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out',
        isCenter
          ? 'z-10 bg-primary text-primary-foreground border-primary'
          : 'z-0 bg-card text-card-foreground border-border hover:border-primary/50',
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath:
          'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? '0px 8px 0px 4px hsl(var(--border))' : '0px 0px 0px 0px transparent',
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <div
        className={cn(
          'text-base sm:text-lg font-medium mt-2',
          isCenter ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {showTwoColumns ? (
          <div className="grid grid-cols-2 gap-4">
            <ul className="space-y-1 pl-5 text-left list-disc">
              {firstThreeSkills.map((skill) => (
                <li key={`first-${skill}`}>{skill}</li>
              ))}
            </ul>
            <ul className="space-y-1 pl-5 text-left list-disc">
              {lastThreeSkills.map((skill) => (
                <li key={`last-${skill}`}>{skill}</li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-1 pl-5 text-left list-disc">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        )}
      </div>
      <p
        className={cn(
          'absolute bottom-8 left-8 right-8 mt-2 text-sm italic',
          isCenter ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  )
}

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365)
  const [testimonialsList, setTestimonialsList] = useState(testimonials)

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList]
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift()
        if (!item) return
        newList.push({ ...item, tempId: Math.random() })
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop()
        if (!item) return
        newList.unshift({ ...item, tempId: Math.random() })
      }
    }
    setTestimonialsList(newList)
  }

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)')
      setCardSize(matches ? 365 : 290)
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div className="relative w-full overflow-hidden bg-muted/30" style={{ height: 600 }}>
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2

        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        )
      })}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            'flex h-14 w-14 items-center justify-center text-2xl transition-colors',
            'bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            'flex h-14 w-14 items-center justify-center text-2xl transition-colors',
            'bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
