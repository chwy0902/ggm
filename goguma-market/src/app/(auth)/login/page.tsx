'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/auth/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-[#d4d4d4] text-sm text-[#111] placeholder-[#a3a3a3] focus:outline-none focus:border-[#111] transition-colors bg-white"
  const labelClass = "block text-xs tracking-wide-sm uppercase text-[#717171] mb-2"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-white">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-semibold tracking-luxe text-[#111]">GOGUMA</span>
          </Link>
          <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-3">Pre-loved Marketplace</p>
        </div>

        <h1 className="text-xs tracking-luxe uppercase text-[#111] mb-8 text-center">Login</h1>

        {error && (
          <div className="mb-6 px-4 py-3 border border-[#111] text-[#111] text-sm">
            {error === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다.'
              : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>이메일</label>
            <input type="email" name="email" required placeholder="hello@example.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>비밀번호</label>
            <input type="password" name="password" required placeholder="비밀번호를 입력하세요" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-[#717171] mt-8">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-[#111] underline underline-offset-2">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
