import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ABOUT_ME_TEXT =
  "I am Varun Inamdar, a B.Tech student in Artificial Intelligence at Vishwakarma University with a strong focus on building real-world, production-grade AI systems. My work lies at the intersection of AI engineering, scalable backend systems, and cybersecurity. I specialize in developing intelligent systems using RAG, agentic AI, and LLM pipelines, with hands-on experience in tools like LangChain, PyTorch, FastAPI, and distributed systems powered by Redis and BullMQ. I've built and deployed end-to-end AI solutions, from adaptive e-learning platforms and resume analyzers to energy optimization systems for industrial use. Through my internships, I've contributed to transforming early-stage AI prototypes into production-ready platforms, optimizing CICD pipelines, improving system reliability, and designing scalable architectures. My experience also extends to edge AI, where I worked on autonomous drone systems using computer vision and SLAM techniques. I'm particularly interested in solving complex real-world problems using AI, whether it's improving operational efficiency, enabling intelligent automation, or building personalized user experiences. Alongside this, I actively explore cybersecurity practices including VAPT and secure system design. I've won multiple national-level hackathons, published research in ML-based document summarization, and led impactful deployments like an AI-based crowd monitoring system handling over 200,000 users in real-time. Currently, I'm focused on building high-impact AI projects and preparing for advanced research and graduate studies in AI and Data Engineering."

const outputPath = resolve('public/audio/about-me.wav')
const force = process.argv.includes('--force')

function loadDotEnv() {
  const envPath = resolve('.env')
  if (!existsSync(envPath)) {
    return
  }

  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')
    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function main() {
  loadDotEnv()

  if (!force && existsSync(outputPath)) {
    console.log(`Audio already exists at ${outputPath}. Use --force to regenerate.`)
    return
  }

  const apiKey =
    process.env.Sarvam_Api ||
    process.env.SARVAM_API_KEY ||
    process.env.SARVAM_API

  if (!apiKey) {
    throw new Error('Sarvam API key missing. Add Sarvam_Api (or SARVAM_API_KEY) to .env')
  }

  const startedAt = Date.now()

  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
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
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Sarvam API failed (${response.status}): ${details}`)
  }

  const data = await response.json()
  const audioBase64 = data?.audios?.[0]

  if (!audioBase64) {
    throw new Error('Sarvam response did not include audio data')
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64')
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, audioBuffer)

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2)
  console.log(`Generated ${outputPath} (${audioBuffer.length} bytes) in ${elapsed}s`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
