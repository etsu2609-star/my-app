'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import type { Tag } from '@/types'

type Props = {
  initialQ: string
  initialTags: string[]
  allTags: Tag[]
}

export default function SearchBar({ initialQ, initialTags, allTags }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(initialQ)
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set(initialTags))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function search(newQ: string, newTags: Set<string>) {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newTags.size > 0) params.set('tags', [...newTags].join(','))
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleTagToggle(tagName: string) {
    const next = new Set(activeTags)
    if (next.has(tagName)) {
      next.delete(tagName)
    } else {
      next.add(tagName)
    }
    setActiveTags(next)
    search(q, next)
  }

  function handleClear() {
    setQ('')
    setActiveTags(new Set())
    setTagInput('')
    router.push(pathname)
  }

  const filteredTags = allTags.filter(
    (t) => t.name.includes(tagInput)
  )

  return (
    <div className="flex flex-col gap-3">
      {/* テキスト検索 + タグドロップダウン */}
      <div className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search(q, activeTags)}
          placeholder="名前・肩書き・自己紹介・地域で検索..."
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gray-300"
        />

        {/* タグ選択ドロップダウン */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition ${
              activeTags.size > 0 ? 'border-black' : 'hover:bg-gray-50'
            }`}
          >
            <span>タグ</span>
            {activeTags.size > 0 && (
              <span className="w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">
                {activeTags.size}
              </span>
            )}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 border rounded-xl bg-white shadow-lg z-20 overflow-hidden">
              {/* タグ内検索 */}
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

              {/* タグ一覧 */}
              <div className="max-h-60 overflow-y-auto">
                {filteredTags.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">見つかりません</p>
                ) : (
                  filteredTags.map((tag) => {
                    const selected = activeTags.has(tag.name)
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.name)}
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

              {/* 選択中タグをクリア */}
              {activeTags.size > 0 && (
                <div className="p-2 border-t">
                  <button
                    onClick={() => {
                      setActiveTags(new Set())
                      search(q, new Set())
                    }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition"
                  >
                    タグ選択をクリア
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => search(q, activeTags)}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition"
        >
          検索
        </button>

        {(q || activeTags.size > 0) && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 border rounded-xl text-sm hover:bg-gray-50 transition"
          >
            クリア
          </button>
        )}
      </div>

      {/* 選択中タグのバッジ表示 */}
      {activeTags.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...activeTags].map((tagName) => (
            <span
              key={tagName}
              className="flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-xs"
            >
              {tagName}
              <button
                onClick={() => handleTagToggle(tagName)}
                className="hover:opacity-70 transition"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}