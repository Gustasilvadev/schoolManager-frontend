import { useQuery } from '@tanstack/react-query'
import { getAllClassDisciplines } from '@/integrations/classes/classesApi'

// Busca todas as class_disciplines numa única requisição.
export function useAllClassDisciplines() {
  return useQuery({
    queryKey: ['all-class-disciplines'],
    queryFn: getAllClassDisciplines,
    staleTime: 2 * 60 * 1000,
  })
}
