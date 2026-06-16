import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Avatar from '@/components/Avatar'

function formatPrice(price: number) {
  if (price === 0) return '무료나눔'
  return price.toLocaleString('ko-KR') + '원'
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: seller } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, location, manner_temperature, created_at')
    .eq('id', id)
    .single()

  if (!seller) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, status, image_url, created_at')
    .eq('seller_id', id)
    .order('created_at', { ascending: false })

  const count = products?.length ?? 0
  const onSale = products?.filter((p) => p.status === '판매중').length ?? 0

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
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

      <main className="max-w-screen-lg mx-auto w-full px-5 py-12">
        {/* 판매자 프로필 */}
        <section className="flex flex-col items-center text-center pb-12 border-b border-[#111]">
          <Avatar url={seller.avatar_url} name={seller.username} size={88} />
          <h1 className="text-xl font-light tracking-tight text-[#111] mt-5">{seller.username}</h1>
          {seller.location && (
            <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-2">{seller.location}</p>
          )}
          {seller.bio && (
            <p className="text-sm text-[#717171] leading-relaxed mt-4 max-w-md">{seller.bio}</p>
          )}
          <div className="flex items-center gap-8 mt-6 text-center">
            <div>
              <p className="text-base font-medium text-[#111]">{seller.manner_temperature ?? 36.5}°</p>
              <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-0.5">매너온도</p>
            </div>
            <div className="w-px h-8 bg-[#e5e5e5]" />
            <div>
              <p className="text-base font-medium text-[#111]">{count}</p>
              <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-0.5">전체 상품</p>
            </div>
            <div className="w-px h-8 bg-[#e5e5e5]" />
            <div>
              <p className="text-base font-medium text-[#111]">{onSale}</p>
              <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-0.5">판매중</p>
            </div>
          </div>
        </section>

        {/* 판매글 모아보기 */}
        <h2 className="text-xs tracking-luxe uppercase text-[#111] mt-12 mb-8">
          {seller.username}님의 상품
        </h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
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
                <p className="text-sm text-[#111] truncate mb-1.5">{product.title}</p>
                <p className="text-sm font-medium text-[#111]">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-[#e5e5e5]">
            <p className="text-sm text-[#717171]">아직 등록한 상품이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}
