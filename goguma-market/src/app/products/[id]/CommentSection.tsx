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
    <div className="border-t border-[#111] pt-10">
      <h2 className="text-xs tracking-luxe uppercase text-[#111] mb-8">
        Comments ({comments.length})
      </h2>

      {/* 작성 폼 */}
      <div className="flex gap-0 mb-10 border border-[#111]">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder={currentUserId ? '댓글을 입력하세요' : '로그인 후 댓글을 쓸 수 있습니다'}
          maxLength={1000}
          className="flex-1 px-4 py-3 text-sm text-[#111] placeholder-[#a3a3a3] focus:outline-none bg-white"
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="px-6 bg-[#111] text-white text-xs tracking-wide-sm uppercase disabled:opacity-50 hover:bg-[#333] transition-colors"
        >
          Post
        </button>
      </div>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-[#a3a3a3] text-center py-10">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((c) => {
            const isMine = currentUserId === c.user_id
            const isEditing = editingId === c.id
            return (
              <li key={c.id} className="border-b border-[#e5e5e5] pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center text-[11px] font-medium text-white">
                      {c.author?.[0] ?? '?'}
                    </div>
                    <span className="text-sm text-[#111]">{c.author}</span>
                  </div>
                  <span className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">{formatDateTime(c.created_at)}</span>
                </div>

                {isEditing ? (
                  <div className="flex gap-0 mt-2 pl-9 border border-[#111]">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(c.id) }}
                      maxLength={1000}
                      className="flex-1 px-3 py-2 text-sm text-[#111] focus:outline-none bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={isPending}
                      className="px-4 bg-[#111] text-white text-[11px] tracking-wide-sm uppercase disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 text-[11px] tracking-wide-sm uppercase text-[#717171] border-l border-[#111]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#444] leading-relaxed whitespace-pre-wrap pl-9">
                      {c.content}
                    </p>
                    {isMine && (
                      <div className="flex gap-4 mt-2 pl-9 text-[11px] tracking-wide-sm uppercase">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="text-[#a3a3a3] hover:text-[#111] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-[#a3a3a3] hover:text-[#111] transition-colors"
                        >
                          Delete
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
