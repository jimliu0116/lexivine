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
    const { text, voice } = await req.json()
    if(!text){ return new NextResponse('Missing text', { status: 400 }) }

    // OpenAI TTS
    if(process.env.OPENAI_API_KEY){
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const speech = await openai.audio.speech.create({ model: 'tts-1', voice: (voice || 'alloy') as any, input: text } as any)
      const buffer = Buffer.from(await speech.arrayBuffer())
      return new Response(buffer, { status:200, headers:{ 'Content-Type':'audio/mpeg' } })
    }

    // Azure TTS
    if(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION){
      const ssml = `<?xml version="1.0"?><speak version="1.0" xml:lang="en-US"><voice xml:lang="en-US" name="en-US-JennyNeural">${text}</voice></speak>`
      const url = `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`
      const r = await fetch(url, { method:'POST', headers:{ 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!, 'Content-Type':'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3' }, body: ssml })
      const buf = Buffer.from(await r.arrayBuffer())
      return new Response(buf, { status:200, headers:{ 'Content-Type':'audio/mpeg' } })
    }

    // GCP TTS
    if(process.env.GCP_PROJECT_ID && process.env.GCP_SA_KEY){
      const token = await gcpAccessToken(process.env.GCP_SA_KEY)
      const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method:'POST', headers:{ 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ input:{ text }, voice:{ languageCode:'en-US', name:'en-US-Neural2-C' }, audioConfig:{ audioEncoding:'MP3' } })})
      const j = await r.json()
      const audio = j.audioContent ? Buffer.from(j.audioContent, 'base64') : Buffer.from([])
      return new Response(audio, { status:200, headers:{ 'Content-Type':'audio/mpeg' } })
    }

    return new NextResponse('No TTS provider configured', { status: 501 })
  }catch(e:any){
    console.error(e)
    return new NextResponse(e?.message || 'TTS error', { status: 500 })
  }
}
