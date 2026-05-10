'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/AvatarUpload'
import ProfileFields from '@/components/ProfileFields'
import type { Profile } from '@/types'

type Props = {
  profile: Profile
  email: string
}

export default function ProfileForm({ profile, email }: Props) {
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [fields, setFields] = useState({
  phone: profile.phone,
  region: profile.region,
  age: profile.age?.toString() ?? '',
  jobTitle: profile.job_title,
  gender: profile.gender ?? '',
  therapistYears: profile.therapist_years?.toString() ?? '',
})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleFieldChange(field: string, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.phone || !fields.region) {
      setError('電話番号と地域は必須です')
      return
    }
    setLoading(true)
    setError('')
    setSaved(false)

    const { error: err } = await supabase
  .from('profiles')
  .update({
    display_name: displayName,
    bio,
    avatar_url: avatarUrl,
    phone: fields.phone,
    region: fields.region,
    age: fields.age ? parseInt(fields.age) : null,
    job_title: fields.jobTitle,
    gender: fields.gender,
    therapist_years: fields.therapistYears ? parseInt(fields.therapistYears) : null,
  })
  .eq('id', profile.id)

    if (err) {
      setError('保存に失敗しました。もう一度お試しください。')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <AvatarUpload
        profileId={profile.id}
        currentUrl={avatarUrl}
        onUpload={setAvatarUrl}
      />

      {/* 表示名 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">表示名</label>
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          placeholder="山田 太郎"
        />
      </div>

      {/* 自己紹介 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">自己紹介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 resize-none"
          placeholder="自己紹介文を入力してください"
        />
      </div>

      <ProfileFields
  region={fields.region}
  age={fields.age}
  phone={fields.phone}
  jobTitle={fields.jobTitle}
  email={email}
  gender={fields.gender}
  therapistYears={fields.therapistYears}
  showJobTitle={true}
  showTherapistFields={true}
  onChange={handleFieldChange}
/>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-30 transition"
      >
        {loading ? '保存中...' : saved ? '保存しました ✓' : '保存する'}
      </button>
    </form>
  )
}