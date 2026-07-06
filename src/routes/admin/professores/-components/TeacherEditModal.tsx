import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTeacher, useUpdateTeacher } from '@/hooks/useTeachers'
import {
  getTeacherByCpf,
  getTeacherByEmail,
} from '@/integrations/teachers/teachersApi'
import type { Teacher } from '@/types/teacher'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  teacher_name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  teacher_cpf: z.string().min(1, 'Campo obrigatório'),
  teacher_email: z.string().email('E-mail inválido'),
})

type FormValues = z.infer<typeof schema>

interface TeacherEditModalProps {
  teacher: Teacher | null
  open: boolean
  onClose: () => void
}

export function TeacherEditModal({
  teacher,
  open,
  onClose,
}: TeacherEditModalProps) {
  const { mutateAsync: updateTeacher, isPending } = useUpdateTeacher()
  const teacherId = open ? teacher?.teacher_id : undefined
  const { data: teacherDetails, isLoading, isError } = useTeacher(teacherId)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open && teacherDetails) {
      reset({
        teacher_name: teacherDetails.teacher_name,
        teacher_cpf: teacherDetails.teacher_cpf,
        teacher_email: teacherDetails.teacher_email,
      })
    }
  }, [open, teacherDetails, reset])

  async function onSubmit(values: FormValues) {
    if (!teacherDetails) return

    const cpfChanged = values.teacher_cpf !== teacherDetails.teacher_cpf
    const emailChanged = values.teacher_email !== teacherDetails.teacher_email

    let hasConflict = false

    if (cpfChanged) {
      const existing = await getTeacherByCpf(values.teacher_cpf)
      if (existing && existing.teacher_id !== teacherDetails.teacher_id) {
        setError('teacher_cpf', { message: 'CPF já cadastrado' })
        hasConflict = true
      }
    }

    if (emailChanged) {
      const existing = await getTeacherByEmail(values.teacher_email)
      if (existing && existing.teacher_id !== teacherDetails.teacher_id) {
        setError('teacher_email', { message: 'E-mail já cadastrado' })
        hasConflict = true
      }
    }

    if (hasConflict) return

    try {
      await updateTeacher({ id: teacherDetails.teacher_id, payload: values })
      toast.success('Professor atualizado com sucesso')
      onClose()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar professor'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Editar Professor">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : isError || !teacherDetails ? (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950 px-4 py-3 text-sm text-yellow-300">
          Não foi possível carregar os dados do professor.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            error={errors.teacher_name?.message}
            {...register('teacher_name')}
          />
          <Input
            label="CPF"
            placeholder="00000000000"
            error={errors.teacher_cpf?.message}
            {...register('teacher_cpf')}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="professor@escola.com"
            error={errors.teacher_email?.message}
            {...register('teacher_email')}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
