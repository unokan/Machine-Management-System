import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

// ใส่ไว้ด้านใน Component หน้าแจ้งซ่อมของคุณ:
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

// นำปุ่มนี้ไปวางใน JSX ตรงส่วนบนของหน้าจอ:
<div className="flex justify-between items-center mb-6">
  <h1 className="text-xl font-bold">🛠️ ฟอร์มแจ้งซ่อมบำรุง (MMS)</h1>
  <button
    onClick={handleLogout}
    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md transition"
  >
    ออกจากระบบ
  </button>
</div>