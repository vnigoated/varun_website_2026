import { NextResponse } from 'next/server'

type TtsLanguage = 'en' | 'de'

const ABOUT_ME_TEXT: Record<TtsLanguage, string> = {
  en:
    "I am Varun Inamdar, a B.Tech student in Artificial Intelligence at Vishwakarma University with a strong focus on building real-world, production-grade AI systems. My work lies at the intersection of AI engineering, scalable backend systems, and cybersecurity. I specialize in developing intelligent systems using RAG, agentic AI, and LLM pipelines, with hands-on experience in tools like LangChain, PyTorch, FastAPI, and distributed systems powered by Redis and BullMQ. I've built and deployed end-to-end AI solutions, from adaptive e-learning platforms and resume analyzers to energy optimization systems for industrial use. Through my internships, I've contributed to transforming early-stage AI prototypes into production-ready platforms, optimizing CICD pipelines, improving system reliability, and designing scalable architectures. My experience also extends to edge AI, where I worked on autonomous drone systems using computer vision and SLAM techniques. I'm particularly interested in solving complex real-world problems using AI, whether it's improving operational efficiency, enabling intelligent automation, or building personalized user experiences. Alongside this, I actively explore cybersecurity practices including VAPT and secure system design. I've won multiple national-level hackathons, published research in ML-based document summarization, and led impactful deployments like an AI-based crowd monitoring system handling over 200,000 users in real-time. Currently, I'm focused on building high-impact AI projects and preparing for advanced research and graduate studies in AI and Data Engineering.",
  de:
    'Ich bin Varun Inamdar, ein B.Tech-Student im Bereich Künstliche Intelligenz an der Vishwakarma University mit starkem Fokus auf praxisnahe, produktionsreife KI-Systeme. Meine Arbeit liegt an der Schnittstelle von KI-Engineering, skalierbaren Backend-Systemen und Cybersecurity. Ich entwickle intelligente Systeme mit RAG, agentischer KI und LLM-Pipelines und arbeite dabei unter anderem mit LangChain, PyTorch, FastAPI, Redis und BullMQ. Ich habe End-to-End-KI-Lösungen entwickelt und deployed, von adaptiven E-Learning-Plattformen bis zu industriellen Energiesystemen. In meinen Praktika habe ich frühe KI-Prototypen in stabile Produktplattformen überführt, CI/CD verbessert, Zuverlässigkeit erhöht und skalierbare Architekturen aufgebaut. Zusätzlich habe ich im Bereich Edge AI an autonomen Drohnensystemen mit Computer Vision und SLAM gearbeitet. Mein Ziel ist es, reale Probleme mit KI zu lösen, Prozesse zu optimieren und personalisierte Nutzererlebnisse zu schaffen. Parallel beschäftige ich mich aktiv mit Cybersecurity-Praktiken wie VAPT und sicherem Systemdesign. Ich habe mehrere nationale Hackathons gewonnen, Forschung zu ML-basierter Dokumentenzusammenfassung veröffentlicht und ein KI-basiertes Crowd-Monitoring-System mit über 200.000 Nutzern in Echtzeit mit umgesetzt. Aktuell konzentriere ich mich auf wirkungsstarke KI-Projekte und die Vorbereitung auf weiterführende Forschung und Graduate-Studien in KI und Data Engineering.',
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 24
const cachedByLanguage: Partial<Record<TtsLanguage, { buffer: ArrayBuffer; at: number }>> = {}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { language?: TtsLanguage }
    const language: TtsLanguage = body.language === 'de' ? 'de' : 'en'

    const now = Date.now()
    const cached = cachedByLanguage[language]
    if (cached && now - cached.at < CACHE_TTL_MS) {
      const cachedBlob = new Blob([cached.buffer], { type: 'audio/wav' })
      return new NextResponse(cachedBlob, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-TTS-Cache': `hit-${language}`,
        },
      })
    }

    const apiKey =
      process.env.Sarvam_Api ||
      process.env.SARVAM_API_KEY ||
      process.env.SARVAM_API

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Sarvam API key is missing in environment variables.' },
        { status: 500 },
      )
    }

    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        text: ABOUT_ME_TEXT[language],
        target_language_code: language === 'de' ? 'de-DE' : 'en-IN',
        model: 'bulbul:v3',
        speaker: 'varun',
        pace: 1,
      }),
      cache: 'no-store',
    })

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text()
      return NextResponse.json(
        { error: 'Failed to generate speech from Sarvam.', details: errorText },
        { status: sarvamResponse.status },
      )
    }

    const data = (await sarvamResponse.json()) as { audios?: string[] }
    const audioBase64 = data.audios?.[0]

    if (!audioBase64) {
      return NextResponse.json(
        { error: 'Sarvam response did not include audio data.' },
        { status: 502 },
      )
    }

    const decoded = Buffer.from(audioBase64, 'base64')
    const audioBuffer = decoded.buffer.slice(
      decoded.byteOffset,
      decoded.byteOffset + decoded.byteLength,
    ) as ArrayBuffer
    cachedByLanguage[language] = {
      buffer: audioBuffer,
      at: now,
    }

    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })

    return new NextResponse(audioBlob, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-TTS-Cache': `miss-${language}`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json(
      { error: 'Unexpected error while creating speech.', details: message },
      { status: 500 },
    )
  }
}
