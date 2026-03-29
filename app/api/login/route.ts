import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, adminCode } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  // User not found → create access request
  if (!user) {
    await supabase.from('access_requests').insert({ email: email.toLowerCase() })

    return NextResponse.json(
      {
        status: 'requested',
        message:
          'Your email has been sent to the commissioner. You’ll be able to enter your bracket once you’re on the roster.'
      },
      { status: 200 }
    )
  }

  // Admin but no code yet → ask for code
  if (user.is_admin && !adminCode) {
    return NextResponse.json(
      {
        status: 'needsAdminCode',
        message: 'Enter your 4-digit admin code to continue.'
      },
      { status: 200 }
    )
  }

  // Admin with wrong code
  if (user.is_admin && adminCode && adminCode !== user.admin_code) {
    return NextResponse.json(
      {
        status: 'invalidAdminCode',
        message: 'That code doesn’t match. Try again.'
      },
      { status: 401 }
    )
  }

  // Normal user OR admin with correct code
  const sessionPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: !!user.is_admin
  }

  // Correct cookie handling for Route Handlers
  const cookieStore = await cookies()

  cookieStore.set('mm_session', JSON.stringify(sessionPayload), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  })

  return NextResponse.json(
    {
      status: 'ok',
      isAdmin: !!user.is_admin
    },
    { status: 200 }
  )
}
