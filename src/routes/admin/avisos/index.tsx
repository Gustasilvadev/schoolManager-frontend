import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Bell, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useTeachers } from '@/hooks/useTeachers'
import { NoticeFormModal } from './-components/NoticeFormModal'
import { AdminNoticeCard } from './-components/AdminNoticeCard'
import { AdminNoticePreview } from './-components/AdminNoticePreview'
import { AdminNoticeDetailsModal } from './-components/AdminNoticeDetailsModal'
import {
  useDeleteNotice,
  useNotices,
  useRestoreNotice,
} from '@/hooks/useNotices'
import type { NoticeItem, NoticeStatus } from '@/types/notice'

export const Route = createFileRoute('/admin/avisos/')({
  component: AvisosPage,
})

const LIMIT = 10

type StatusFilter = 'all' | NoticeStatus

function AvisosPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editing, setEditing] = useState<NoticeItem | null>(null)
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null)

  const selectedStatus = status === 'all' ? undefined : status

  const { data, isLoading, isError } = useNotices({
    page,
    limit: LIMIT,
    notice_title: search || undefined,
    notice_status: selectedStatus,
    includeDeleted: includeDeleted || selectedStatus === 2,
  })

  const { data: teachersData } = useTeachers({
    page: 1,
    limit: 100,
    includeDeleted: true,
  })

  const { mutate: deleteNotice } = useDeleteNotice()
  const { mutate: restoreNotice } = useRestoreNotice()

  const notices = data?.notices ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const teacherNameById = useMemo(() => {
    const teachers = teachersData?.teachers ?? []

    return new Map(
      teachers.map((teacher) => [teacher.teacher_id, teacher.teacher_name]),
    )
  }, [teachersData])

  const selectedNotice = useMemo(() => {
    if (!selectedNoticeId) return null

    return (
      notices.find((notice) => notice.notice_id === selectedNoticeId) ?? null
    )
  }, [notices, selectedNoticeId])

  useEffect(() => {
    if (isError) toast.error('Erro ao carregar avisos')
  }, [isError])

  useEffect(() => {
    if (!selectedNoticeId) return

    const hasSelectedNotice = notices.some(
      (notice) => notice.notice_id === selectedNoticeId,
    )

    if (!hasSelectedNotice) {
      setSelectedNoticeId(null)
      setDetailsOpen(false)
    }
  }, [notices, selectedNoticeId])

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
    setSelectedNoticeId(null)
    setDetailsOpen(false)
  }

  function handleStatusChange(value: string) {
    const nextStatus = value === 'all' ? 'all' : (Number(value) as NoticeStatus)

    setStatus(nextStatus)
    setPage(1)
    setSelectedNoticeId(null)
    setDetailsOpen(false)

    if (nextStatus === 2) {
      setIncludeDeleted(true)
    }
  }

  function handleCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleSelect(notice: NoticeItem) {
    setSelectedNoticeId((currentId) =>
      currentId === notice.notice_id ? null : notice.notice_id,
    )

    setDetailsOpen(false)
  }

  function handleViewFull(notice: NoticeItem) {
    setSelectedNoticeId(notice.notice_id)
    setDetailsOpen(true)
  }

  function handleEdit(notice: NoticeItem) {
    setEditing(notice)
    setModalOpen(true)
  }

  function handleDelete(notice: NoticeItem) {
    const confirmed = window.confirm(
      `Deseja excluir o aviso "${notice.notice_title}"?`,
    )

    if (!confirmed) return

    deleteNotice(notice.notice_id)
  }

  function handleRestore(notice: NoticeItem) {
    const confirmed = window.confirm(
      `Deseja restaurar o aviso "${notice.notice_title}"?`,
    )

    if (!confirmed) return

    restoreNotice(notice.notice_id)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleClosePreview() {
    setSelectedNoticeId(null)
    setDetailsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-white">Avisos</h1>
            <p className="text-xs text-slate-400">
              {total > 0
                ? `${total} aviso${total !== 1 ? 's' : ''} encontrado${
                    total !== 1 ? 's' : ''
                  }`
                : 'Nenhum aviso'}
            </p>
          </div>
        </div>

        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Novo Aviso
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          <option value={1}>Ativo</option>
          <option value={0}>Inativo</option>
          <option value={2}>Excluído</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
          <span className="whitespace-nowrap text-xs">Incluir excluídos</span>
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={includeDeleted}
              onChange={(event) => {
                setIncludeDeleted(event.target.checked)
                setPage(1)
                setSelectedNoticeId(null)
                setDetailsOpen(false)
              }}
            />
            <div className="h-5 w-9 rounded-full bg-slate-700 transition-colors peer-checked:bg-blue-600" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </div>
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-800">
              <p className="text-sm text-slate-500">Carregando avisos...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-800">
              <p className="text-sm text-slate-500">Nenhum aviso encontrado.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <AdminNoticeCard
                key={notice.notice_id}
                notice={notice}
                selected={selectedNotice?.notice_id === notice.notice_id}
                canEdit
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                Página {page} de {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
            <AdminNoticePreview
              notice={selectedNotice}
              teacherNameById={teacherNameById}
              onViewFull={handleViewFull}
              onClosePreview={handleClosePreview}
            />
          </div>
        </div>
      </div>

      <NoticeFormModal
        open={modalOpen}
        editing={editing}
        onClose={handleCloseModal}
      />

      <AdminNoticeDetailsModal
        open={detailsOpen}
        notice={selectedNotice}
        teacherNameById={teacherNameById}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  )
}
