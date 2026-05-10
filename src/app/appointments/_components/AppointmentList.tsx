'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Appointment = {
  id: string
  starts_at: string
  ends_at: string
  status: 'pending' | 'confirmed' | 'cancelled'
  note: string
  employee: { display_name: string; job_title: string } | null
  user: { display_name: string } | null
}

type Props = {
  upcoming: Appointment[]
  archived: Appointment[]
  role: string
}

const statusLabel: Record<string, string> = {
  pending:   '確認待ち',
  confirmed: '確定',
  cancelled: 'キャンセル',
}

const statusColor: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

export default function AppointmentList({ upcoming, archived, role }: Props) {
  const supabase = createClient()
  const [upcomingItems, setUpcomingItems] = useState<Appointment[]>(upcoming)
  const [showArchive, setShowArchive] = useState(false)

  async function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)

    if (error) return

    if (status === 'confirmed') {
      await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
    }

    setUpcomingItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* タブ切り替え（モバイル） */}
      <div className="flex sm:hidden rounded-lg border overflow-hidden text-sm">
        {(['upcoming', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setShowArchive(tab === 'archived')}
            className={`flex-1 py-2 transition ${
              (tab === 'archived') === showArchive
                ? 'bg-black text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            {tab === 'upcoming'
              ? `予定（${upcomingItems.length}件）`
              : `アーカイブ（${archived.length}件）`}
          </button>
        ))}
      </div>

      {/* 2カラムレイアウト（デスクトップ） */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-8">

        {/* 左：予定 */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            予定（{upcomingItems.length}件）
          </h2>
          {upcomingItems.length === 0 ? (
            <p className="text-gray-400 text-sm">予定はありません</p>
          ) : (
            <div className="flex flex-col gap-4">
              {upcomingItems.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  role={role}
                  onUpdateStatus={updateStatus}
                />
              ))}
            </div>
          )}
        </section>

        {/* 右：アーカイブ */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            アーカイブ（{archived.length}件）
          </h2>
          {archived.length === 0 ? (
            <p className="text-gray-400 text-sm">アーカイブはありません</p>
          ) : (
            <div className="flex flex-col gap-4">
              {archived.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  role={role}
                  onUpdateStatus={updateStatus}
                  isArchived
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* モバイル：選択中のタブのみ表示 */}
      <div className="sm:hidden">
        {!showArchive ? (
          <section>
            {upcomingItems.length === 0 ? (
              <p className="text-gray-400 text-sm">予定はありません</p>
            ) : (
              <div className="flex flex-col gap-4">
                {upcomingItems.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    apt={apt}
                    role={role}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            {archived.length === 0 ? (
              <p className="text-gray-400 text-sm">アーカイブはありません</p>
            ) : (
              <div className="flex flex-col gap-4">
                {archived.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    apt={apt}
                    role={role}
                    onUpdateStatus={updateStatus}
                    isArchived
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function AppointmentCard({
  apt, role, onUpdateStatus, isArchived = false,
}: {
  apt: Appointment
  role: string
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void
  isArchived?: boolean
}) {
  const start = new Date(apt.starts_at)
  const end = new Date(apt.ends_at)

  return (
    <div className={`border rounded-xl p-5 flex flex-col gap-3 ${isArchived ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {start.toLocaleDateString('ja-JP', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
            })}
          </p>
          <p className="text-sm text-gray-500">
            {start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            {' 〜 '}
            {end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[apt.status]}`}>
          {statusLabel[apt.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {role === 'employee'
          ? `利用者：${apt.user?.display_name ?? '不明'}`
          : `担当：${apt.employee?.display_name ?? '不明'}（${apt.employee?.job_title ?? ''}）`}
      </p>

      {apt.note && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          {apt.note}
        </p>
      )}

      {role === 'employee' && apt.status === 'pending' && !isArchived && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onUpdateStatus(apt.id, 'confirmed')}
            className="flex-1 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            確定する
          </button>
          <button
            onClick={() => onUpdateStatus(apt.id, 'cancelled')}
            className="flex-1 py-2 text-sm rounded-lg border hover:bg-gray-50 transition"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  )
}