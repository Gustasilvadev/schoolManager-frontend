import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getTeacherDisciplines,
  associateDiscipline,
  removeDisciplineAssociation,
  listTeachers,
} from '@/integrations/teachers/teachersApi'
import { getDisciplineById } from '@/integrations/classes/disciplinesApi'
import type { Teacher } from '@/types/teacher'

export interface TeacherWithDisciplineCount {
  teacher: Teacher
  count: number
}

export function useTopTeachersByDisciplines(limit = 3) {
  return useQuery({
    queryKey: ['top-teachers-by-disciplines', limit],
    queryFn: async () => {
      const { teachers } = await listTeachers({ limit: 100 })
      return teachers
        .map((teacher) => ({ teacher, count: teacher.discipline_count ?? 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeacherDisciplineDetails(
  teacherId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['teacher-discipline-details', teacherId],
    queryFn: async () => {
      const { discipline_ids } = await getTeacherDisciplines(teacherId)
      if (discipline_ids.length === 0) return []
      return Promise.all(discipline_ids.map((id) => getDisciplineById(id)))
    },
    enabled: (options?.enabled ?? true) && teacherId > 0,
    staleTime: 3 * 60 * 1000,
    retry: false,
  })
}

export function useTeacherDisciplines(
  teacherId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['teacher-disciplines', teacherId],
    queryFn: () => getTeacherDisciplines(teacherId),
    enabled: (options?.enabled ?? true) && teacherId > 0,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAssociateDiscipline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      teacherId,
      disciplineId,
    }: {
      teacherId: number
      disciplineId: number
    }) => associateDiscipline(teacherId, disciplineId),
    onSuccess: (_, { teacherId }) => {
      void qc.invalidateQueries({ queryKey: ['teacher-disciplines', teacherId] })
      toast.success('Disciplina vinculada com sucesso')
    },
    onError: (e: Error) => {
      console.error('[useAssociateDiscipline]', e.message)
      toast.error(e.message || 'Erro ao vincular disciplina')
    },
  })
}

export function useRemoveTeacherDiscipline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      teacherId,
      disciplineId,
    }: {
      teacherId: number
      disciplineId: number
    }) => removeDisciplineAssociation(teacherId, disciplineId),
    onSuccess: (_, { teacherId }) => {
      void qc.invalidateQueries({ queryKey: ['teacher-disciplines', teacherId] })
      toast.success('Disciplina desvinculada')
    },
    onError: (e: Error) => {
      console.error('[useRemoveTeacherDiscipline]', e.message)
      toast.error(e.message || 'Erro ao desvincular disciplina')
    },
  })
}
