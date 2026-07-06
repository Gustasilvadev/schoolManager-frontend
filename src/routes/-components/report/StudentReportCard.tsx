import { useQuery } from '@tanstack/react-query'
import { listGradesByStudent } from '@/integrations/grades/gradesApi'
import {
  useStudentFinalAverages,
  useCalculateFinalAverage,
  useCalculateAveragesBatch,
} from '@/hooks/useFinalAverages'
import { useClassDisciplineNameMap } from '@/hooks/useClassDisciplineNameMap'
import { useStudent } from '@/hooks/useStudents'
import { DisciplineGradeCard } from './DisciplineGradeCard'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { GradeWithTest } from '@/types/grade'
import { Calculator, Loader2 } from 'lucide-react'

interface StudentReportCardProps {
  studentId: string
  canCalculate?: boolean
  canRecalculateAll?: boolean
}

export function StudentReportCard({
  studentId,
  canCalculate,
  canRecalculateAll = false,
}: StudentReportCardProps) {
  const numericStudentId = Number(studentId)
  const {
    data: student,
    isLoading: isLoadingStudent,
    isError: isStudentError,
  } = useStudent(
    Number.isFinite(numericStudentId) ? numericStudentId : undefined,
  )

  const { data: grades, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades', 'byStudent', studentId],
    queryFn: () => listGradesByStudent(studentId),
    enabled: !!studentId,
  })

  const { data: averages, isLoading: isLoadingAverages } =
    useStudentFinalAverages(studentId)
  const { mutate: calculateAverage } = useCalculateFinalAverage()
  const { mutate: recalculateAll, isPending: isRecalculating } =
    useCalculateAveragesBatch()
  const { nameMap: disciplineNames } = useClassDisciplineNameMap()

  if (isLoadingStudent || isLoadingGrades || isLoadingAverages) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (isStudentError || !student) {
    return (
      <div className="rounded-lg border border-yellow-800 bg-yellow-950 px-4 py-3 text-sm text-yellow-300">
        Não foi possível carregar os dados cadastrais do aluno.
      </div>
    )
  }

  const statusLabel =
    student.student_status === 2
      ? 'Inativo'
      : student.student_status === 1
        ? 'Ativo'
        : '—'

  const gradesByDiscipline = new Map<string, GradeWithTest[]>()
  for (const grade of grades ?? []) {
    const key = grade.tests.class_discipline_id.toString()
    const list = gradesByDiscipline.get(key)
    if (list) list.push(grade)
    else gradesByDiscipline.set(key, [grade])
  }

  function handleRecalculateAll() {
    const pairs = [...gradesByDiscipline.keys()].map((cdId) => ({
      studentId: Number(studentId),
      classDisciplineId: Number(cdId),
    }))
    if (pairs.length > 0) recalculateAll(pairs)
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
        <Avatar
          src={student.student_photo}
          name={student.student_name}
          size="lg"
          fallbackClassName="bg-blue-600/20 text-blue-400"
        />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            {student.student_name || 'Aluno'}
          </h2>
          <p className="text-slate-400 text-sm">
            E-mail: {student.student_email || '—'} • Status: {statusLabel}
          </p>
        </div>

        {canRecalculateAll && (
          <Button
            variant="ghost"
            onClick={handleRecalculateAll}
            disabled={isRecalculating || gradesByDiscipline.size === 0}
            title="Recalcular as médias deste aluno a partir das notas atuais"
            className="ml-auto flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
          >
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            Recalcular médias
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...gradesByDiscipline].map(([classDisciplineId, discGrades]) => (
          <DisciplineGradeCard
            key={classDisciplineId}
            disciplineName={
              disciplineNames.get(Number(classDisciplineId)) ??
              `Disciplina #${classDisciplineId}`
            }
            grades={discGrades}
            finalAverage={averages?.find(
              (a) => a.class_discipline_id.toString() === classDisciplineId,
            )}
            canCalculate={canCalculate}
            onCalculate={(classDiscId) => {
              calculateAverage({ studentId, classDisciplineId: classDiscId })
            }}
          />
        ))}

        {gradesByDiscipline.size === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-500">
              Nenhuma nota lançada para este aluno ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
