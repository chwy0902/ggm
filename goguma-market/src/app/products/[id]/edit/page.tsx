'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateProduct } from '@/app/products/actions'

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

const STATUSES = ['판매중', '예약중', '거래완료']

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [productId, setProductId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceValue, setPriceValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('판매중')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString('ko-KR') : ''
  }

  useEffect(() => {
    async function load() {
      const { id } = await params
      const numId = parseInt(id, 10)
      setProductId(numId)

      const supabase = createClient()
      const { data: product } = await supabase
        .from('products')
        .select('title, description, price, category, status')
        .eq('id', numId)
        .single()

      if (product) {
        setTitle(product.title)
        setDescription(product.description ?? '')
        setPriceValue(product.price === 0 ? '0' : product.price.toLocaleString('ko-KR'))
        setSelectedCategory(product.category)
        setSelectedStatus(product.status)
      }
      setFetching(false)
    }
    load()
  }, [params])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('price', priceValue.replace(/,/g, ''))
    formData.set('category', selectedCategory)
    formData.set('status', selectedStatus)

    const result = await updateProduct(productId!, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#FF6B35' }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/products/${productId}`} className="text-white/90 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-white font-bold text-base">판매글 수정</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 거래 상태 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">거래 상태</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    borderColor: selectedStatus === s ? '#FF6B35' : '#e5e7eb',
                    backgroundColor: selectedStatus === s ? '#fff5f0' : 'white',
                    color: selectedStatus === s ? '#FF6B35' : '#6b7280',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

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
              value={title}
              onChange={e => setTitle(e.target.value)}
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
                className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 text-gray-900 focus:outline-none text-sm transition-all"
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
            <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
            <textarea
              name="description"
              rows={6}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="물건에 대해 자세히 알려주세요."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all resize-none"
              onFocus={e => e.target.style.borderColor = '#FF6B35'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all disabled:opacity-60"
            style={{ backgroundColor: loading ? '#ffb899' : '#FF6B35' }}
          >
            {loading ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
