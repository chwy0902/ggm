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
      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors disabled:opacity-60"
      style={{
        borderColor: liked ? '#FF6B35' : '#e5e7eb',
        backgroundColor: liked ? '#fff5f0' : '#ffffff',
      }}
      aria-pressed={liked}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? '#FF6B35' : 'none'}
        stroke={liked ? '#FF6B35' : '#9ca3af'}
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span
        className="text-sm font-bold"
        style={{ color: liked ? '#FF6B35' : '#6b7280' }}
      >
        좋아요 {count}
      </span>
    </button>
  )
}
