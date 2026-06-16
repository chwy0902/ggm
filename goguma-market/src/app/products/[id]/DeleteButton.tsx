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
      <div className="flex-1 flex gap-3">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 border border-[#111] text-[#111] text-xs tracking-wide-sm uppercase py-4 hover:bg-[#fafafa] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 disabled:opacity-50 hover:bg-[#333] transition-colors"
        >
          {loading ? '삭제 중' : 'Confirm'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex-1 border border-[#111] text-[#111] text-xs tracking-wide-sm uppercase py-4 hover:bg-[#fafafa] transition-colors"
    >
      Delete
    </button>
  )
}
