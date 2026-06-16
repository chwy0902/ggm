import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './DeleteButton'
import LikeButton from './LikeButton'
import CommentSection, { type Comment } from './CommentSection'
import Avatar from '@/components/Avatar'

function formatPrice(price: number) {
  if (price === 0) return '무료나눔'
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, seller:profiles(username, manner_temperature, avatar_url, bio)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const seller = Array.isArray(product.seller) ? product.seller[0] : product.seller
  const isMine = user?.id === product.seller_id

  // 좋아요 개수 + 내가 눌렀는지 여부
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product.id)

  let likedByMe = false
  if (user) {
    const { data: myLike } = await supabase
      .from('likes')
      .select('id')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .maybeSingle()
    likedByMe = !!myLike
  }

  // 댓글 목록 (작성자 이름 포함, 오래된 순)
  const { data: commentRows } = await supabase
    .from('comments')
    .select('id, content, created_at, updated_at, user_id, author:profiles(username)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: true })

  const comments: Comment[] = (commentRows ?? []).map((row) => {
    const profile = Array.isArray(row.author) ? row.author[0] : row.author
    return {
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_id: row.user_id,
      author: profile?.username ?? '알 수 없음',
    }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#111]">
        <div className="max-w-screen-lg mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="text-[#111] hover:opacity-60 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-[#111] font-semibold tracking-luxe text-sm">GOGUMA</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto w-full px-5 py-10 grid md:grid-cols-2 gap-10">

        {/* 왼쪽: 상품 이미지 */}
        <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs tracking-luxe uppercase text-[#a3a3a3]">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex flex-col">
          {/* 카테고리 + 상태 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-wide-sm uppercase text-[#a3a3a3]">{product.category}</p>
            {product.status !== '판매중' && (
              <span className="bg-[#111] text-white text-[10px] tracking-wide-sm uppercase px-2.5 py-1">
                {product.status}
              </span>
            )}
          </div>

          {/* 제목 + 가격 */}
          <h1 className="text-2xl font-light tracking-tight text-[#111] leading-snug mb-3">
            {product.title}
          </h1>
          <p className="text-xl font-medium text-[#111] mb-6">{formatPrice(product.price)}</p>
          <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mb-8 pb-8 border-b border-[#e5e5e5]">
            {formatDate(product.created_at)}
          </p>

          {/* 판매자 (클릭 시 글 모아보기) */}
          <Link
            href={`/sellers/${product.seller_id}`}
            className="block border border-[#e5e5e5] p-5 mb-8 hover:border-[#111] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar url={seller?.avatar_url} name={seller?.username} size={44} />
                <div>
                  <p className="text-sm text-[#111]">{seller?.username ?? '알 수 없음'}</p>
                  <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">Seller</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">매너온도</p>
                <p className="text-base font-medium text-[#111]">{seller?.manner_temperature ?? 36.5}°</p>
              </div>
            </div>
            {seller?.bio && (
              <p className="text-sm text-[#717171] leading-relaxed mt-4">{seller.bio}</p>
            )}
            <p className="text-[11px] tracking-wide-sm uppercase text-[#111] mt-4 flex items-center gap-1">
              이 판매자의 다른 상품 보기
              <span aria-hidden>→</span>
            </p>
          </Link>

          {/* 설명 */}
          <div className="mb-8 pb-8 border-b border-[#e5e5e5]">
            {product.description ? (
              <p className="text-sm text-[#444] leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-[#a3a3a3] italic">상세 설명이 없습니다.</p>
            )}
          </div>

          {/* 액션 버튼 */}
          {isMine ? (
            <div className="flex gap-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 text-center border border-[#111] text-[#111] text-xs tracking-wide-sm uppercase py-4 hover:bg-[#111] hover:text-white transition-colors"
              >
                Edit
              </Link>
              <DeleteButton productId={product.id} />
            </div>
          ) : (
            <button className="w-full bg-[#111] text-white text-xs tracking-wide-sm uppercase py-4 hover:bg-[#333] transition-colors">
              채팅하기
            </button>
          )}

          {/* 좋아요 */}
          <div className="mt-4">
            <LikeButton
              productId={product.id}
              initialLiked={likedByMe}
              initialCount={likeCount ?? 0}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </main>

      {/* 댓글 */}
      <div className="max-w-screen-lg mx-auto w-full px-5 pb-16">
        <CommentSection
          productId={product.id}
          comments={comments}
          currentUserId={user?.id ?? null}
        />
      </div>
    </div>
  )
}
