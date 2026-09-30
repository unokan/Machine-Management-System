'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [machineId, setMachineId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // 🔹 ปรับ Endpoint ให้ตรงกับ app/api/maintenance/route.ts
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: machineId,
          title,
          description,
          priority,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('✅ ส่งแจ้งซ่อมเรียบร้อยแล้ว!')
        setMachineId('')
        setTitle('')
        setDescription('')
        setPriority('normal')
      } else {
        setMessage(`❌ เกิดข้อผิดพลาด: ${data.error || 'ไม่สามารถส่งข้อมูลได้'}`)
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg space-y-6">
        
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-gray-800">🛠️️ ฟอร์มแจ้งซ่อมบำรุง (MMS)</h1>
          <button
            onClick={handleLogout}
            type="button"
            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg transition"
          >
            ออกจากระบบ
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              message.startsWith('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสเครื่องจักร *
            </label>
            <input
              type="text"
              required
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              placeholder="เช่น MC-001"
              className="mt-1 w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              หัวข้อแจ้งซ่อม *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เสียงดังผิดปกติที่มอเตอร์"
              className="mt-1 w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
              className="mt-1 w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ระดับความสำคัญ
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-green-500"
            >
              <option value="low">🟢 ปกติ (Low)</option>
              <option value="normal">🟡 ปานกลาง (Normal)</option>
              <option value="high">🟠 ด่วน (High)</option>
              <option value="critical">🔴 ด่วนที่สุด (Critical)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม (ส่ง LINE เตือน)'}
          </button>
        </form>
      </div>
    </div>
  )
}