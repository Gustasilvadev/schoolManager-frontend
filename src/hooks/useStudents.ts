import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
} from '@/integrations/students/studentsApi'
import type {
  ListStudentsParams,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '@/types/student'

export function useStudents(
  params?: ListStudentsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => listStudents(params),
    staleTime: 3 * 60 * 1000,
    enabled: options?.enabled ?? true,
  })
}

export function useStudent(id: number | undefined) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudentById(id!),
    enabled: id !== undefined,
    staleTime: 3 * 60 * 1000,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      console.error('[useCreateStudent]', error)
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateStudentPayload
    }) => updateStudent(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', id] })
    },
    onError: (error) => {
      console.error('[useUpdateStudent]', error)
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', id] })
    },
    onError: (error) => {
      console.error('[useDeleteStudent]', error)
    },
  })
}

export function useRestoreStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => restoreStudent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', id] })
    },
    onError: (error) => {
      console.error('[useRestoreStudent]', error)
    },
  })
}
