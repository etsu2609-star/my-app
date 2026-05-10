'use client'
import { useState } from 'react'
import type { Menu } from '@/types'

type Props = { menus: Menu[] }

export default function MenuTabs({ menus }: Props) {
  const tabs = [...new Set(menus.map((m) => m.tab))].filter(Boolean)
  const [activeTab, setActiveTab] = useState(tabs[0] ?? '')

  const tabMenus = menus.filter((m) => m.tab === activeTab)

  return (
    <div className="flex flex-col gap-4">
      {/* タブ */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'border hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* メニュー一覧 */}
      <div className="flex flex-col gap-3">
        {tabMenus.map((menu) => (
          <div key={menu.id} className="border rounded-xl p-4 flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{menu.name}</p>
              {menu.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{menu.description}</p>
              )}
            </div>
            <p className="text-sm font-medium shrink-0">
              ¥{menu.price.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}