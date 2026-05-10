'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Slot = { starts_at: string; ends_at: string }

type Props = {
  employeeId: string
  currentUserId: string
  existingSlots: Slot[]
}

// 30分刻みの時間帯を生成
function generateTimeSlots() {
  const slots = []
  for (let h = 9; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

function isSlotTaken(date: string, time: string, existingSlots: Slot[]) {
  if (!date || !time) return false
  const start = new Date(`${date}T${time}:00`)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return existingSlots.some((s) => {
    const es = new Date(s.starts_at)
    const ee = new Date(s.ends_at)
    return start < ee && end > es
  })
}

// 今日以降の日付のみ選択可（input[type=date]のmin用）
function todayString() {
  return new Date().toISOString().split('T')[0]
}

export default function AppointmentForm({ employeeId, currentUserId, existingSlots }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = generateTimeSlots()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) return
    setError('')
    setLoading(true)

    const startsAt = new Date(`${date}T${time}:00`)
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)

    const { error: err } = await supabase.from('appointments').insert({
      employee_id: employeeId,
      user_id: currentUserId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      note,
      status: 'pending',
    })

    if (err) {
      setError('予約の作成に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    router.push('/appointments?created=1')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* 日付選択 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">日付</label>
        <input
          type="date"
          required
          min={todayString()}
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime('') }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* 時間選択 */}
      {date && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">時間（30分単位）</label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => {
              const taken = isSlotTaken(date, slot, existingSlots)
              const selected = time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={taken}
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-lg text-sm border transition ${
                    taken
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100'
                      : selected
                      ? 'bg-black text-white border-black'
                      : 'hover:border-gray-400'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 備考 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">備考（任意）</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="相談内容など"
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!date || !time || loading}
        className="py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-30 transition"
      >
        {loading ? '送信中...' : '予約を確定する'}
      </button>
    </form>
  )
}