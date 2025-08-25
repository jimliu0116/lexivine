'use client'
import { useEffect, useState } from 'react'

export default function TeamPage(){
  const [me, setMe] = useState<any>(null)
  useEffect(()=>{ fetch('/api/me').then(r=>r.json()).then(setMe).catch(()=>{}) },[])

  const allowed = me && me.plan === 'TEAM'
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">團隊管理</h1>
      {!allowed && <div className="rounded-2xl border p-4">
        <div className="text-black/80">此功能僅限 <b>Team</b> 方案使用。</div>
        <a className="pill px-4 py-2 gbtn inline-block mt-3" href="/pricing">升級至 Team</a>
      </div>}
      {allowed && <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-2">共享課程庫（示範）</div>
        <p className="text-sm text-black/70">未來可在此新增/分配團隊課程、查看團隊進度報表、導出CSV 等。</p>
      </div>}
    </main>
  )
}
