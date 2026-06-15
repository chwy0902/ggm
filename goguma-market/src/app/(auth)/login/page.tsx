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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="text-5xl">🍠</span>
            <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>고구마마켓</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">우리 동네 중고거래</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">로그인</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error === 'Invalid login credentials'
                ? '이메일 또는 비밀번호가 올바르지 않습니다.'
                : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="hello@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all"
                style={{ '--tw-ring-color': '#FF6B35' } as React.CSSProperties}
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all mt-2 disabled:opacity-60"
              style={{ backgroundColor: loading ? '#ffb899' : '#FF6B35' }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#E55A25' }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#FF6B35' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: '#FF6B35' }}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
