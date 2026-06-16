'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/auth/actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result?.error) {
      const msg = result.error
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('이미 사용 중인 이메일입니다.')
      } else {
        setError(msg)
      }
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-[#d4d4d4] text-sm text-[#111] placeholder-[#a3a3a3] focus:outline-none focus:border-[#111] transition-colors bg-white"
  const labelClass = "block text-xs tracking-wide-sm uppercase text-[#717171] mb-2"

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-white">
        <div className="w-full max-w-sm text-center border border-[#111] p-10">
          <h2 className="text-xs tracking-luxe uppercase text-[#111] mb-4">Check Your Email</h2>
          <p className="text-sm text-[#717171] leading-relaxed">
            가입하신 이메일로 인증 링크를 보냈습니다.<br />
            이메일을 확인하고 인증을 완료해주세요.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-white py-12">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-semibold tracking-luxe text-[#111]">GOGUMA</span>
          </Link>
          <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-3">Pre-loved Marketplace</p>
        </div>

        <h1 className="text-xs tracking-luxe uppercase text-[#111] mb-8 text-center">Join</h1>

        {error && (
          <div className="mb-6 px-4 py-3 border border-[#111] text-[#111] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>닉네임</label>
            <input type="text" name="username" required placeholder="고구마왕" minLength={2} maxLength={20} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>이메일</label>
            <input type="email" name="email" required placeholder="hello@example.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>비밀번호</label>
            <input type="password" name="password" required placeholder="6자 이상" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>비밀번호 확인</label>
            <input type="password" name="confirmPassword" required placeholder="비밀번호를 다시 입력하세요" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? '가입 중...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-[#717171] mt-8">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-[#111] underline underline-offset-2">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
