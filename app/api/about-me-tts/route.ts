import { NextResponse } from 'next/server'

const ABOUT_ME_TEXT =
  "I am Varun Inamdar, a B.Tech student in Artificial Intelligence at Vishwakarma University with a strong focus on building real-world, production-grade AI systems. My work lies at the intersection of AI engineering, scalable backend systems, and cybersecurity. I specialize in developing intelligent systems using RAG, agentic AI, and LLM pipelines, with hands-on experience in tools like LangChain, PyTorch, FastAPI, and distributed systems powered by Redis and BullMQ. I've built and deployed end-to-end AI solutions, from adaptive e-learning platforms and resume analyzers to energy optimization systems for industrial use. Through my internships, I've contributed to transforming early-stage AI prototypes into production-ready platforms, optimizing CICD pipelines, improving system reliability, and designing scalable architectures. My experience also extends to edge AI, where I worked on autonomous drone systems using computer vision and SLAM techniques. I'm particularly interested in solving complex real-world problems using AI, whether it's improving operational efficiency, enabling intelligent automation, or building personalized user experiences. Alongside this, I actively explore cybersecurity practices including VAPT and secure system design. I've won multiple national-level hackathons, published research in ML-based document summarization, and led impactful deployments like an AI-based crowd monitoring system handling over 200,000 users in real-time. Currently, I'm focused on building high-impact AI projects and preparing for advanced research and graduate studies in AI and Data Engineering."

const CACHE_TTL_MS = 1000 * 60 * 60 * 24
let cachedAudioBuffer: ArrayBuffer | null = null
let cachedAt = 0

export async function POST() {
  try {
    const now = Date.now()
    if (cachedAudioBuffer && now - cachedAt < CACHE_TTL_MS) {
      const cachedBlob = new Blob([cachedAudioBuffer], { type: 'audio/wav' })
      return new NextResponse(cachedBlob, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-TTS-Cache': 'hit',
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
        text: ABOUT_ME_TEXT,
        target_language_code: 'en-IN',
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
    cachedAudioBuffer = audioBuffer
    cachedAt = now

    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })

    return new NextResponse(audioBlob, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-TTS-Cache': 'miss',
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
