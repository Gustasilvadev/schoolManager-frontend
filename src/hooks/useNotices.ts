import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createNotice,
  deleteNotice,
  getNoticeById,
  getNoticesForTeacher,
  listNotices,
  markAsViewed,
  restoreNotice,
  updateNotice,
} from '@/integrations/notices/noticesApi'
import type {
  CreateNoticePayload,
  ListNoticesParams,
  UpdateNoticePayload,
  TeacherNotice,
} from '@/types/notice'
import { toast } from 'sonner'

function isPublicNoticeCreateGatewayError(
  error: Error,
  payload: CreateNoticePayload,
) {
  const status = (error as Error & { status?: number }).status
  const isPublic = !payload.teacher_ids || payload.teacher_ids.length === 0

  return status === 502 && isPublic
}

export function useTeacherNotices(teacherId: number | undefined) {
  return useQuery({
    queryKey: ['notices', 'teacher', teacherId],
    queryFn: () => getNoticesForTeacher(teacherId!),
    enabled: !!teacherId,
    staleTime: 3 * 60 * 1000,
    retry: false,
  })
}

export function useNotices(params?: ListNoticesParams) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => listNotices(params),
    staleTime: 3 * 60 * 1000,
    retry: false,
  })
}

export function useDeleteNotice() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notices'] })
      toast.success('Aviso excluído com sucesso')
    },
    onError: (error: Error) => {
      console.error('[useDeleteNotice]', error.message)
      toast.error(error.message || 'Erro ao excluir aviso')
    },
  })
}

export function useRestoreNotice() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: restoreNotice,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notices'] })
      toast.success('Aviso restaurado com sucesso')
    },
    onError: (error: Error) => {
      console.error('[useRestoreNotice]', error.message)
      toast.error(error.message || 'Erro ao restaurar aviso')
    },
  })
}

export function useNotice(id?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: () => getNoticeById(id as number),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 3 * 60 * 1000,
    retry: false,
  })
}

export function useCreateNotice() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => createNotice(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notices'] })
      toast.success('Aviso criado com sucesso')
    },
    onError: (error: Error, payload) => {
      if (isPublicNoticeCreateGatewayError(error, payload)) {
        void qc.invalidateQueries({ queryKey: ['notices'] })
        window.setTimeout(() => {
          void qc.invalidateQueries({ queryKey: ['notices'] })
        }, 1200)
        toast.success('Aviso público criado. Atualizando a listagem...')
        return
      }

      console.error('[useCreateNotice]', error.message)
      toast.error(error.message || 'Erro ao criar aviso')
    },
  })
}

export function useUpdateNotice() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateNoticePayload
    }) => updateNotice(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notices'] })
      toast.success('Aviso atualizado com sucesso')
    },
    onError: (error: Error) => {
      console.error('[useUpdateNotice]', error.message)
      toast.error(error.message || 'Erro ao atualizar aviso')
    },
  })
}

export function useMarkAsViewed() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (noticeId: number) => markAsViewed(noticeId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notices'] })
    },
    onError: (error: Error) => {
      console.error('[useMarkAsViewed]', error.message)
      toast.error(error.message || 'Erro ao marcar aviso como lido')
    },
  })
}

export function useMarkNoticeAsViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsViewed,

    onSuccess: (_, noticeId) => {
      queryClient.setQueriesData<TeacherNotice[]>(
        { queryKey: ['notices', 'teacher'] },
        (old) => {
          if (!old) return old

          return old.map((notice) =>
            notice.notice_id === noticeId
              ? {
                  ...notice,
                  viewed: true,
                }
              : notice,
          )
        },
      )

      void queryClient.invalidateQueries({
        queryKey: ['notices', 'teacher'],
      })

      void queryClient.invalidateQueries({
        queryKey: ['notices'],
      })

      toast.success('Aviso marcado como lido')
    },

    onError: (error: Error) => {
      console.error('[useMarkNoticeAsViewed]', error.message)
      toast.error(error.message || 'Erro ao marcar aviso como lido')
    },
  })
}
