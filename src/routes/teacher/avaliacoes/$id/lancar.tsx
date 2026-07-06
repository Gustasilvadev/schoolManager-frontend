import { createFileRoute, Link } from '@tanstack/react-router'
import { useTest } from '@/hooks/useTests'
import { useGradesByTest } from '@/hooks/useGrades'
import { useClassStudents } from '@/hooks/useClassStudents'
import { useClassIdFromDiscipline } from '@/hooks/useClassIdFromDiscipline'
import { GradeSheet } from './-components/GradeSheet'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const Route = createFileRoute('/teacher/avaliacoes/$id/lancar')({
  component: LancarNotasPage,
})

function LancarNotasPage() {
  const { id } = Route.useParams()
  const testId = parseInt(id, 10)

  const { data: test, isLoading: isLoadingTest } = useTest(testId)
  const { data: existingGrades, isLoading: isLoadingGrades } = useGradesByTest(testId)
  const { classId, isLoading: isLoadingClassId } = useClassIdFromDiscipline(test?.class_discipline_id)
  const { data: students, isLoading: isLoadingStudents } = useClassStudents(classId ?? 0)

  const isLoading =
    isLoadingTest || isLoadingGrades || isLoadingClassId || (!!classId && isLoadingStudents)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">Avaliação não encontrada.</p>
        <Link to="/teacher/avaliacoes">
          <Button variant="ghost" className="mt-4">
            Voltar para listagem
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-4">
        <Link to="/teacher/avaliacoes" className="w-fit">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 -ml-2 text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para avaliações
          </Button>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Lançar Notas</h1>
          <p className="text-slate-400 text-sm">
            <span className="text-blue-400 font-medium">{test.test_type}</span>
            {test.test_description && (
              <>
                <span className="mx-2 text-slate-700">—</span>
                <span>{test.test_description}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {!classId && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 text-yellow-400 text-sm">
          Não foi possível identificar a turma desta avaliação. Verifique se a disciplina ainda está vinculada a uma turma ativa.
        </div>
      )}

      <GradeSheet
        testId={testId}
        students={students ?? []}
        existingGrades={existingGrades ?? []}
        classDisciplineId={test.class_discipline_id}
      />
    </div>
  )
}
