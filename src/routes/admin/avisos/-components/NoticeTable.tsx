import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { NoticeItem, NoticePriority } from '@/types/notice'

interface NoticeTableProps {
  notices: NoticeItem[]
  isLoading: boolean
  canEdit: boolean
  onEdit: (notice: NoticeItem) => void
  onDelete: (notice: NoticeItem) => void
  onRestore: (notice: NoticeItem) => void
}

const columnHelper = createColumnHelper<NoticeItem>()

const PRIORITY_MAP: Record<
  NoticePriority,
  { label: string; className: string }
> = {
  1: {
    label: 'Baixa',
    className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  },
  2: {
    label: 'Média',
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  3: {
    label: 'Alta',
    className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  },
  4: {
    label: 'Urgente',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
}

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  })
}

function getVisibilityLabel(notice: NoticeItem) {
  const visibilities = notice.notice_visibilities ?? []

  return visibilities.length > 0 ? 'Restrita' : 'Pública'
}

function getReadersLabel(notice: NoticeItem) {
  const visibilities = notice.notice_visibilities ?? []

  if (visibilities.length === 0) return '—'

  const read = visibilities.filter((visibility) =>
    Boolean(visibility.notice_visibility_viewed_in),
  ).length

  return `${read}/${visibilities.length}`
}

function PriorityBadge({ priority }: { priority: NoticePriority }) {
  const config = PRIORITY_MAP[priority]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

export function NoticeTable({
  notices,
  isLoading,
  canEdit,
  onEdit,
  onDelete,
  onRestore,
}: NoticeTableProps) {
  const columns = [
    columnHelper.accessor('notice_title', {
      header: 'Título',
      cell: (info) => (
        <span className="font-medium text-white">{info.getValue()}</span>
      ),
    }),

    columnHelper.accessor('notice_date', {
      header: 'Data',
      cell: (info) => (
        <span className="text-slate-300">{formatDate(info.getValue())}</span>
      ),
    }),

    columnHelper.display({
      id: 'visibility',
      header: 'Visibilidade',
      cell: ({ row }) => (
        <span className="text-slate-300">
          {getVisibilityLabel(row.original)}
        </span>
      ),
    }),

    columnHelper.accessor('notice_priority', {
      header: 'Prioridade',
      cell: (info) => <PriorityBadge priority={info.getValue()} />,
    }),

    columnHelper.display({
      id: 'viewed',
      header: 'Leitores',
      cell: ({ row }) => (
        <span className="text-slate-300">{getReadersLabel(row.original)}</span>
      ),
    }),

    columnHelper.accessor('notice_status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const notice = row.original
        const isDeleted = Number(notice.notice_status) === 2

        return (
          <div className="flex items-center gap-1">
            {canEdit && !isDeleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(notice)}
                title="Editar"
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}

            {canEdit && isDeleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(notice)}
                title="Restaurar"
                className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            ) : canEdit ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notice)}
                title="Excluir"
                className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: notices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-800">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    )
  }

  if (notices.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-800">
        <p className="text-sm text-slate-500">Nenhum aviso encontrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="transition-colors hover:bg-slate-800/40"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
