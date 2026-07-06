import { useState } from 'react'
import { useBulkCreateGrades, useUpdateGrade } from '@/hooks/useGrades'
import { useCalculateAveragesBatch } from '@/hooks/useFinalAverages'
import { parseGradeValue } from '@/utils/grade'
import { toast } from 'sonner'
import type { Grade } from '@/types/grade'
import type { GradeSheetStudent } from '@/types/student'

export interface RowState {
  value: string
  status: 'idle' | 'success' | 'error'
}

export function useGradeSheetSave(
  testId: number,
  students: GradeSheetStudent[],
  existingGrades: Grade[],
  classDisciplineId?: number,
) {
  const [formState, setFormState] = useState<Record<string, RowState>>({})
  const { mutateAsync: bulkCreate, isPending: isBulkCreating } = useBulkCreateGrades()
  const { mutateAsync: updateGrade, isPending: isUpdating } = useUpdateGrade()
  const { mutate: calculateBatch, isPending: isCalculating } =
    useCalculateAveragesBatch()

  const handleRowChange = (studentId: string, data: { value: string }) => {
    setFormState((prev) => ({
      ...prev,
      [studentId]: { value: data.value, status: 'idle' },
    }))
  }

  const handleSaveAll = async () => {
    const toCreate: Array<{ student_id: number; test_id: number; grade_value: number }> = []
    const toUpdate: Array<{ id: number; data: { grade_value: number } }> = []

    students.forEach((student) => {
      const state = formState[student.student_id.toString()] as RowState | undefined
      if (!state) return

      const existing = existingGrades.find((g) => g.student_id === student.student_id)
      const numericValue = parseGradeValue(state.value)

      if (isNaN(numericValue)) return

      if (numericValue < 0 || numericValue > 10) {
        setFormState((prev) => ({
          ...prev,
          [student.student_id]: { ...state, status: 'error' },
        }))
        return
      }

      if (!existing) {
        toCreate.push({ student_id: student.student_id, test_id: testId, grade_value: numericValue })
      } else if (existing.grade_value !== numericValue) {
        toUpdate.push({ id: existing.grade_id, data: { grade_value: numericValue } })
      }
    })

    if (toCreate.length === 0 && toUpdate.length === 0) {
      toast.info('Nenhuma alteração para salvar')
      return
    }

    try {
      if (toCreate.length > 0) {
        await bulkCreate({ grades: toCreate })
        toCreate.forEach((item) => {
          setFormState((prev) => ({
            ...prev,
            [item.student_id]: { ...prev[item.student_id.toString()], status: 'success' },
          }))
        })
      }

      if (toUpdate.length > 0) {
        const results = await Promise.allSettled(toUpdate.map((item) => updateGrade(item)))

        results.forEach((result, index) => {
          const item = toUpdate[index]
          const existing = existingGrades.find((g) => g.grade_id === item.id)
          if (!existing) return

          setFormState((prev) => ({
            ...prev,
            [existing.student_id.toString()]: {
              ...prev[existing.student_id.toString()],
              status: result.status === 'fulfilled' ? 'success' : 'error',
            },
          }))
        })
      }

      toast.success('Alterações processadas')

      // Recalcula automaticamente a média dos alunos cujas notas mudaram.
      if (classDisciplineId && classDisciplineId > 0) {
        const affected = new Set<number>([
          ...toCreate.map((g) => g.student_id),
          ...toUpdate
            .map((item) => existingGrades.find((g) => g.grade_id === item.id)?.student_id)
            .filter((id): id is number => typeof id === 'number'),
        ])
        if (affected.size > 0) {
          calculateBatch(
            [...affected].map((studentId) => ({ studentId, classDisciplineId })),
          )
        }
      }
    } catch {
      toast.error('Erro ao salvar algumas notas')
    }
  }

  const handleRecalculateAll = () => {
    if (!classDisciplineId || classDisciplineId <= 0) {
      toast.error('Não foi possível identificar a disciplina desta avaliação')
      return
    }
    if (students.length === 0) return
    calculateBatch(
      students.map((s) => ({ studentId: s.student_id, classDisciplineId })),
    )
  }

  return {
    formState,
    handleRowChange,
    handleSaveAll,
    handleRecalculateAll,
    isSaving: isBulkCreating || isUpdating,
    isCalculating,
  }
}
