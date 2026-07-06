import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useStudents,
  useDeleteStudent,
  useRestoreStudent,
} from '@/hooks/useStudents'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StudentTable } from './-components/StudentTable'
import { StudentFormModal } from './-components/StudentFormModal'
import { StudentViewModal } from './-components/StudentViewModal'
import type { Student } from '@/types/student'

export const Route = createFileRoute('/admin/alunos/')({
  component: AlunosPage,
})

const LIMIT = 10

function AlunosPage() {
  const navigate = Route.useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null)
  const [pendingRestore, setPendingRestore] = useState<Student | null>(null)

  const { mutateAsync: deleteStudent, isPending: isDeleting } =
    useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } =
    useRestoreStudent()

  const { data, isLoading, isError } = useStudents({
    page,
    limit: LIMIT,
    name: search || undefined,
    includeDeleted,
  })

  const students = data?.students ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleToggleDeleted(checked: boolean) {
    setIncludeDeleted(checked)
    setPage(1)
  }

  function handleView(student: Student) {
    setViewingStudent(student)
  }

  function handleViewGrades(student: Student) {
    navigate({
      to: '/admin/alunos/$id/boletim',
      params: { id: String(student.student_id) },
    })
  }

  function handleEdit(student: Student) {
    setEditingStudent(student)
  }

  function handleDelete(student: Student) {
    setPendingDelete(student)
  }

  function handleRestore(student: Student) {
    setPendingRestore(student)
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteStudent(pendingDelete.student_id)
      toast.success('Aluno excluído com sucesso')
      setPendingDelete(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir aluno',
      )
    }
  }

  async function handleConfirmRestore() {
    if (!pendingRestore) return
    try {
      const { message } = await restoreStudent(pendingRestore.student_id)
      toast.success(message)
      setPendingRestore(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao restaurar aluno',
      )
    }
  }

  useEffect(() => {
    if (isError) {
      console.error('[useStudents] erro ao carregar alunos')
      toast.error('Erro ao carregar alunos')
    }
  }, [isError])

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Alunos</h1>
              <p className="text-xs text-slate-400">
                {total > 0
                  ? `${total} aluno${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
                  : 'Nenhum aluno'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreating(true)}>
              <UserPlus className="h-4 w-4" />
              Novo Aluno
            </Button>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
              <span>Incluir excluídos</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={includeDeleted}
                  onChange={(e) => handleToggleDeleted(e.target.checked)}
                />
                <div className="h-5 w-9 rounded-full bg-slate-700 transition-colors peer-checked:bg-blue-600" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <StudentTable
          students={students}
          isLoading={isLoading}
          onView={handleView}
          onViewGrades={handleViewGrades}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <StudentViewModal
        student={viewingStudent}
        open={viewingStudent !== null}
        onClose={() => setViewingStudent(null)}
      />

      <StudentFormModal
        student={null}
        open={isCreating}
        onClose={() => setIsCreating(false)}
      />

      <StudentFormModal
        student={editingStudent}
        open={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir Aluno"
        description={`Deseja excluir o aluno "${pendingDelete?.student_name}"?\nEsta ação pode ser desfeita posteriormente.`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingRestore !== null}
        title="Restaurar Aluno"
        description={`Deseja restaurar o aluno "${pendingRestore?.student_name}"?\nO registro voltará a ficar ativo no sistema.`}
        confirmLabel="Restaurar"
        isLoading={isRestoring}
        onConfirm={handleConfirmRestore}
        onClose={() => setPendingRestore(null)}
      />
    </>
  )
}
