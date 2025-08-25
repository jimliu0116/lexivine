import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Email from 'next-auth/providers/email'
import { Resend } from 'resend'
import { verificationEmailTemplate } from './emailTemplates'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    Email({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        if(!resend){ throw new Error('RESEND_API_KEY not configured') }
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: 'Sign in to LexiVine',
          html: verificationEmailTemplateZHTW(url),
        })
      },
    })
  ],
  session: { strategy: 'jwt' },
})
