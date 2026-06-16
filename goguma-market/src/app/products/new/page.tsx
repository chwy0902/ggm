'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { createProduct } from '@/app/products/actions'

const CATEGORIES = ['디지털기기', '의류/잡화', '가구/인테리어', '도서', '게임/취미', '주방용품', '스포츠', '기타']

export default function NewProductPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceValue, setPriceValue] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString('ko-KR') : ''
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하만 업로드할 수 있어요.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget  // await 이전에 저장 (이후엔 null이 됨)
    setError(null)

    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.')
      return
    }

    setLoading(true)

    let uploadedUrl: string | null = null

    if (imageFile) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile)
      if (uploadError) {
        setError('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      uploadedUrl = publicUrl
    }

    const formData = new FormData(form)
    formData.set('price', priceValue.replace(/,/g, ''))
    formData.set('category', selectedCategory)
    if (uploadedUrl) formData.set('image_url', uploadedUrl)

    const result = await createProduct(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-[#d4d4d4] text-sm text-[#111] placeholder-[#a3a3a3] focus:outline-none focus:border-[#111] transition-colors bg-white"
  const labelClass = "block text-xs tracking-wide-sm uppercase text-[#717171] mb-2"

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-[#111]">
        <div className="max-w-screen-md mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="text-[#111] hover:opacity-60 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-[#111] text-xs tracking-luxe uppercase">Sell Item</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto w-full px-5 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="px-4 py-3 border border-[#111] text-[#111] text-sm">
              {error}
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <label className={labelClass}>사진 (선택, 최대 5MB)</label>
            {imagePreview ? (
              <div className="relative w-full aspect-square overflow-hidden bg-[#f5f5f5]">
                <Image src={imagePreview} alt="업로드 미리보기" fill className="object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-[#111] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-[#d4d4d4] flex flex-col items-center justify-center gap-2 text-[#a3a3a3] hover:border-[#111] hover:text-[#111] transition-colors"
                style={{ height: '160px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-xs tracking-wide-sm uppercase">Add Photo</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* 제목 */}
          <div>
            <label className={labelClass}>제목 *</label>
            <input type="text" name="title" required maxLength={50} placeholder="상품명을 입력하세요" className={inputClass} />
          </div>

          {/* 카테고리 */}
          <div>
            <label className={labelClass}>카테고리 *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedCategory(label)}
                  className="px-4 py-2 border text-xs tracking-wide-sm transition-colors"
                  style={{
                    borderColor: '#111',
                    backgroundColor: selectedCategory === label ? '#111' : 'white',
                    color: selectedCategory === label ? 'white' : '#111',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div>
            <label className={labelClass}>가격 *</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={priceValue}
                onChange={e => setPriceValue(formatPrice(e.target.value))}
                placeholder="0"
                className={inputClass + " pr-8"}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-sm">원</span>
            </div>
            <button
              type="button"
              onClick={() => setPriceValue('0')}
              className="mt-2 text-[11px] tracking-wide-sm uppercase px-3 py-1.5 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors"
            >
              무료나눔
            </button>
          </div>

          {/* 내용 */}
          <div>
            <label className={labelClass}>내용</label>
            <textarea
              name="description"
              rows={6}
              placeholder="물건에 대해 자세히 알려주세요. (상태, 사용 기간, 거래 방법 등)"
              className={inputClass + " resize-none"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? '등록 중...' : 'Publish'}
          </button>
        </form>
      </main>
    </div>
  )
}
