'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '../interactions'

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  productId: number
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // 한 번의 클릭으로 즉시 반응 (낙관적 업데이트)
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))

    startTransition(async () => {
      const result = await toggleLike(productId)
      if (result?.error) {
        // 실패하면 원래대로 되돌림
        setLiked(liked)
        setCount(initialCount)
        alert(result.error)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 border border-[#111] py-4 transition-colors disabled:opacity-50 hover:bg-[#fafafa]"
      aria-pressed={liked}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? '#111' : 'none'}
        stroke="#111"
        strokeWidth={1.5}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span className="text-xs tracking-wide-sm uppercase text-[#111]">
        Wishlist {count}
      </span>
    </button>
  )
}
