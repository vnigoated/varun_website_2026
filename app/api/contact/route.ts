import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(320),
  message: z.string().trim().min(10, 'Please add a short message.').max(5000),
})

function buildMailtoUrl(name: string, email: string, message: string) {
  const subject = encodeURIComponent(`Portfolio contact from ${name}`)
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)

  return `mailto:${process.env.CONTACT_TO_EMAIL ?? 'vninamdar03@gmail.com'}?subject=${subject}&body=${body}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function hasSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  return Boolean(host && port && user && password)
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form fields.' },
      { status: 400 },
    )
  }

  const { name, email, message } = parsed.data

  if (!hasSmtpConfig()) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'smtp-not-configured',
        mailtoUrl: buildMailtoUrl(name, email, message),
      },
      { status: 501 },
    )
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT)
  const user = process.env.SMTP_USER as string
  const password = process.env.SMTP_PASSWORD as string
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const from = process.env.CONTACT_FROM_EMAIL ?? user
  const to = process.env.CONTACT_TO_EMAIL ?? 'vninamdar03@gmail.com'

  if (!host || Number.isNaN(port) || port <= 0) {
    return NextResponse.json({ error: 'SMTP is configured incorrectly.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
  })

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 16px;">New portfolio message</h2>
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 16px 0 8px;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Failed to send message.'
    return NextResponse.json({ error: messageText }, { status: 500 })
  }
}