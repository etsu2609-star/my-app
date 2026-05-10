'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types'

type Props = {
  profileId: string
  initialTags: Tag[]
  allTags: Tag[]
}

export default function TagEditor({ profileId, initialTags, allTags }: Props) {
  const supabase = createClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialTags.map((t) => t.id))
  )
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(tag: Tag) {
    const nextIds = new Set(selectedIds)
    const nextTags = [...selectedTags]

    if (nextIds.has(tag.id)) {
      nextIds.delete(tag.id)
      setSelectedTags(nextTags.filter((t) => t.id !== tag.id))
    } else {
      nextIds.add(tag.id)
      setSelectedTags([...nextTags, tag])
    }
    setSelectedIds(nextIds)
  }

  async function save() {
    setSaving(true)
    setSaved(false)

    await supabase
      .from('profile_tags')
      .delete()
      .eq('profile_id', profileId)

    if (selectedIds.size > 0) {
      await supabase
        .from('profile_tags')
        .insert(
          [...selectedIds].map((tag_id) => ({ profile_id: profileId, tag_id }))
        )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const filteredTags = allTags.filter((t) => t.name.includes(tagInput))

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-600">タグ</label>

      {/* 選択済みタグ */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTags.length === 0 ? (
          <p className="text-sm text-gray-400">タグが設定されていません</p>
        ) : (
          selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {tag.name}
              <button
                onClick={() => toggle(tag)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* ドロップダウンでタグ追加 */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition"
          >
            <span>タグを追加</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-72 border rounded-xl bg-white shadow-lg z-20 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="タグを絞り込む..."
                  className="w-full px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-gray-300"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredTags.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">見つかりません</p>
                ) : (
                  filteredTags.map((tag) => {
                    const selected = selectedIds.has(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                          selected ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'
                        }`}
                      >
                        {tag.name}
                        {selected && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7L5.5 10.5L12 3.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-30 transition"
        >
          {saving ? '保存中...' : saved ? '保存しました ✓' : 'タグを保存'}
        </button>

        <span className="text-xs text-gray-400">{selectedIds.size}件選択中</span>
      </div>
    </div>
  )
}