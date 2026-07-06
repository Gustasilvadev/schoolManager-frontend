import { useAllClassDisciplines } from './useAllClassDisciplines'

export function useClassIdFromDiscipline(classDisciplineId?: number) {
  const { data, isLoading } = useAllClassDisciplines()

  if (!classDisciplineId) return { classId: undefined, isLoading: false }

  const match = (data ?? []).find(
    (d) => d.class_discipline_id === classDisciplineId,
  )
  return { classId: match?.class_id, isLoading }
}
