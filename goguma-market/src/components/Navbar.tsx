import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header style={{ backgroundColor: '#FF6B35' }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="text-white font-bold text-lg tracking-tight">고구마마켓</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/products/new"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                판매하기
              </Link>
              <Link
                href="/profile"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                내 프로필
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-white text-[#FF6B35] text-sm font-bold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
