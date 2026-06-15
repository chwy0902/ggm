'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/app/products/actions'

const CATEGORIES = [
  { emoji: '📱', label: '디지털기기' },
  { emoji: '👗', label: '의류/잡화' },
  { emoji: '🛋️', label: '가구/인테리어' },
  { emoji: '📚', label: '도서' },
  { emoji: '🎮', label: '게임/취미' },
  { emoji: '🍳', label: '주방용품' },
  { emoji: '🚲', label: '스포츠' },
  { emoji: '✨', label: '기타' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceValue, setPriceValue] = useState('')

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString('ko-KR') : ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // 가격에서 쉼표 제거 후 저장
    const rawPrice = priceValue.replace(/,/g, '')
    formData.set('price', rawPrice)
    formData.set('category', selectedCategory)

    const result = await createProduct(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* 상단 헤더 */}
      <header style={{ backgroundColor: '#FF6B35' }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-white/90 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-white font-bold text-base">판매글 작성</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 오류 메시지 */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 제목 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제목 <span style={{ color: '#FF6B35' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={50}
              placeholder="글 제목을 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
              onFocus={e => e.target.style.borderColor = '#FF6B35'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* 카테고리 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              카테고리 <span style={{ color: '#FF6B35' }}>*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedCategory(label)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all"
                  style={{
                    borderColor: selectedCategory === label ? '#FF6B35' : '#e5e7eb',
                    backgroundColor: selectedCategory === label ? '#fff5f0' : 'white',
                    color: selectedCategory === label ? '#FF6B35' : '#4b5563',
                  }}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              가격 <span style={{ color: '#FF6B35' }}>*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={priceValue}
                onChange={e => setPriceValue(formatPrice(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all"
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
            <button
              type="button"
              onClick={() => setPriceValue('0')}
              className="mt-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
              style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
            >
              무료나눔
            </button>
          </div>

          {/* 내용 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              내용
            </label>
            <textarea
              name="description"
              rows={6}
              placeholder="물건에 대해 자세히 알려주세요.&#10;(상태, 사용 기간, 거래 방법 등)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all resize-none"
              onFocus={e => e.target.style.borderColor = '#FF6B35'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* 등록 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all disabled:opacity-60"
            style={{ backgroundColor: loading ? '#ffb899' : '#FF6B35' }}
          >
            {loading ? '등록 중...' : '판매글 올리기'}
          </button>
        </form>
      </main>
    </div>
  )
}
