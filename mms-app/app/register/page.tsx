'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // ตรวจสอบความยาวรหัสผ่านฝั่ง Client ก่อน
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 🔹 กำหนด Default Role เป็น Technician เมื่อสมัครใหม่
        data: {
          role: 'Technician',
        },
      },
    })

    if (signUpError) {
      // แปลข้อความ Error ภาษาอังกฤษเป็นภาษาไทย
      if (signUpError.message.includes('already registered')) {
        setError('อีเมลนี้ถูกใช้งานในระบบแล้ว')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
    } else {
      alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          สมัครสมาชิก MMS
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}