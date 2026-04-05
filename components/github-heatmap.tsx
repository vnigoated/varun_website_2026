'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { addDays, format, startOfYear, endOfYear } from 'date-fns'
import { AlertCircle, ArrowUpRight, CalendarDays, Github, Loader2 } from 'lucide-react'
import type { Activity } from 'react-activity-calendar'

import { githubConfig } from '@/config/Github'

type HeatmapLanguage = 'en' | 'de'

const heatmapI18n: Record<
  HeatmapLanguage,
  {
    title: string
    subtitle: string
    totalCountTemplate: string
    less: string
    more: string
    thisYear: string
    viewOnGithub: string
    errorTitle: string
    errorDescription: string
    errorButton: string
  }
> = {
  en: {
    title: 'GitHub Activity',
    subtitle: 'coding journey going in 2026',
    totalCountTemplate: '{{count}} contributions in {{year}}',
    less: 'Less',
    more: 'More',
    thisYear: '{{count}} contributions this year',
    viewOnGithub: 'View on GitHub',
    errorTitle: githubConfig.errorState.title,
    errorDescription: githubConfig.errorState.description,
    errorButton: githubConfig.errorState.buttonText,
  },
  de: {
    title: 'GitHub-Aktivität',
    subtitle: 'Coding-Reise im Jahr 2026',
    totalCountTemplate: '{{count}} Beiträge in {{year}}',
    less: 'Weniger',
    more: 'Mehr',
    thisYear: '{{count}} Beiträge in diesem Jahr',
    viewOnGithub: 'Auf GitHub ansehen',
    errorTitle: 'GitHub-Beiträge konnten nicht geladen werden',
    errorDescription: 'Schau dir mein Profil direkt an, um die neuesten Aktivitäten zu sehen.',
    errorButton: 'Auf GitHub ansehen',
  },
}

const ActivityCalendar = dynamic(
  () => import('react-activity-calendar').then((module) => module.ActivityCalendar),
  {
    ssr: false,
    loading: () => <HeatmapLoadingState />,
  }
)

type ContributionLevel = 0 | 1 | 2 | 3 | 4

type ApiContribution = {
  date?: string
  count?: number
  contributionCount?: number
  level?: string | number
  contributionLevel?: string | number
}

type ApiResponse = {
  data?: {
    contributions?: unknown
  }
  contributions?: unknown
}

const LEVEL_MAP: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

function HeatmapLoadingState() {
  return (
    <div className="rounded-3xl border border-[#dccbb9] bg-white p-4 shadow-[0_18px_60px_rgba(139,94,60,0.08)]">
      <div className="animate-pulse space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-[#ece3d8]" />
            <div className="h-5 w-48 rounded-full bg-[#ece3d8]" />
            <div className="h-3 w-56 rounded-full bg-[#f1e9df]" />
          </div>
          <div className="h-8 w-20 rounded-full bg-[#ece3d8]" />
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 49 }).map((_, index) => (
            <div key={index} className="h-3 rounded-sm bg-[#f0e7dd]" />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="h-4 w-40 rounded-full bg-[#ece3d8]" />
          <div className="h-10 w-32 rounded-full bg-[#ece3d8]" />
        </div>
      </div>
    </div>
  )
}

