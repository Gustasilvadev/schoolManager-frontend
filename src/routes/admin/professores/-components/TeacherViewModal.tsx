import type { ReactNode } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useTeacher } from '@/hooks/useTeachers'
import type { Teacher } from '@/types/teacher'
import { Loader2 } from 'lucide-react'

interface TeacherViewModalProps {
  teacher: Teacher | null
  open: boolean
  onClose: () => void
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}

export function TeacherViewModal({
  teacher,
  open,
  onClose,
}: TeacherViewModalProps) {
  const { data, isLoading, isError } = useTeacher(
    open ? teacher?.teacher_id : undefined,
  )
  const currentTeacher = data
    ? { ...data, user_photo: data.user_photo ?? teacher?.user_photo }
    : teacher

  return (
    <Dialog open={open} onClose={onClose} title="Detalhes do Professor">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : isError || !currentTeacher ? (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950 px-4 py-3 text-sm text-yellow-300">
          Não foi possível carregar os dados do professor.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InfoRow label="Nome" value={currentTeacher.teacher_name} />
          </div>
          <InfoRow
            label="CPF"
            value={
              <span className="font-mono">{currentTeacher.teacher_cpf}</span>
            }
          />
          <InfoRow label="E-mail" value={currentTeacher.teacher_email} />
          <InfoRow
            label="Status"
            value={<StatusBadge status={currentTeacher.teacher_status} />}
          />
        </div>
      )}
    </Dialog>
  )
}
