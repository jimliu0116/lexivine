'use client'
import { useEffect, useRef, useState } from 'react'
import Topbar from '@/components/Topbar'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend)
export default function Page(){ useEffect(()=>{ initChart() },[]); return (<div><Topbar/><main className='max-w-6xl mx-auto px-4 py-6'>
  <Hero/>
  <KPIs/>
  <Dashboard/>
</main></div>) }
function Hero(){ return (<section className='relative overflow-hidden rounded-3xl ring-brand bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 md:p-16'><div><span className='inline-block text-xs bg-black text-white px-3 py-1 rounded-full'>全新體驗</span><h1 className='mt-4 text-4xl md:text-6xl font-bold leading-tight'>您的專屬 AI 英文家教：<br/><span className='bg-clip-text text-transparent' style={{backgroundImage:'linear-gradient(90deg, var(--brand-1), var(--brand-2))'}}>隨時隨地，即時對話</span></h1><p className='mt-4 text-black/70 text-lg max-w-2xl'>從發音到流利對話，AI 精準反饋，讓您的英文突飛猛進。</p><div className='mt-8 flex gap-3'><a className='pill px-6 py-3 gbtn' href='/pricing'>立即升級</a><a className='pill px-6 py-3 border' href='/admin'>前往後台</a></div></div><div className='absolute right-4 bottom-4 md:right-12 md:bottom-12 w-[220px] md:w-[360px] aspect-video rounded-2xl bg-black text-white flex items-center justify-center overflow-hidden'><div className='wave w-[80%]'>{Array.from({length:40}).map((_,i)=><span key={i}></span>)}</div></div></section>) }
function KPIs(){ return (<section className='grid md:grid-cols-4 gap-4 my-6'><Box label='學習時長 (本週)' value='5 小時 20 分'/><Box label='完成對話次數' value='28'/><Box label='學習主題數量' value='12'/><Box label='連續學習天數' value='7 天'/></section>) }
function Box({label,value}:{label:string,value:string}){ return (<div className='rounded-2xl border p-4'><div className='text-xs text-black/60'>{label}</div><div className='text-2xl font-semibold'>{value}</div></div>) }
function Dashboard(){ const [leaders,setLeaders]=useState<any[]>([]); useEffect(()=>{ fetch('/api/leaderboard').then(r=>r.json()).then(setLeaders).catch(()=>{}) },[]); return (<div className='rounded-2xl border p-4 mt-6'><div className='font-semibold mb-2'>能力趨勢 & 排行榜</div><canvas id='trendChart' height={120}></canvas><div className='mt-6'><div className='font-medium mb-2'>排行榜（Top 10）</div><div className='overflow-x-auto'><table className='min-w-full text-sm'><thead><tr className='text-left text-black/60'><th className='py-2 pr-3'>名次</th><th className='py-2 pr-3'>使用者</th><th className='py-2 pr-3'>XP</th></tr></thead><tbody>{leaders.map((r,i)=>(<tr key={i} className='border-t'><td className='py-2 pr-3'>{i+1}</td><td className='py-2 pr-3'>{r.name||r.email}</td><td className='py-2 pr-3'>{r.xp}</td></tr>))}</tbody></table></div></div></div>) }
function initChart(){ const el = document.getElementById('trendChart') as HTMLCanvasElement|null; if(!el) return; // @ts-ignore
 if(el._chartInstance){ el._chartInstance.destroy(); }
 // @ts-ignore
 el._chartInstance = new Chart(el,{ type:'line', data:{ labels:['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6'], datasets:[ {label:'Fluency', data:[52,58,62,68,72,77], borderWidth:2}, {label:'Pronunciation', data:[60,63,66,70,73,78], borderWidth:2}, {label:'Grammar', data:[55,57,60,64,68,71], borderWidth:2} ]}, options:{ responsive:true, scales:{ y:{ min:40, max:100 } } } }) }
