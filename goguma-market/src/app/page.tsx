import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털기기': '📱', '의류/잡화': '👗', '가구/인테리어': '🛋️',
  '도서': '📚', '게임/취미': '🎮', '주방용품': '🍳', '스포츠': '🚲', '기타': '✨',
}

function formatPrice(price: number) {
  if (price === 0) return '무료나눔'
  return price.toLocaleString('ko-KR') + '원'
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, manner_temperature')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, status, created_at, seller:profiles(username)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <Navbar />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-8">
        {/* 히어로 배너 */}
        <section
          className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)' }}
        >
          <div className="relative z-10">
            <p className="text-orange-100 text-sm font-medium mb-1">우리 동네 중고거래</p>
            <h1 className="text-white text-3xl font-extrabold leading-tight mb-3">
              고구마마켓에서<br />
              가깝고 쉽게
            </h1>
            <p className="text-orange-100 text-sm leading-relaxed">
              동네 이웃과 안전하게 중고거래 하세요.<br />
              믿을 수 있는 매너온도로 거래하세요.
            </p>
            {!user && (
              <div className="flex gap-3 mt-6">
                <Link
                  href="/signup"
                  className="bg-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors"
                  style={{ color: '#FF6B35' }}
                >
                  시작하기
                </Link>
                <Link
                  href="/login"
                  className="bg-white/20 hover:bg-white/30 text-white font-medium text-sm px-5 py-2.5 rounded-full transition-colors"
                >
                  로그인
                </Link>
              </div>
            )}
          </div>
          <div className="absolute right-6 bottom-4 text-7xl opacity-20 select-none">🍠</div>
        </section>

        {/* 로그인한 경우 환영 메시지 */}
        {user && profile && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">반갑습니다!</p>
              <p className="font-bold text-gray-900 mt-0.5">{profile.username} 님</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">매너온도</p>
              <p className="text-2xl font-extrabold" style={{ color: '#FF6B35' }}>
                {profile.manner_temperature}°
              </p>
            </div>
          </section>
        )}

        {/* 카테고리 */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">카테고리</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { emoji: '📱', label: '디지털기기' },
              { emoji: '👗', label: '의류/잡화' },
              { emoji: '🛋️', label: '가구/인테리어' },
              { emoji: '📚', label: '도서' },
              { emoji: '🎮', label: '게임/취미' },
              { emoji: '🍳', label: '주방용품' },
              { emoji: '🚲', label: '스포츠' },
              { emoji: '✨', label: '기타' },
            ].map(({ emoji, label }) => (
              <button
                key={label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center gap-2 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 판매글 목록 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">내 근처 중고거래</h2>
            {user && (
              <Link
                href="/products/new"
                className="text-sm font-bold px-4 py-1.5 rounded-full text-white"
                style={{ backgroundColor: '#FF6B35' }}
              >
                + 판매하기
              </Link>
            )}
          </div>

          {products && products.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {products.map((product) => {
                const seller = Array.isArray(product.seller) ? product.seller[0] : product.seller
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    {/* 카테고리 이모지 썸네일 */}
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl"
                      style={{ backgroundColor: '#fff5f0' }}
                    >
                      {CATEGORY_EMOJI[product.category] ?? '✨'}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {seller?.username ?? '알 수 없음'} · {formatRelativeTime(product.created_at)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                        {product.status !== '판매중' && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: product.status === '예약중' ? '#fef3c7' : '#f3f4f6',
                              color: product.status === '예약중' ? '#d97706' : '#6b7280',
                            }}
                          >
                            {product.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-4xl mb-3">🍠</div>
              <p className="text-gray-500 text-sm">
                아직 게시글이 없어요.<br />
                첫 번째 판매자가 되어보세요!
              </p>
              {!user && (
                <Link
                  href="/signup"
                  className="mt-4 inline-block px-6 py-2.5 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  가입하고 시작하기
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
