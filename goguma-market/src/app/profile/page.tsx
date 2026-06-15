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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <Navbar />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{ backgroundColor: '#FF6B35' }}
              >
                {profile?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {profile?.username ?? '닉네임 없음'}
                </h1>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400 mb-0.5">매너온도</p>
                <p className="text-2xl font-extrabold" style={{ color: '#FF6B35' }}>
                  {profile?.manner_temperature ?? 36.5}°
                </p>
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">닉네임</p>
              <p className="text-sm text-gray-800 font-medium">{profile?.username ?? '-'}</p>
            </div>
            {profile?.location && (
              <div>
                <p className="text-xs text-gray-400 mb-1">동네</p>
                <p className="text-sm text-gray-800 font-medium">{profile.location}</p>
              </div>
            )}
            {profile?.bio && (
              <div>
                <p className="text-xs text-gray-400 mb-1">소개</p>
                <p className="text-sm text-gray-800">{profile.bio}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">가입일</p>
              <p className="text-sm text-gray-800">
                {new Date(user.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="px-6 pb-6 space-y-3">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
