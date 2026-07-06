import { useAllClassDisciplines } from './useAllClassDisciplines'

export function useClassDisciplineNameMap() {
  const { data, isLoading } = useAllClassDisciplines()

  const nameMap = new Map<number, string>()
  for (const entry of data ?? []) {
    if (entry.disciplines?.discipline_name) {
      nameMap.set(entry.class_discipline_id, entry.disciplines.discipline_name)
    }
  }

  return { nameMap, isLoading }
}
