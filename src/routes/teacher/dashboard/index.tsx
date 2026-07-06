import { createFileRoute } from '@tanstack/react-router'
import { Bell, BookOpen, LayoutDashboard, MailCheck } from 'lucide-react'
import { DashboardStatCard } from '@/components/shared/DashboardStatCard'
import { useProfile } from '@/hooks/useProfile'
import { useTeacherDisciplines } from '@/hooks/useTeacherDisciplines'
import { useTeacherNotices } from '@/hooks/useNotices'
import { TeacherDisciplinesCard } from './-components/TeacherDisciplinesCard'
import { TeacherUnreadCard } from './-components/TeacherUnreadCard'

export const Route = createFileRoute('/teacher/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: profile, isLoading: loadingProfile } = useProfile()
  const teacherId = profile?.teacher?.teacher_id

  const { data: disciplines, isLoading: loadingDisciplines } =
    useTeacherDisciplines(teacherId ?? 0, { enabled: !!teacherId })

  const { data: notices = [], isLoading: loadingNotices } =
    useTeacherNotices(teacherId)

  const unreadCount = notices.filter((n) => !n.viewed).length
  const readCount = notices.filter((n) => n.viewed).length

  const firstName = profile?.teacher?.teacher_name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-slate-400">
            {firstName ? `Bem-vindo, ${firstName}` : 'Visão geral'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label="Minhas Disciplinas"
          value={disciplines?.discipline_ids.length ?? 0}
          icon={BookOpen}
          iconColor="text-violet-400"
          iconBg="bg-violet-600/10"
          isLoading={loadingProfile || loadingDisciplines}
        />
        <DashboardStatCard
          label="Avisos Não Lidos"
          value={unreadCount}
          icon={Bell}
          iconColor="text-blue-400"
          iconBg="bg-blue-600/10"
          isLoading={loadingProfile || loadingNotices}
        />
        <DashboardStatCard
          label="Avisos Lidos"
          value={readCount}
          icon={MailCheck}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-600/10"
          isLoading={loadingProfile || loadingNotices}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {teacherId ? (
          <>
            <TeacherDisciplinesCard teacherId={teacherId} />
            <TeacherUnreadCard teacherId={teacherId} />
          </>
        ) : (
          <>
            <div className="h-48 animate-pulse rounded-xl border border-slate-700 bg-slate-800/50" />
            <div className="h-48 animate-pulse rounded-xl border border-slate-700 bg-slate-800/50" />
          </>
        )}
      </div>
    </div>
  )
}
