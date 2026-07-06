import {
  CalendarDays,
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { NoticePriorityBadge } from '@/components/shared/NoticePriorityBadge'
import { cn } from '@/lib/utils'
import { formatNoticeDate } from '@/utils/noticeFormatters'
import { NoticeVisibilityBadge } from './NoticeVisibilityBadge'
import type { NoticeItem } from '@/types/notice'

interface AdminNoticeCardProps {
  notice: NoticeItem
  selected: boolean
  canEdit: boolean
  onSelect: (notice: NoticeItem) => void
  onEdit: (notice: NoticeItem) => void
  onDelete: (notice: NoticeItem) => void
  onRestore: (notice: NoticeItem) => void
}

function getReadersLabel(notice: NoticeItem) {
  const visibilities = notice.notice_visibilities ?? []

  if (visibilities.length === 0) return 'Visível a todos'

  const read = visibilities.filter((visibility) =>
    Boolean(visibility.notice_visibility_viewed_in),
  ).length

  return `${read}/${visibilities.length} leitores`
}

function getPreview(content: string) {
  if (content.length <= 135) return content

  return `${content.slice(0, 135).trim()}...`
}

export function AdminNoticeCard({
  notice,
  selected,
  canEdit,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
}: AdminNoticeCardProps) {
  const isDeleted = Number(notice.notice_status) === 2

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(notice)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(notice)
      }}
      className={cn(
        'cursor-pointer rounded-2xl border bg-slate-900/50 px-5 py-4 text-left transition hover:border-blue-500/40 hover:bg-slate-900',
        selected
          ? 'border-blue-500/70 bg-blue-500/5 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]'
          : 'border-slate-800',
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px_112px] lg:items-center">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">
            {notice.notice_title}
          </h2>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
            {getPreview(notice.notice_content)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <NoticeVisibilityBadge notice={notice} />
            <NoticePriorityBadge priority={notice.notice_priority} />
            <StatusBadge status={notice.notice_status} />
          </div>
        </div>

        <div className="space-y-2 border-slate-800 text-xs text-slate-400 lg:border-l lg:pl-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatNoticeDate(notice.notice_date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{getReadersLabel(notice)}</span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-1 border-slate-800 lg:justify-end lg:border-l lg:pl-4">
          <Button
            variant="ghost"
            size="sm"
            title="Visualizar"
            className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            onClick={(event) => {
              event.stopPropagation()
              onSelect(notice)
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {canEdit && !isDeleted && (
            <Button
              variant="ghost"
              size="sm"
              title="Editar"
              className="h-8 w-8 p-0"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(notice)
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          {canEdit && isDeleted ? (
            <Button
              variant="ghost"
              size="sm"
              title="Restaurar"
              className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              onClick={(event) => {
                event.stopPropagation()
                onRestore(notice)
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              title="Excluir"
              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(notice)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
