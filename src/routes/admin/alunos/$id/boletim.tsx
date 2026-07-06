import { createFileRoute } from '@tanstack/react-router'
import { StudentReportCard } from '@/routes/-components/report/StudentReportCard'

export const Route = createFileRoute('/admin/alunos/$id/boletim')({
  component: AlunoBoletimPage,
})

function AlunoBoletimPage() {
  const { id } = Route.useParams()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Boletim Escolar</h1>
        <p className="text-slate-400 text-sm">
          Visualização administrativa das notas do aluno.
        </p>
      </div>

      <StudentReportCard
        studentId={id}
        canCalculate={false}
        canRecalculateAll
      />
    </div>
  )
}
