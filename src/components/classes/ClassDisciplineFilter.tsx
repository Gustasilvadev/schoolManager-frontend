import { useClasses } from '@/hooks/useClasses'
import { useClassDisciplines } from '@/hooks/useClassDisciplines'
import { cn } from '@/lib/utils'

interface ClassDisciplineFilterProps {
  selectedClassId?: number
  onClassChange: (id?: number) => void
  selectedClassDisciplineId?: number
  onClassDisciplineChange: (id?: number) => void
  className?: string
}

export function ClassDisciplineFilter({
  selectedClassId,
  onClassChange,
  selectedClassDisciplineId,
  onClassDisciplineChange,
  className,
}: ClassDisciplineFilterProps) {
  const { data: classesData, isLoading: isLoadingClasses } = useClasses({
    class_status: 1,
  })

  const { data: disciplinesData, isLoading: isLoadingDisciplines } =
    useClassDisciplines(selectedClassId || 0)

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Turma
        </label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => {
            const val = e.target.value
            onClassChange(val ? Number(val) : undefined)
            onClassDisciplineChange(undefined)
          }}
          disabled={isLoadingClasses}
          className="bg-slate-900 border border-slate-800 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  outline-none transition-all hover:border-slate-700"
        >
          <option value="">Todas as turmas</option>
          {classesData?.classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name} ({cls.class_school_year})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Disciplina
        </label>
        <select
          value={selectedClassDisciplineId || ''}
          onChange={(e) => {
            const val = e.target.value
            onClassDisciplineChange(val ? Number(val) : undefined)
          }}
          disabled={!selectedClassId || isLoadingDisciplines}
          className={cn(
            'bg-slate-900 border border-slate-800 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all hover:border-slate-700',
            !selectedClassId && 'opacity-50 cursor-not-allowed',
          )}
        >
          <option value="">Todas as disciplinas</option>
          {disciplinesData?.map((entry) => (
            <option
              key={entry.class_discipline_id}
              value={entry.class_discipline_id}
            >
              {entry.disciplines?.discipline_name || 'Sem nome'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
