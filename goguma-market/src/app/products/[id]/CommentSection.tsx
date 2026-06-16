'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addComment, updateComment, deleteComment } from '../interactions'

export type Comment = {
  id: number
  content: string
  created_at: string
  updated_at: string
  user_id: string
  author: string
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CommentSection({
  productId,
  comments,
  currentUserId,
}: {
  productId: number
  comments: Comment[]
  currentUserId: string | null
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    const trimmed = content.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await addComment(productId, trimmed)
      if (result?.error) {
        alert(result.error)
        return
      }
      setContent('')
      router.refresh()
    })
  }

  function handleStartEdit(c: Comment) {
    setEditingId(c.id)
    setEditContent(c.content)
  }

  function handleSaveEdit(commentId: number) {
    const trimmed = editContent.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await updateComment(commentId, productId, trimmed)
      if (result?.error) {
        alert(result.error)
        return
      }
      setEditingId(null)
      setEditContent('')
      router.refresh()
    })
  }

  function handleDelete(commentId: number) {
    if (!confirm('댓글을 삭제할까요?')) return

    startTransition(async () => {
      const result = await deleteComment(commentId, productId)
      if (result?.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        댓글 {comments.length}
      </h2>

      {/* 작성 폼 */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder={currentUserId ? '댓글을 입력하세요' : '로그인 후 댓글을 쓸 수 있어요'}
          maxLength={1000}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ backgroundColor: '#FF6B35' }}
        >
          등록
        </button>
      </div>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const isMine = currentUserId === c.user_id
            const isEditing = editingId === c.id
            return (
              <li key={c.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      {c.author?.[0] ?? '?'}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{c.author}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 mt-2 pl-9">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(c.id) }}
                      maxLength={1000}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={isPending}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-200"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-9">
                      {c.content}
                    </p>
                    {isMine && (
                      <div className="flex gap-3 mt-1.5 pl-9">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
