import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import crypto from 'crypto'

async function gcpAccessToken(saKeyJson: string){
  const sa = JSON.parse(saKeyJson)
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now()/1000)
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const b64 = (obj:any)=> Buffer.from(JSON.stringify(obj)).toString('base64url')
  const token = `${b64(header)}.${b64(claims)}`
  const sign = crypto.createSign('RSA-SHA256').update(token).sign(sa.private_key, 'base64url')
  const assertion = `${token}.${sign}`
  const r = await fetch('https://oauth2.googleapis.com/token',{ method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams({ grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })})
  const j = await r.json()
  return j.access_token as string
}

export const runtime = 'nodejs'

export async function POST(req: Request){
  try{
    const fd = await req.formData()
    const audio = fd.get('audio') as File | null
    if(!audio){ return new NextResponse('No audio', { status: 400 }) }

    // OpenAI Whisper first
    if(process.env.OPENAI_API_KEY){
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const transcription = await openai.audio.transcriptions.create({ model: 'whisper-1', file: audio } as any)
      return NextResponse.json({ provider:'openai', text: (transcription as any).text || '' })
    }

    // Azure Speech
    if(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION){
      const url = `https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`
      const ab = await audio.arrayBuffer()
      const r = await fetch(url, { method:'POST', headers:{ 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!, 'Content-Type': 'audio/webm' }, body: Buffer.from(ab) })
      const j = await r.json().catch(()=>null)
      const text = j?.DisplayText || j?.NBest?.[0]?.Display || ''
      return NextResponse.json({ provider:'azure', text })
    }

    // GCP Speech-to-Text (v1 recognize)
    if(process.env.GCP_PROJECT_ID && process.env.GCP_SA_KEY){
      const token = await gcpAccessToken(process.env.GCP_SA_KEY)
      const ab = await audio.arrayBuffer()
      const content = Buffer.from(ab).toString('base64')
      const r = await fetch('https://speech.googleapis.com/v1/speech:recognize', { method:'POST', headers:{ 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ config:{ encoding:'WEBM_OPUS', languageCode:'en-US' }, audio:{ content } })})
      const j = await r.json()
      const text = j?.results?.[0]?.alternatives?.[0]?.transcript || ''
      return NextResponse.json({ provider:'gcp', text })
    }

    return new NextResponse('No speech provider configured', { status: 501 })
  }catch(e:any){
    console.error(e)
    return new NextResponse(e?.message || 'Transcription error', { status: 500 })
  }
}
