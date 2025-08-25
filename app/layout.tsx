import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'LexiVine — AI 英文家教', description: 'Enterprise features' }
export default function RootLayout({ children }: { children: React.ReactNode }){ return (<html lang='zh-Hant'><body>{children}</body></html>) }