function HeatmapErrorState({ message, language }: { message: string; language: HeatmapLanguage }) {
  const profileUrl = `https://github.com/${githubConfig.username}`
  const text = heatmapI18n[language]

  return (
    <div className="rounded-3xl border border-[#dccbb9] bg-white p-3 shadow-[0_18px_60px_rgba(139,94,60,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4e9de] text-[#8b5e3c]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{text.errorTitle}</h3>
          <p className="text-sm text-muted-foreground">{message || text.errorDescription}</p>
          <Link
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f492f]"
          >
            {text.errorButton}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function flattenContributions(input: unknown, bucket: ApiContribution[] = []): ApiContribution[] {
  if (Array.isArray(input)) {
    for (const item of input) {
      flattenContributions(item, bucket)
    }
    return bucket
  }

  if (input && typeof input === 'object') {
    const value = input as ApiContribution
    if (value.date) {
      bucket.push(value)
      return bucket
    }

    for (const nestedValue of Object.values(input as Record<string, unknown>)) {
      flattenContributions(nestedValue, bucket)
    }
  }

  return bucket
}

function normalizeLevel(level: string | number | undefined): ContributionLevel {
  if (typeof level === 'number') {
    return Math.max(0, Math.min(4, level)) as ContributionLevel
  }

  if (typeof level === 'string' && level in LEVEL_MAP) {
    return LEVEL_MAP[level]
  }

  return 0
}

function buildYearActivities(contributions: ApiContribution[], year: number) {
  const startDate = startOfYear(new Date(year, 0, 1))
  const endDate = endOfYear(new Date(year, 0, 1))
  const contributionMap = new Map<string, { count: number; level: ContributionLevel }>()

  for (const contribution of contributions) {
    if (!contribution.date) {
      continue
    }

    const normalizedDate = contribution.date.slice(0, 10)
    if (!normalizedDate.startsWith(String(year))) {
      continue
    }

    const current = contributionMap.get(normalizedDate) ?? { count: 0, level: 0 }
    const count = contribution.count ?? contribution.contributionCount ?? 0
    const level = normalizeLevel(contribution.level ?? contribution.contributionLevel)

    contributionMap.set(normalizedDate, {
      count: current.count + count,
      level: Math.max(current.level, level) as ContributionLevel,
    })
  }

  const filledActivities: Activity[] = []
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dateKey = format(date, 'yyyy-MM-dd')
    const entry = contributionMap.get(dateKey) ?? { count: 0, level: 0 as ContributionLevel }

    filledActivities.push({
      date: dateKey,
      count: entry.count,
      level: entry.level,
    })
  }

  return filledActivities
}

export function GithubHeatmap({ language = 'en' }: { language?: HeatmapLanguage }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [totalContributions, setTotalContributions] = useState(0)

  const currentYear = new Date().getFullYear()
  const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const text = heatmapI18n[language]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    const loadContributions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${githubConfig.apiUrl}${githubConfig.username}.json`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch contribution data (${response.status})`)
        }

        const payload = (await response.json()) as ApiResponse
        const flattened = flattenContributions(payload.data?.contributions ?? payload.contributions)
        const yearActivities = buildYearActivities(flattened, currentYear)

        setActivities(yearActivities)
        setTotalContributions(yearActivities.reduce((sum, item) => sum + item.count, 0))
      } catch (fetchError) {
        if (abortController.signal.aborted) {
          return
        }

        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unable to load contributions'
        setError(errorMessage)
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadContributions()

    return () => {
      abortController.abort()
    }
  }, [currentYear])

  const labels = useMemo(
    () => ({
      months: githubConfig.labels.months,
      weekdays: githubConfig.labels.weekdays,
      totalCount: text.totalCountTemplate
        .replace('{{count}}', String(totalContributions))
        .replace('{{year}}', String(currentYear)),
      legend: {
        less: text.less,
        more: text.more,
      },
    }),
    [currentYear, totalContributions, text]
  )

  if (!mounted || loading) {
    return <HeatmapLoadingState />
  }

  if (error) {
    return <HeatmapErrorState message={error} language={language} />
  }

  return (
    <section className="rounded-3xl border border-[#dccbb9] bg-white p-3 shadow-[0_18px_60px_rgba(139,94,60,0.08)] md:p-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{text.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{text.subtitle}</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#f3e8dd] px-3 py-1.5 text-xs font-medium text-[#7a5a45]">
          <CalendarDays className="h-3.5 w-3.5" />
          {currentYear}
        </div>
      </div>

      <div className="overflow-x-auto">
          <ActivityCalendar
          data={activities}
          colorScheme={colorScheme}
          theme={githubConfig.theme}
          labels={labels}
          blockSize={9}
          blockMargin={2}
          fontSize={10}
          maxLevel={githubConfig.maxLevel}
          showMonthLabels
          showWeekdayLabels
          showTotalCount
          weekStart={1}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{text.thisYear.replace('{{count}}', String(totalContributions))}</span>
        <Link
          href={`https://github.com/${githubConfig.username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-4 py-2 font-medium text-white transition-colors hover:bg-[#6f492f]"
        >
          <Github className="h-4 w-4" />
          {text.viewOnGithub}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}