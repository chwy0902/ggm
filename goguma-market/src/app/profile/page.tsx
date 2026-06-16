import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { signOut } from '@/app/auth/actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-5 py-12">
        <h1 className="text-xs tracking-luxe uppercase text-[#111] mb-10 text-center">Account</h1>

        {/* 프로필 헤더 */}
        <div className="flex flex-col items-center text-center pb-10 border-b border-[#111]">
          <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center text-white text-2xl font-light mb-4">
            {profile?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <h2 className="text-xl font-light tracking-tight text-[#111]">
            {profile?.username ?? '닉네임 없음'}
          </h2>
          <p className="text-sm text-[#717171] mt-1">{user.email}</p>
          <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] mt-4">
            매너온도 · {profile?.manner_temperature ?? 36.5}°
          </p>
        </div>

        {/* 프로필 정보 */}
        <div className="py-10 space-y-6 border-b border-[#e5e5e5]">
          <div className="flex justify-between items-center">
            <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">닉네임</p>
            <p className="text-sm text-[#111]">{profile?.username ?? '-'}</p>
          </div>
          {profile?.location && (
            <div className="flex justify-between items-center">
              <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">동네</p>
              <p className="text-sm text-[#111]">{profile.location}</p>
            </div>
          )}
          {profile?.bio && (
            <div className="flex justify-between items-start gap-8">
              <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3] flex-shrink-0">소개</p>
              <p className="text-sm text-[#111] text-right">{profile.bio}</p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-[11px] tracking-wide-sm uppercase text-[#a3a3a3]">가입일</p>
            <p className="text-sm text-[#111]">
              {new Date(user.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* 로그아웃 */}
        <form action={signOut} className="mt-10">
          <button
            type="submit"
            className="w-full border border-[#111] text-[#111] text-xs tracking-wide-sm uppercase py-4 hover:bg-[#111] hover:text-white transition-colors"
          >
            Logout
          </button>
        </form>
      </main>
    </div>
  )
}
