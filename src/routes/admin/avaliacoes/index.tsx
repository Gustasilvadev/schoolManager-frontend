import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTests } from '@/hooks/useTests'
import { useClassDisciplines } from '@/hooks/useClassDisciplines'
import { TestFormModal } from '@/components/tests/TestFormModal'
import { AdminTestList } from './-components/AdminTestList'
import { ClassDisciplineFilter } from '@/components/classes/ClassDisciplineFilter'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import type { Test, StatusValue } from '@/types/test'
import { STATUS } from '@/types/test'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<StatusFilter, StatusValue> = {
  active: STATUS.ACTIVE,
  deleted: STATUS.DELETED,
}

type StatusFilter = 'active' | 'deleted'

export const Route = createFileRoute('/admin/avaliacoes/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { classId?: number; classDisciplineId?: number; status: StatusFilter } => ({
    classId: Number(search.classId) || undefined,
    classDisciplineId: Number(search.classDisciplineId) || undefined,
    status: search.status === 'deleted' ? 'deleted' : 'active',
  }),
  component: AdminAvaliacoesPage,
})

function AdminAvaliacoesPage() {
  const { classId, classDisciplineId, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | undefined>()

  const { data: testsData, isLoading } = useTests({
    class_discipline_id: classDisciplineId,
    test_status: STATUS_MAP[status],
  })

  const { data: classDisciplinesData } = useClassDisciplines(classId || 0)

  const classDisciplineMap = useMemo(() => {
    const map = new Map<number, string>()
    classDisciplinesData?.forEach((entry) => {
      map.set(
        entry.class_discipline_id,
        entry.disciplines?.discipline_name ?? `#${entry.class_discipline_id}`,
      )
    })
    return map
  }, [classDisciplinesData])

  const tests = useMemo(() => {
    const all = testsData?.tests ?? []
    if (classId && !classDisciplineId && classDisciplinesData) {
      const validIds = new Set(classDisciplinesData.map((e) => e.class_discipline_id))
      return all.filter((t) => validIds.has(t.class_discipline_id))
    }
    return all
  }, [testsData, classId, classDisciplineId, classDisciplinesData])

  const handleClassChange = (id?: number) => {
    navigate({
      search: (prev) => ({ ...prev, classId: id, classDisciplineId: undefined }),
    })
  }

  const handleClassDisciplineChange = (id?: number) => {
    navigate({ search: (prev) => ({ ...prev, classDisciplineId: id }) })
  }

  const handleStatusChange = (next: StatusFilter) => {
    navigate({ search: (prev) => ({ ...prev, status: next }) })
  }

  const handleCreate = () => {
    setEditingTest(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (test: Test) => {
    setEditingTest(test)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTest(undefined)
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Avaliações</h1>
          <p className="text-slate-400 text-sm">
            Gerencie todas as avaliações do sistema.
          </p>
        </div>

        <Button className="flex items-center gap-2 h-11" onClick={handleCreate}>
          <Plus className="w-5 h-5" />
          Nova avaliação
        </Button>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap items-end gap-6">
        <ClassDisciplineFilter
          selectedClassId={classId}
          onClassChange={handleClassChange}
          selectedClassDisciplineId={classDisciplineId}
          onClassDisciplineChange={handleClassDisciplineChange}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Status
          </label>
          <div className="flex rounded-lg border border-slate-800 overflow-hidden">
            {(['active', 'deleted'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  status === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800',
                )}
              >
                {s === 'active' ? 'Ativas' : 'Excluídas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden">
        <AdminTestList
          tests={tests}
          isLoading={isLoading}
          onEdit={handleEdit}
          classDisciplineMap={classDisciplineMap}
        />
      </div>

      <TestFormModal open={isModalOpen} onClose={handleCloseModal} test={editingTest} />
    </div>
  )
}
