import { CalendarDays, Eye, ShieldCheck, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { NoticePriorityBadge } from '@/components/shared/NoticePriorityBadge'
import { Avatar } from '@/components/ui/Avatar'
import {
  formatNoticeDate,
  getNoticeReadersInfo,
} from '@/utils/noticeFormatters'
import {
  getNoticeVisibilityLabel,
  NoticeVisibilityBadge,
} from './NoticeVisibilityBadge'
import type { NoticeItem } from '@/types/notice'

interface AdminNoticeDetailsModalProps {
  open: boolean
  notice: NoticeItem | null
  teacherInfoById: Map<number, { name: string; photo: string | null }>
  onClose: () => void
}

export function AdminNoticeDetailsModal({
  open,
  notice,
  teacherInfoById,
  onClose,
}: AdminNoticeDetailsModalProps) {
  if (!open || !notice) return null

  const visibilityLabel = getNoticeVisibilityLabel(notice)
  const visibilities = notice.notice_visibilities ?? []
  const readers = getNoticeReadersInfo(notice)
  const isPublic = visibilities.length === 0
  const readerProgress =
    readers.total > 0 ? Math.round((readers.read / readers.total) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Aviso completo
              </h2>
              <p className="text-xs text-slate-400">
                Visualização completa do comunicado.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-73px)] space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={notice.notice_status} />
            </div>

            <h3 className="text-xl font-semibold leading-7 text-white">
              {notice.notice_title}
            </h3>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {notice.notice_content}
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-5">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span>
                Data de publicação: {formatNoticeDate(notice.notice_date)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>Prioridade:</span>
              <NoticePriorityBadge priority={notice.notice_priority} />
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Users className="h-4 w-4 text-slate-500" />
              <span>Visibilidade:</span>
              <NoticeVisibilityBadge notice={notice} />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <p className="text-sm font-medium text-white">
              Quem pode visualizar
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {visibilityLabel === 'Pública'
                ? 'Aviso público, visível para todos os professores.'
                : 'Aviso restrito aos professores selecionados.'}
            </p>

            {visibilities.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Professores selecionados ({visibilities.length})
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {visibilities.map((visibility) => {
                    const teacher = teacherInfoById.get(visibility.teacher_id)
                    const teacherName =
                      teacher?.name ?? `Professor #${visibility.teacher_id}`
                    const viewed = Boolean(
                      visibility.notice_visibility_viewed_in,
                    )

                    return (
                      <div
                        key={visibility.notice_visibility_id}
                        className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2"
                      >
                        <Avatar
                          src={teacher?.photo}
                          name={teacherName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {teacherName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {viewed ? 'Visualizado' : 'Pendente de leitura'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-5">
            <p className="text-sm font-medium text-white">Leitores</p>

            {isPublic ? (
              <p className="mt-1 text-sm text-slate-400">
                Aviso público — leitura não é rastreada.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {readers.read} de {readers.total} visualizados
                  </span>
                  <span className="font-medium text-emerald-400">
                    {readerProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${readerProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-800 pt-5">
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
