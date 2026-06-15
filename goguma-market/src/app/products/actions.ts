'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string, 10)
  const category = formData.get('category') as string

  if (!title || !category || isNaN(price)) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  const { error } = await supabase.from('products').insert({
    seller_id: user.id,
    title,
    description,
    price,
    category,
  })

  if (error) {
    return { error: '판매글 등록에 실패했습니다. 다시 시도해주세요.' }
  }

  redirect('/')
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string, 10)
  const category = formData.get('category') as string
  const status = formData.get('status') as string

  if (!title || !category || isNaN(price)) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ title, description, price, category, status })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: '수정에 실패했습니다. 다시 시도해주세요.' }
  }

  redirect(`/products/${id}`)
}

export async function deleteProduct(id: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: '삭제에 실패했습니다. 다시 시도해주세요.' }
  }

  redirect('/')
}
