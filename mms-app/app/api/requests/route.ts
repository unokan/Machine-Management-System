import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const body = await request.json()
    const { machine_id, title, description, priority } = body

    // 1. บันทึกลง Supabase Database
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([{ machine_id, title, description, priority }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 2. ส่งแจ้งเตือนผ่าน LINE Messaging API
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    const userIdOrGroupId = process.env.LINE_USER_ID

    if (channelAccessToken && userIdOrGroupId) {
      const messageText = `🚨 แจ้งซ่อมบำรุงใหม่! (MMS)\n\n🔧 เครื่องจักร: ${machine_id}\n📌 หัวข้อ: ${title}\n📝 รายละเอียด: ${description || '-'}\n⚠️ ความสำคัญ: ${priority}`

      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          to: userIdOrGroupId,
          messages: [
            {
              type: 'text',
              text: messageText,
            },
          ],
        }),
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}