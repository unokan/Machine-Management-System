'use client'

import { useState } from 'react'

export default function HomePage() {
  const [machineId, setMachineId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/requests', {
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
        setMessage('✅ บันทึกการแจ้งซ่อมและส่ง LINE เรียบร้อยแล้ว!')
        setMachineId('')
        setTitle('')
        setDescription('')
        setPriority('normal')
      } else {
        setMessage(`❌ เกิดข้อผิดพลาด: ${data.error}`)
      }
    } catch (err) {
      setMessage('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>🛠️ ฟอร์มแจ้งซ่อมบำรุง (MMS)</h2>
      
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>รหัสเครื่องจักร *</label>
          <input
            type="text"
            required
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            placeholder="เช่น MC-01"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>หัวข้อแจ้งซ่อม *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น มอเตอร์มีเสียงดังผิดปกติ"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>รายละเอียดเพิ่มเติม</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายอาการเสียเพิ่มเติม..."
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>ระดับความสำคัญ</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="normal">🟢 ปกติ (Normal)</option>
            <option value="urgent">🟡 ด่วน (Urgent)</option>
            <option value="critical">🔴 ด่วนที่สุด (Critical)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#07c160',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม (ส่ง LINE เตือน)'}
        </button>
      </form>
    </div>
  )
}