'use client'

import { useState } from 'react'
import { deleteProduct } from '@/app/products/actions'

export default function DeleteButton({ productId }: { productId: number }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteProduct(productId)
  }

  if (confirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#ef4444' }}
        >
          {loading ? '삭제 중...' : '삭제 확인'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:text-red-500"
    >
      삭제
    </button>
  )
}
