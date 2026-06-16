import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = ['디지털기기', '의류/잡화', '가구/인테리어', '도서', '게임/취미', '주방용품', '스포츠', '기타']

function formatPrice(price: number) {
  if (price === 0) return '무료나눔'
  return price.toLocaleString('ko-KR') + '원'
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, status, image_url, created_at, seller:profiles(username)')
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* 히어로 */}
      <section className="border-b border-[#111]">
        <div className="max-w-screen-lg mx-auto px-5 py-20 text-center">
          <p className="text-xs tracking-luxe uppercase text-[#717171] mb-5">Pre-loved Marketplace</p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[#111] leading-tight mb-6">
            오래된 물건, 새로운 이야기
          </h1>
          <p className="text-sm text-[#717171] leading-relaxed max-w-md mx-auto mb-8">
            나에게 필요 없어진 물건이 누군가에게는 보물이 됩니다.<br />
            믿을 수 있는 거래, 고구마마켓에서 시작하세요.
          </p>
          {!user && (
            <div className="flex gap-3 justify-center">
              <Link
                href="/signup"
                className="bg-[#111] text-white text-xs tracking-wide-sm uppercase px-7 py-3.5 hover:bg-[#333] transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="border border-[#111] text-[#111] text-xs tracking-wide-sm uppercase px-7 py-3.5 hover:bg-[#111] hover:text-white transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-5 py-12">
        {/* 카테고리 */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-14 text-xs tracking-wide-sm uppercase text-[#717171]">
          {CATEGORIES.map((label) => (
            <span key={label} className="hover:text-[#111] transition-colors cursor-default">
              {label}
            </span>
          ))}
        </nav>

        {/* 상품 헤더 */}
        <div className="flex items-end justify-between mb-8 border-b border-[#e5e5e5] pb-4">
          <h2 className="text-lg font-light tracking-wide-sm text-[#111]">최신 상품</h2>
          {user && (
            <Link
              href="/products/new"
              className="text-xs tracking-wide-sm uppercase text-[#111] hover:opacity-60 transition-opacity"
            >
              + Sell
            </Link>
          )}
        </div>

        {/* 상품 그리드 */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {products.map((product) => {
              const seller = Array.isArray(product.seller) ? product.seller[0] : product.seller
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  {/* 이미지 */}
                  <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden mb-3">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs tracking-wide-sm uppercase text-[#a3a3a3]">
                          {product.category}
                        </span>
                      </div>
                    )}
                    {product.status !== '판매중' && (
                      <span className="absolute top-0 left-0 bg-[#111] text-white text-[10px] tracking-wide-sm uppercase px-2.5 py-1">
                        {product.status}
                      </span>
                    )}
                  </div>

                  {/* 정보 */}
                  <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mb-1 truncate">
                    {seller?.username ?? '알 수 없음'}
                  </p>
                  <p className="text-sm text-[#111] truncate mb-1.5">{product.title}</p>
                  <p className="text-sm font-medium text-[#111]">{formatPrice(product.price)}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-[#e5e5e5]">
            <p className="text-sm text-[#717171] leading-relaxed">
              아직 등록된 상품이 없습니다.<br />
              첫 번째 판매자가 되어보세요.
            </p>
            {!user && (
              <Link
                href="/signup"
                className="mt-6 inline-block bg-[#111] text-white text-xs tracking-wide-sm uppercase px-7 py-3.5 hover:bg-[#333] transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-[#111] mt-12">
        <div className="max-w-screen-lg mx-auto px-5 py-10 text-center">
          <p className="text-[#111] font-semibold tracking-luxe mb-2">GOGUMA</p>
          <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">Pre-loved Marketplace</p>
        </div>
      </footer>
    </div>
  )
}
