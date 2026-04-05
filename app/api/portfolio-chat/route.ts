import { NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import PDFParser from 'pdf2json'

export const runtime = 'nodejs'

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

const PROFILE_QUERY = 'varun inamdar vishwakrma university'
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 60 * 6
const RESUME_CACHE_TTL_MS = 1000 * 60 * 10
const PROJECTS_CACHE_TTL_MS = 1000 * 60 * 10
const VECTOR_DIM = 256

let cachedSearchContext = ''
let cachedSearchAt = 0

let cachedResumeAt = 0
let cachedResumeFile = ''
let cachedResumeChunks: string[] = []
let cachedResumeVectors: number[][] = []

let cachedProjectsAt = 0
let cachedProjectChunks: string[] = []
let cachedProjectVectors: number[][] = []

function isProjectQuestion(query: string) {
  const lower = query.toLowerCase()
  const projectTerms = [
    'project',
    'projects',
    'build',
    'built',
    'portfolio',
    'gradeu',
    'diet',
    'skoda',
    'callcomply',
    'cyber',
    'coedit',
    'github',
    'demo',
  ]
  return projectTerms.some((term) => lower.includes(term))
}

function extractProjectBlocksFromSource(source: string) {
  const listStart = source.indexOf('const projects = [')
  if (listStart === -1) {
    return []
  }

  const listEnd = source.indexOf('\n]\n\nexport function', listStart)
  const projectsList = listEnd > listStart ? source.slice(listStart, listEnd) : source.slice(listStart)

  const objectBlocks = projectsList.match(/\{[\s\S]*?githubUrl:\s*'[^']*'[\s\S]*?\}/g) ?? []

  return objectBlocks
    .map((block) =>
      block
        .replace(/\s+/g, ' ')
        .replace(/\b(icon|featured|videoUrl|videoAutoplay|imageUrl):\s*[^,]+,?/g, '')
        .replace(/[{}]/g, '')
        .replace(/\s+,/g, ',')
        .trim(),
    )
    .filter(Boolean)
}

function buildProjectsVectorStore() {
  const now = Date.now()
  if (
    cachedProjectChunks.length > 0 &&
    cachedProjectVectors.length > 0 &&
    now - cachedProjectsAt < PROJECTS_CACHE_TTL_MS
  ) {
    return
  }

  const projectsPath = join(process.cwd(), 'components', 'projects-section.tsx')
  const source = readFileSync(projectsPath, 'utf-8')
  const projectBlocks = extractProjectBlocksFromSource(source)

  if (projectBlocks.length === 0) {
    cachedProjectChunks = ['No project entries could be parsed from components/projects-section.tsx.']
    cachedProjectVectors = [embedText(cachedProjectChunks[0])]
    cachedProjectsAt = now
    return
  }

  cachedProjectChunks = projectBlocks
  cachedProjectVectors = projectBlocks.map((item) => embedText(item))
  cachedProjectsAt = now
}

function getProjectsContext(query: string, topK = 4) {
  buildProjectsVectorStore()

  const queryVec = embedText(query)
  const scored = cachedProjectVectors
    .map((vector, idx) => ({
      idx,
      score: cosineSimilarity(queryVec, vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  const lines = scored
    .filter((item) => item.score > 0)
    .map((item, rank) => `(${rank + 1}) ${cachedProjectChunks[item.idx]}`)

  return lines.join('\n\n')
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

function hashToken(token: string) {
  let hash = 0
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0
  }
  return hash
}

function embedText(text: string) {
  const vec = new Array<number>(VECTOR_DIM).fill(0)
  const tokens = tokenize(text)
  if (tokens.length === 0) {
    return vec
  }

  for (const token of tokens) {
    const idx = hashToken(token) % VECTOR_DIM
    vec[idx] += 1
  }

  const norm = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1
  return vec.map((value) => value / norm)
}

function cosineSimilarity(a: number[], b: number[]) {
  let score = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    score += a[i] * b[i]
  }
  return score
}

function splitIntoChunks(text: string, wordsPerChunk = 130, overlap = 26) {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []

  if (words.length === 0) {
    return chunks
  }

  let index = 0
  while (index < words.length) {
    const slice = words.slice(index, index + wordsPerChunk)
    chunks.push(slice.join(' '))
    if (index + wordsPerChunk >= words.length) {
      break
    }
    index += wordsPerChunk - overlap
  }

  return chunks
}

async function buildResumeVectorStore() {
  const now = Date.now()
  if (
    cachedResumeChunks.length > 0 &&
    cachedResumeVectors.length > 0 &&
    now - cachedResumeAt < RESUME_CACHE_TTL_MS
  ) {
    return
  }

  const uploadDir = join(process.cwd(), 'upload')
  const files = readdirSync(uploadDir)
  const pdfFile = files.find((file) => extname(file).toLowerCase() === '.pdf')

  if (!pdfFile) {
    throw new Error('No resume PDF found in upload folder.')
  }

  const fullPath = join(uploadDir, pdfFile)
  const fileBuffer = readFileSync(fullPath)
  const extractedText = await new Promise<string>((resolve, reject) => {
    const parser = new PDFParser(undefined, true)

    parser.on('pdfParser_dataError', (errorData: Error | { parserError: Error }) => {
      if (errorData instanceof Error) {
        reject(errorData)
        return
      }

      reject(errorData?.parserError ?? new Error('PDF parsing failed'))
    })

    parser.on('pdfParser_dataReady', (pdfData: any) => {
      const pages = Array.isArray(pdfData?.Pages) ? pdfData.Pages : []

      const pageText = pages
        .map((page: any) => {
          const texts = Array.isArray(page?.Texts) ? page.Texts : []
          return texts
            .map((textNode: any) => {
              const runs = Array.isArray(textNode?.R) ? textNode.R : []
              return runs
                .map((run: any) => {
                  const encoded = typeof run?.T === 'string' ? run.T : ''
                  try {
                    return decodeURIComponent(encoded)
                  } catch {
                    return encoded
                  }
                })
                .join(' ')
            })
            .join(' ')
        })
        .join('\n')

      resolve(pageText)
    })

    parser.parseBuffer(fileBuffer)
  })

  const cleanText = extractedText.replace(/\s+/g, ' ').trim()

  if (!cleanText) {
    throw new Error('Resume PDF text could not be extracted.')
  }

  const chunks = splitIntoChunks(cleanText)
  const vectors = chunks.map((chunk) => embedText(chunk))

  cachedResumeFile = pdfFile
  cachedResumeChunks = chunks
  cachedResumeVectors = vectors
  cachedResumeAt = now
}

async function getResumeContext(query: string, topK = 5) {
  await buildResumeVectorStore()

  const queryVec = embedText(query)
  const scored = cachedResumeVectors
    .map((vector, idx) => ({
      idx,
      score: cosineSimilarity(queryVec, vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  const lines = scored
    .filter((item) => item.score > 0)
    .map((item, rank) => `(${rank + 1}) ${cachedResumeChunks[item.idx]}`)

  return {
    fileName: cachedResumeFile,
    context: lines.join('\n\n'),
  }
}

async function buildSearchContext() {
  const now = Date.now()
  if (cachedSearchContext && now - cachedSearchAt < SEARCH_CACHE_TTL_MS) {
    return cachedSearchContext
  }

  const serpApiKey = process.env.SERP_API || process.env.SERPAPI_API_KEY
  if (!serpApiKey) {
    throw new Error('SERP API key is missing in environment variables.')
  }

  const searchUrl = new URL('https://serpapi.com/search.json')
  searchUrl.searchParams.set('q', PROFILE_QUERY)
  searchUrl.searchParams.set('hl', 'en')
  searchUrl.searchParams.set('gl', 'in')
  searchUrl.searchParams.set('num', '6')
  searchUrl.searchParams.set('api_key', serpApiKey)

  const serpResponse = await fetch(searchUrl, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!serpResponse.ok) {
    const details = await serpResponse.text()
    throw new Error(`SerpAPI request failed (${serpResponse.status}): ${details}`)
  }

  const serpData = (await serpResponse.json()) as {
    organic_results?: Array<{
      title?: string
      snippet?: string
      link?: string
    }>
    answer_box?: {
      title?: string
      snippet?: string
    }
  }

  const lines: string[] = []

  if (serpData.answer_box?.title || serpData.answer_box?.snippet) {
    lines.push(
      `Answer box: ${serpData.answer_box.title ?? ''} ${serpData.answer_box.snippet ?? ''}`.trim(),
    )
  }

  const organic = serpData.organic_results ?? []
  for (const result of organic.slice(0, 5)) {
    const title = result.title ?? 'Untitled'
    const snippet = result.snippet ?? 'No snippet available.'
    const link = result.link ?? ''
    lines.push(`- ${title}\n  ${snippet}${link ? `\n  Source: ${link}` : ''}`)
  }

  const context = lines.join('\n')
  cachedSearchContext = context
  cachedSearchAt = now
  return context
}

export async function POST(req: Request) {
  try {
    const groqApiKey = process.env.Groq_Api || process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Groq API key is missing in environment variables.' },
        { status: 500 },
      )
    }

    const body = (await req.json()) as { messages?: ChatMessage[]; language?: 'en' | 'de' }
    const incomingMessages = body.messages ?? []
    const language = body.language === 'de' ? 'de' : 'en'

    const cleanedMessages = incomingMessages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
      .map((m) => ({ role: m.role, content: m.text.trim() }))
      .filter((m) => m.content.length > 0)
      .slice(-12)

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
    }

    const lastUserPrompt =
      [...cleanedMessages].reverse().find((msg) => msg.role === 'user')?.content ||
      cleanedMessages[cleanedMessages.length - 1].content

    const includeProjects = isProjectQuestion(lastUserPrompt)

    const [resumeContextResult, searchContext] = await Promise.all([
      getResumeContext(lastUserPrompt, 6),
      buildSearchContext(),
    ])

    const projectsContext = includeProjects ? getProjectsContext(lastUserPrompt, 5) : ''

    const systemPrompt = [
      'You are Varun Inamdar speaking as himself in first person.',
      language === 'de'
        ? 'Respond strictly in German (Deutsch), even if source context is in English.'
        : 'Respond strictly in English.',
      'Do not mix languages in the same response.',
      'Answer based on available resume context first, then use search context only as secondary support.',
      'Always use first-person pronouns: I, me, my. Never refer to Varun in third person.',
      'Keep answers precise and compact: 3-5 bullet points maximum when asked for capabilities or tech stack.',
      'Format neatly with short sections, line breaks, and bullets for readability.',
      'Use plain text only. Do not use markdown syntax such as **, #, or code blocks.',
      'Use this bullet symbol: •',
      'Preferred response structure for most queries:',
      '1) One-line direct answer.',
      '2) Bullet points with concrete details.',
      'For project deep-dive queries, use this exact section order:',
      language === 'de' ? 'Projekt' : 'Project',
      language === 'de' ? 'Überblick' : 'Overview',
      language === 'de' ? 'Kernfunktionen' : 'Key Features',
      language === 'de' ? 'Tech-Stack' : 'Tech Stack',
      language === 'de' ? 'Anwendungsfälle' : 'Use Cases',
      language === 'de' ? 'Links' : 'Links',
      'In Links, include Live Demo and GitHub if available in provided project context.',
      'Ensure each section is on its own line with a blank line between sections.',
      'Do not speculate. If details are missing in resume context, explicitly say: "Not listed in provided resume."',
      'Prefer concrete tools, projects, achievements, and measurable outcomes from context.',
      '',
      `Primary resume source: ${resumeContextResult.fileName}`,
      'Relevant resume context:',
      resumeContextResult.context || 'No relevant resume chunks retrieved.',
      '',
      'Project context from codebase file components/projects-section.tsx:',
      includeProjects
        ? projectsContext || 'Project query detected, but no relevant project snippets were retrieved.'
        : 'Not requested for this query.',
      '',
      'Profile context from search:',
      searchContext || 'No search context returned.',
    ].join('\n')

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.15,
        max_tokens: 320,
        messages: [{ role: 'system', content: systemPrompt }, ...cleanedMessages],
      }),
      cache: 'no-store',
    })

    if (!groqResponse.ok) {
      const details = await groqResponse.text()
      return NextResponse.json(
        { error: 'Groq request failed.', details },
        { status: groqResponse.status },
      )
    }

    const groqData = (await groqResponse.json()) as {
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
    }

    const reply = groqData.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json(
        { error: 'Groq returned an empty response.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    return NextResponse.json(
      { error: 'Failed to process portfolio chat request.', details: message },
      { status: 500 },
    )
  }
}
