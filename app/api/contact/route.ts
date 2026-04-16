export const runtime = "nodejs"

type ContactPayload = {
  name?: string
  email?: string
  message?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL
  const fromEmail = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !toEmail || !fromEmail) {
    return Response.json(
      {
        error:
          "Email sending is not configured yet. Add RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL in Vercel.",
      },
      { status: 500 },
    )
  }

  let payload: ContactPayload

  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = payload.name?.trim() ?? ""
  const email = payload.email?.trim() ?? ""
  const message = payload.message?.trim() ?? ""

  if (!name || !email || !message) {
    return Response.json({ error: "Name, email, and message are required." }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  const html = `
    <h2>New portfolio contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `

  const text = [
    "New portfolio contact message",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n")

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `Portfolio message from ${name}`,
      html,
      text,
      reply_to: email,
    }),
  })

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text()

    return Response.json(
      {
        error: "Unable to send your message right now.",
        details: errorText,
      },
      { status: 502 },
    )
  }

  return Response.json({ success: true })
}
