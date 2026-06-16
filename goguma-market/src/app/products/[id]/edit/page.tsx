'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateProduct } from '@/app/products/actions'

const CATEGORIES = ['디지털기기', '의류/잡화', '가구/인테리어', '도서', '게임/취미', '주방용품', '스포츠', '기타']
const STATUSES = ['판매중', '예약중', '거래완료']

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [productId, setProductId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceValue, setPriceValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('판매중')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        .select('title, description, price, category, status, image_url')
        .eq('id', numId)
        .single()

      if (product) {
        setTitle(product.title)
        setDescription(product.description ?? '')
        setPriceValue(product.price === 0 ? '0' : product.price.toLocaleString('ko-KR'))
        setSelectedCategory(product.category)
        setSelectedStatus(product.status)
        setExistingImageUrl(product.image_url ?? null)
      }
      setFetching(false)
    }
    load()
  }, [params])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하만 업로드할 수 있어요.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveExistingImage(true)
    setError(null)
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setRemoveExistingImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const displayImage = imagePreview ?? (removeExistingImage ? null : existingImageUrl)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
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
    formData.set('status', selectedStatus)

    if (uploadedUrl) {
      formData.set('image_url', uploadedUrl)
    } else if (removeExistingImage) {
      formData.set('image_url', '')
    } else if (existingImageUrl) {
      formData.set('image_url', existingImageUrl)
    }

    const result = await updateProduct(productId!, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-[#d4d4d4] text-sm text-[#111] placeholder-[#a3a3a3] focus:outline-none focus:border-[#111] transition-colors bg-white"
  const labelClass = "block text-xs tracking-wide-sm uppercase text-[#717171] mb-2"

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#a3a3a3] text-xs tracking-wide-sm uppercase">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-[#111]">
        <div className="max-w-screen-md mx-auto px-5 h-16 flex items-center justify-between">
          <Link href={`/products/${productId}`} className="text-[#111] hover:opacity-60 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-[#111] text-xs tracking-luxe uppercase">Edit Item</h1>
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

          {/* 거래 상태 */}
          <div>
            <label className={labelClass}>거래 상태</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className="flex-1 py-2.5 border text-xs tracking-wide-sm transition-colors"
                  style={{
                    borderColor: '#111',
                    backgroundColor: selectedStatus === s ? '#111' : 'white',
                    color: selectedStatus === s ? 'white' : '#111',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 이미지 */}
          <div>
            <label className={labelClass}>사진 (선택, 최대 5MB)</label>
            {displayImage ? (
              <div className="relative w-full aspect-square overflow-hidden bg-[#f5f5f5]">
                <Image src={displayImage} alt="상품 이미지" fill className="object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#111] text-white text-[11px] tracking-wide-sm uppercase hover:bg-[#333] transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-8 h-8 bg-[#111] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
            <input type="text" name="title" required maxLength={50} value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
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
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="물건에 대해 자세히 알려주세요."
              className={inputClass + " resize-none"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? '저장 중...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  )
}
