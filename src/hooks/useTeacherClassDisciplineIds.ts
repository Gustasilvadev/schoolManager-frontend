import { useTeacherDisciplines } from './useTeacherDisciplines'
import { useAllClassDisciplines } from './useAllClassDisciplines'

export function useTeacherClassDisciplineIds(teacherId?: number) {
  const { data: teacherDisc, isLoading: isLoadingDisc } = useTeacherDisciplines(
    teacherId ?? 0,
    { enabled: !!teacherId },
  )
  const disciplineIds = new Set(teacherDisc?.discipline_ids ?? [])

  const { data, isLoading: isLoadingCd } = useAllClassDisciplines()

  const classDisciplineIds = new Set<number>()
  for (const entry of data ?? []) {
    if (disciplineIds.has(entry.discipline_id)) {
      classDisciplineIds.add(entry.class_discipline_id)
    }
  }

  const isLoading = (!!teacherId && isLoadingDisc) || isLoadingCd

  return { classDisciplineIds, isLoading }
}
