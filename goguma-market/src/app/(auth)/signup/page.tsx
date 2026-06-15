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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              가입하신 이메일로 인증 링크를 보냈습니다.<br />
              이메일을 확인하고 인증을 완료해주세요.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full py-3 rounded-xl font-bold text-white text-sm text-center"
              style={{ backgroundColor: '#FF6B35' }}
            >
              로그인 하러 가기
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-xl font-bold text-gray-900 mb-6">회원가입</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="고구마왕"
                minLength={2}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="hello@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
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
                placeholder="6자 이상"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="비밀번호를 다시 입력하세요"
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
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#FF6B35' }}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
