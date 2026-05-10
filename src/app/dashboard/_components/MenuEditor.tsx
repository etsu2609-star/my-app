'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Menu } from '@/types'

type Props = {
  employeeId: string
  initialMenus: Menu[]
}

export default function MenuEditor({ employeeId, initialMenus }: Props) {
  const supabase = createClient()
  const [menus, setMenus] = useState<Menu[]>(initialMenus)
  const [newTab, setNewTab] = useState('')
  const [tabs, setTabs] = useState<string[]>(
    [...new Set(initialMenus.map((m) => m.tab))].filter(Boolean)
  )
  const [activeTab, setActiveTab] = useState(tabs[0] ?? '')
  const [saving, setSaving] = useState<string | null>(null)

  async function addTab() {
    if (!newTab.trim() || tabs.includes(newTab.trim())) return
    const t = newTab.trim()
    setTabs((prev) => [...prev, t])
    setActiveTab(t)
    setNewTab('')
  }

  async function removeTab(tab: string) {
    // タブ内のメニューをすべて削除
    const ids = menus.filter((m) => m.tab === tab).map((m) => m.id)
    if (ids.length > 0) {
      await supabase.from('menus').delete().in('id', ids)
    }
    setMenus((prev) => prev.filter((m) => m.tab !== tab))
    setTabs((prev) => prev.filter((t) => t !== tab))
    setActiveTab(tabs.find((t) => t !== tab) ?? '')
  }

  async function addMenu(tab: string) {
    const { data, error } = await supabase
      .from('menus')
      .insert({
        employee_id: employeeId,
        tab,
        name: '',
        price: 0,
        description: '',
        sort_order: menus.filter((m) => m.tab === tab).length,
      })
      .select()
      .single()

    if (!error && data) {
      setMenus((prev) => [...prev, data])
    }
  }

  async function updateMenu(id: string, field: keyof Menu, value: string | number) {
    setMenus((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  async function saveMenu(menu: Menu) {
    setSaving(menu.id)
    await supabase
      .from('menus')
      .update({
        name: menu.name,
        price: menu.price,
        description: menu.description,
      })
      .eq('id', menu.id)
    setSaving(null)
  }

  async function removeMenu(id: string) {
    await supabase.from('menus').delete().eq('id', id)
    setMenus((prev) => prev.filter((m) => m.id !== id))
  }

  const tabMenus = menus.filter((m) => m.tab === activeTab)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-gray-600 mb-3">メニュー管理</h2>

        {/* タブ一覧 */}
<div className="flex flex-wrap gap-2 mb-4">
  {tabs.map((tab) => (
    <div
      key={tab}
      className={`flex items-center gap-1 rounded-lg border overflow-hidden text-sm transition ${
        activeTab === tab ? 'border-black' : ''
      }`}
    >
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-3 py-1.5 transition ${
          activeTab === tab
            ? 'bg-black text-white'
            : 'hover:bg-gray-50'
        }`}
      >
        {tab}
      </button>
      <button
        onClick={() => {
          if (confirm(`「${tab}」タブとそのメニューをすべて削除しますか？`)) {
            removeTab(tab)
          }
        }}
        className={`px-2 py-1.5 transition ${
          activeTab === tab
            ? 'bg-black text-white hover:bg-red-600'
            : 'hover:bg-red-50 hover:text-red-500'
        }`}
      >
        ✕
      </button>
    </div>
  ))}

  {/* タブ追加 */}
  <div className="flex items-center gap-1">
    <input
      type="text"
      value={newTab}
      onChange={(e) => setNewTab(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && addTab()}
      placeholder="新しいタブ名"
      className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 w-28"
    />
    <button
      onClick={addTab}
      disabled={!newTab.trim()}
      className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30 transition"
    >
      追加
    </button>
  </div>
</div>

        {/* 選択中のタブのメニュー */}
        {activeTab && (
          <div className="flex flex-col gap-4">
            {tabMenus.map((menu) => (
              <div key={menu.id} className="border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={menu.name}
                    onChange={(e) => updateMenu(menu.id, 'name', e.target.value)}
                    placeholder="メニュー名"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
                  />
                  <div className="flex items-center gap-1 border rounded-lg px-3 py-2 text-sm w-32">
                    <input
                      type="number"
                      value={menu.price}
                      onChange={(e) => updateMenu(menu.id, 'price', parseInt(e.target.value) || 0)}
                      className="w-full outline-none text-right"
                      min={0}
                    />
                    <span className="text-gray-400 shrink-0">円</span>
                  </div>
                </div>
                <textarea
                  value={menu.description}
                  onChange={(e) => updateMenu(menu.id, 'description', e.target.value)}
                  placeholder="説明"
                  rows={2}
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => removeMenu(menu.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => saveMenu(menu)}
                    disabled={saving === menu.id}
                    className="text-xs px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 transition"
                  >
                    {saving === menu.id ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addMenu(activeTab)}
              className="py-2 border border-dashed rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition"
            >
              ＋ メニューを追加
            </button>
          </div>
        )}

        {tabs.length === 0 && (
          <p className="text-sm text-gray-400">上のフォームからタブを追加してください</p>
        )}
      </div>
    </div>
  )
}