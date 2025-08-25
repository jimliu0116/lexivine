'use client'
import { useEffect, useState } from 'react'

export default function Pricing(){
  const [prices, setPrices] = useState<any>({})
  const [loading,setLoading] = useState<string|null>(null)

  useEffect(()=>{ fetch('/api/prices').then(r=>r.json()).then(setPrices).catch(()=>{}) },[])

  const plans = [
    { key:'FREE', name:'Free', price:'$0', features:['每日對話 5 則','基本寫作檢查','儀表板基本指標'], priceId:null },
    { key:'PRO', name:'Pro', price:'$9/mo', features:['不限對話','高級潤飾','發音強化','課程解鎖'], priceId: prices.PRO },
    { key:'PLUS', name:'Plus', price:'$19/mo', features:['包含 Pro','AI 情境模擬','自訂主題包','音檔與字幕資源'], priceId: prices.PLUS },
    { key:'TEAM', name:'Team', price:'$49/mo', features:['包含 Plus','團隊管理','共享課程庫','進度報表與排行'], priceId: prices.TEAM },
  ]

  async function checkout(priceId: string | null, key: string){
    if(!priceId){ alert('尚未設定此方案的 priceId（請在 .env 加上 STRIPE_PRICE_*）'); return }
    setLoading(key)
    const res = await fetch('/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ priceId })})
    const j = await res.json()
    if(j.url) window.location.href = j.url
    setLoading(null)
  }

  return (
    <main className='max-w-6xl mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold mb-6'>升級方案</h1>
      <div className='grid md:grid-cols-3 gap-4'>
        {plans.slice(0,3).map(p => <PlanCard key={p.key} plan={p} loading={loading===p.key} onBuy={()=>checkout(p.priceId, p.key)} />)}
      </div>
      <div className='mt-6'>
        <PlanCard plan={plans[3]} loading={loading==='TEAM'} onBuy={()=>checkout(plans[3].priceId, 'TEAM')} />
      </div>
    </main>
  )
}

function PlanCard({plan,onBuy,loading}:{plan:any,onBuy:()=>void,loading:boolean}){
  return (
    <div className='rounded-2xl border p-6'>
      <div className='text-lg font-semibold'>{plan.name}</div>
      <div className='text-3xl font-bold my-2'>{plan.price}</div>
      <ul className='text-sm text-black/70 list-disc ml-5 space-y-1'>{plan.features.map((f:string,i:number)=>(<li key={i}>{f}</li>))}</ul>
      {plan.key==='FREE' ? <div className='text-sm text-black/60 mt-4'>已包含在免費版</div> : <button onClick={onBuy} disabled={loading} className='pill px-4 py-2 gbtn mt-4'>{loading?'前往結帳中…':'前往結帳'}</button>}
    </div>
  )
}
