'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 좋아요 토글: 안 눌렀으면 추가, 이미 눌렀으면 취소
export async function toggleLike(productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id)
    if (error) return { error: '좋아요 취소에 실패했습니다.' }
    revalidatePath(`/products/${productId}`)
    return { liked: false }
  }

  const { error } = await supabase
    .from('likes')
    .insert({ product_id: productId, user_id: user.id })
  if (error) return { error: '좋아요에 실패했습니다.' }

  revalidatePath(`/products/${productId}`)
  return { liked: true }
}

// 댓글 작성 (Create)
export async function addComment(productId: number, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const trimmed = content.trim()
  if (!trimmed) return { error: '댓글 내용을 입력해주세요.' }
  if (trimmed.length > 1000) return { error: '댓글은 1000자까지 작성할 수 있습니다.' }

  const { error } = await supabase
    .from('comments')
    .insert({ product_id: productId, user_id: user.id, content: trimmed })
  if (error) return { error: '댓글 작성에 실패했습니다.' }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

// 댓글 수정 (Update) — 본인 댓글만
export async function updateComment(commentId: number, productId: number, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const trimmed = content.trim()
  if (!trimmed) return { error: '댓글 내용을 입력해주세요.' }
  if (trimmed.length > 1000) return { error: '댓글은 1000자까지 작성할 수 있습니다.' }

  const { error } = await supabase
    .from('comments')
    .update({ content: trimmed, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) return { error: '댓글 수정에 실패했습니다.' }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

// 댓글 삭제 (Delete) — 본인 댓글만
export async function deleteComment(commentId: number, productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) return { error: '댓글 삭제에 실패했습니다.' }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}
