import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './DeleteButton'
import LikeButton from './LikeButton'
import CommentSection, { type Comment } from './CommentSection'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털기기': '📱', '의류/잡화': '👗', '가구/인테리어': '🛋️',
  '도서': '📚', '게임/취미': '🎮', '주방용품': '🍳', '스포츠': '🚲', '기타': '✨',
}

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
    .select('*, seller:profiles(username, manner_temperature)')
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
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* 상단 헤더 */}
      <header style={{ backgroundColor: '#FF6B35' }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-white/90 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-white font-bold text-base">판매글</span>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto w-full px-4 py-6 space-y-4">

        {/* 상품 이미지 */}
        <div
          className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#fff5f0', height: '280px' }}
        >
          {product.image_url ? (
            <div className="relative w-full h-full">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <span style={{ fontSize: '80px' }}>
              {CATEGORY_EMOJI[product.category] ?? '✨'}
            </span>
          )}
        </div>

        {/* 판매자 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {seller?.username?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{seller?.username ?? '알 수 없음'}</p>
              <p className="text-xs text-gray-400">판매자</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">매너온도</p>
            <p className="text-lg font-extrabold" style={{ color: '#FF6B35' }}>
              {seller?.manner_temperature ?? 36.5}°
            </p>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-lg font-bold text-gray-900 leading-snug">{product.title}</h1>
            {product.status !== '판매중' && (
              <span
                className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: product.status === '예약중' ? '#fef3c7' : '#f3f4f6',
                  color: product.status === '예약중' ? '#d97706' : '#6b7280',
                }}
              >
                {product.status}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            {product.category} · {formatDate(product.created_at)}
          </p>

          {product.description ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">내용이 없습니다.</p>
          )}
        </div>

        {/* 가격 + 버튼 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-0.5">판매가격</p>
            <p className="text-2xl font-extrabold text-gray-900">{formatPrice(product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton
              productId={product.id}
              initialLiked={likedByMe}
              initialCount={likeCount ?? 0}
              isLoggedIn={!!user}
            />
            {isMine ? (
              <div className="flex gap-2 flex-1">
                <DeleteButton productId={product.id} />
                <Link
                  href={`/products/${product.id}/edit`}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-center border-2 transition-colors"
                  style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
                >
                  수정하기
                </Link>
              </div>
            ) : (
              <button
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-colors"
                style={{ backgroundColor: '#FF6B35' }}
              >
                채팅하기
              </button>
            )}
          </div>
        </div>

        {/* 댓글 */}
        <CommentSection
          productId={product.id}
          comments={comments}
          currentUserId={user?.id ?? null}
        />
      </main>
    </div>
  )
}
