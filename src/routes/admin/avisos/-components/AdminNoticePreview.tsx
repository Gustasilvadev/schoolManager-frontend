import {
  CalendarDays,
  Eye,
  ExternalLink,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { NoticePriorityBadge } from '@/components/shared/NoticePriorityBadge'
import { formatNoticeDate, getNoticeReadersInfo } from '@/utils/noticeFormatters'
import {
  getNoticeVisibilityLabel,
  NoticeVisibilityBadge,
} from './NoticeVisibilityBadge'
import type { NoticeItem } from '@/types/notice'

interface AdminNoticePreviewProps {
  notice: NoticeItem | null
  teacherNameById: Map<number, string>
  onViewFull: (notice: NoticeItem) => void
  onClosePreview: () => void
}

export function AdminNoticePreview({
  notice,
  teacherNameById,
  onViewFull,
  onClosePreview,
}: AdminNoticePreviewProps) {
  if (!notice) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-6">
        <div className="flex h-56 flex-col items-center justify-center text-center">
          <Eye className="mb-3 h-8 w-8 text-slate-600" />

          <p className="text-sm font-medium text-slate-300">
            Nenhum aviso selecionado
          </p>

          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Clique em um aviso ou no ícone de visualização para abrir a prévia.
          </p>
        </div>
      </aside>
    )
  }

  const visibilities = notice.notice_visibilities ?? []
  const readers = getNoticeReadersInfo(notice)
  const visibilityLabel = getNoticeVisibilityLabel(notice)

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-400" />

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Prévia do aviso
          </p>
        </div>

        <button
          type="button"
          onClick={onClosePreview}
          title="Fechar prévia"
          className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-6 px-5 py-5">
        <div>
          <StatusBadge status={notice.notice_status} />

          <h2 className="mt-4 text-lg font-semibold leading-7 text-white">
            {notice.notice_title}
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {notice.notice_content}
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-5">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>Data de publicação: {formatNoticeDate(notice.notice_date)}</span>
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
          <p className="text-sm font-medium text-white">Quem pode visualizar</p>

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

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {visibilities.map((visibility) => (
                  <div
                    key={visibility.notice_visibility_id}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-slate-200">
                      {teacherNameById.get(visibility.teacher_id) ??
                        `Professor #${visibility.teacher_id}`}
                    </p>

                    <p className="text-xs text-slate-500">
                      Vinculado ao aviso
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-5">
          <p className="text-sm font-medium text-white">Leitores</p>

          <p className="mt-1 text-sm text-slate-400">
            {readers.total > 0
              ? `${readers.read} de ${readers.total} professores visualizaram este aviso.`
              : 'Ainda não há leitura registrada para este aviso.'}
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-5">
          <Button
            type="button"
            variant="ghost"
            size="full"
            onClick={() => onViewFull(notice)}
          >
            Ver aviso completo
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
