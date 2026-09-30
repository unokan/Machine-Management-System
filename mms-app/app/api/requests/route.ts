import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import dns from 'node:dns'

// บังคับให้ Node.js ค้นหา DNS ผ่าน IPv4 ก่อนเสมอ (ข้ามปัญหา DNS ของ True/Windows)
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {
  // บล็อกนี้จะทำงานอัตโนมัติหากเวอร์ชัน Node ไม่รองรับ
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { machine_id, title, description, priority } = body

    if (!machine_id || !title) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสเครื่องจักรและหัวข้อการแจ้งซ่อม' },
        { status: 400 }
      )
    }

    // 1. ลองบันทึกข้อมูลลง Supabase
    const supabase = await createClient()
    const { data, error: dbError } = await supabase
      .from('maintenance_requests')
      .insert([
        {
          machine_id,
          title,
          description,
          priority: priority || 'normal',
          status: 'pending',
        },
      ])
      .select()

    if (dbError) {
      console.error('Supabase DB Error:', dbError)
      return NextResponse.json(
        { error: `[Supabase Error] ${dbError.message}` },
        { status: 500 }
      )
    }

    // 2. ส่งข้อความแจ้งเตือนผ่าน LINE Messaging API
    const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    const lineTargetUserId = process.env.LINE_TARGET_USER_ID

    if (lineAccessToken && lineTargetUserId) {
      const priorityText =
        priority === 'critical'
          ? '🔴 ด่วนที่สุด (Critical)'
          : priority === 'urgent'
          ? '🟡 ด่วน (Urgent)'
          : '🟢 ปกติ (Normal)'

      const messageText = `🛠️ แจ้งซ่อมบำรุงใหม่!\n\n📌 รหัสเครื่องจักร: ${machine_id}\n📝 หัวข้อ: ${title}\n📄 รายละเอียด: ${description || '-'}\n⚡ ความสำคัญ: ${priorityText}`

      try {
        const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lineAccessToken.trim()}`,
          },
          body: JSON.stringify({
            to: lineTargetUserId.trim(),
            messages: [{ type: 'text', text: messageText }],
          }),
        })

        if (!lineRes.ok) {
          const lineErrText = await lineRes.text()
          console.error('LINE Response Error:', lineErrText)
          return NextResponse.json({
            success: true,
            message: `บันทึก DB สำเร็จ แต่ LINE ส่งไม่ผ่าน: ${lineErrText}`,
            data,
          })
        }
      } catch (lineErr: any) {
        console.error('LINE Fetch Failed:', lineErr)
        return NextResponse.json({
          success: true,
          message: `บันทึก DB สำเร็จ แต่ยิง LINE ไม่ผ่าน (${lineErr.message})`,
          data,
        })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: `[Connection Error] ${err.message || 'Fetch Failed'}` },
      { status: 500 }
    )
  }
}