'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // 🔹 State สำหรับนับจำนวนครั้งที่กรอกรหัสผ่านผิด
  const [failedAttempts, setFailedAttempts] = useState(0)

  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. ตรวจสอบหากถูกล็อกชั่วคราวจากการกรอกผิดเกิน 5 ครั้ง
    if (failedAttempts >= 5) {
      setError('คุณกรอกรหัสผ่านผิดเกิน 5 ครั้ง บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ในอีก 5 นาที')
      return
    }

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const newCount = failedAttempts + 1
      setFailedAttempts(newCount)

      // 2. ดักจับทั้ง Status 429 จาก Supabase Server และการนับจำนวนครั้งฝั่ง Client[cite: 2]
      if (
        newCount >= 5 ||
        authError.status === 429 ||
        authError.message.toLowerCase().includes('too many requests') ||
        authError.message.toLowerCase().includes('rate limit')
      ) {
        setError('คุณกรอกรหัสผ่านผิดเกิน 5 ครั้ง บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ในอีก 5 นาที')
      } else {
        setError(`อีเมลหรือรหัสผ่านไม่ถูกต้อง (ลองแล้ว ${newCount}/5 ครั้ง)`)
      }
      setLoading(false)
    } else {
      // ล็อกอินสำเร็จ: รีเซ็ตค่าการนับ และนำผู้ใช้เข้าสู่ระบบ
      setFailedAttempts(0)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          เข้าสู่ระบบ MMS
        </h2>
        
        {/* กล่องแสดงข้อความเตือนเมื่อเกิด Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="example@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || failedAttempts >= 5}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}