import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#111]">
      <div className="max-w-screen-lg mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-[#111] font-semibold text-xl tracking-luxe">GOGUMA</span>
        </Link>

        <nav className="flex items-center gap-5 text-xs tracking-wide-sm uppercase">
          {user ? (
            <>
              <Link
                href="/products/new"
                className="text-[#111] hover:opacity-60 transition-opacity"
              >
                Sell
              </Link>
              <Link
                href="/profile"
                className="text-[#111] hover:opacity-60 transition-opacity"
              >
                Account
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-[#717171] hover:text-[#111] transition-colors uppercase"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#111] hover:opacity-60 transition-opacity"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-[#111] text-white px-4 py-2 hover:bg-[#333] transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
