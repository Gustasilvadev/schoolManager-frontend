import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Test } from '@/types/test'
import { useCreateTest, useUpdateTest } from '@/hooks/useCreateUpdateTest'
import { useClasses } from '@/hooks/useClasses'
import { useClassDisciplines } from '@/hooks/useClassDisciplines'
import { useEffect } from 'react'
import { AlertTriangle, Lock } from 'lucide-react'

const testSchema = z.object({
  test_type: z.string().min(1, 'Obrigatório').max(45, 'Máximo 45 caracteres'),
  test_description: z.string().min(1, 'Obrigatório').max(45, 'Máximo 45 caracteres'),
  class_id: z.string(),
  class_discipline_id: z.string(),
})

type TestFormData = z.infer<typeof testSchema>

interface TestFormModalProps {
  open: boolean
  onClose: () => void
  test?: Test
}

export function TestFormModal({ open, onClose, test }: TestFormModalProps) {
  const isEditing = !!test
  const { mutate: createTest, isPending: isCreating } = useCreateTest()
  const { mutate: updateTest, isPending: isUpdating } = useUpdateTest()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { test_type: '', test_description: '', class_id: '', class_discipline_id: '' },
  })

  const selectedClassId = watch('class_id')
  const { data: classesData } = useClasses({ class_status: 1 })
  const { data: disciplinesData } = useClassDisciplines(
    selectedClassId ? parseInt(selectedClassId, 10) : 0,
  )

  useEffect(() => {
    if (open) {
      if (test) {
        reset({
          test_type: test.test_type,
          test_description: test.test_description,
          class_id: '',
          class_discipline_id: test.class_discipline_id.toString(),
        })
      } else {
        reset({ test_type: '', test_description: '', class_id: '', class_discipline_id: '' })
      }
    }
  }, [open, test, reset])

  const onSubmit = (data: TestFormData) => {
    if (!isEditing) {
      let hasError = false
      if (!data.class_id) {
        setError('class_id', { message: 'Selecione uma turma' })
        hasError = true
      }
      if (!data.class_discipline_id) {
        setError('class_discipline_id', { message: 'Selecione uma disciplina' })
        hasError = true
      }
      if (hasError) return

      createTest(
        {
          test_type: data.test_type,
          test_description: data.test_description,
          class_discipline_id: parseInt(data.class_discipline_id, 10),
        },
        { onSuccess: () => { onClose(); reset() } },
      )
    } else {
      updateTest(
        {
          id: test.test_id,
          data: { test_type: data.test_type, test_description: data.test_description },
        },
        { onSuccess: () => { onClose(); reset() } },
      )
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
      onClose={onClose}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isEditing && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-700/50 bg-yellow-900/20 px-4 py-3 text-yellow-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Alterar tipo ou descrição afeta a identificação desta avaliação.</span>
          </div>
        )}

        <Input
          label="Tipo *"
          {...register('test_type')}
          placeholder="Ex: Prova, Trabalho, Apresentação"
          error={errors.test_type?.message}
        />

        <Input
          label="Descrição *"
          {...register('test_description')}
          placeholder="Ex: Prova 1 — 1º Bimestre"
          error={errors.test_description?.message}
        />

        {isEditing ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-slate-400 text-xs">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Turma e disciplina não podem ser alteradas após a criação.</span>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Turma *</label>
              <select
                {...register('class_id')}
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma turma</option>
                {classesData?.classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
              {errors.class_id && (
                <span className="text-xs text-red-500">{errors.class_id.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Disciplina *</label>
              <select
                {...register('class_discipline_id')}
                disabled={!selectedClassId}
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinesData?.map((entry) => (
                  <option key={entry.class_discipline_id} value={entry.class_discipline_id}>
                    {entry.disciplines?.discipline_name}
                  </option>
                ))}
              </select>
              {errors.class_discipline_id && (
                <span className="text-xs text-red-500">{errors.class_discipline_id.message}</span>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isCreating || isUpdating}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEditing ? 'Salvar Alterações' : 'Criar Avaliação'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
