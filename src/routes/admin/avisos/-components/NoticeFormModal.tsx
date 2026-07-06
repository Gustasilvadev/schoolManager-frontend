import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { FieldError } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { useCreateNotice, useNotice, useUpdateNotice } from '@/hooks/useNotices'
import type {
  CreateNoticePayload,
  NoticeItem,
  UpdateNoticePayload,
} from '@/types/notice'
import { NoticeFormFields } from './NoticeFormFields'
import { VisibilitySelector } from './VisibilitySelector'
import { TeacherPicker } from './TeacherPicker'

function isPublicNoticeCreateGatewayError(
  error: Error,
  payload: CreateNoticePayload,
) {
  const status = (error as Error & { status?: number }).status
  const isPublic = !payload.teacher_ids || payload.teacher_ids.length === 0

  return status === 502 && isPublic
}

const schema = z
  .object({
    notice_title: z.string().min(1, 'Título obrigatório'),
    notice_content: z.string().min(1, 'Conteúdo obrigatório'),
    notice_priority: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
    ]),
    visibility: z.enum(['public', 'restricted']),
    teacher_ids: z.array(z.number()),
  })
  .refine(
    (data) => data.visibility !== 'restricted' || data.teacher_ids.length > 0,
    {
      message: 'Selecione pelo menos um professor para aviso restrito.',
      path: ['teacher_ids'],
    },
  )

export type NoticeFormValues = z.infer<typeof schema>

interface NoticeFormModalProps {
  open: boolean
  editing: NoticeItem | null
  onClose: () => void
}

export function NoticeFormModal({
  open,
  editing,
  onClose,
}: NoticeFormModalProps) {
  const isEditing = Boolean(editing)

  const { data: noticeDetails, isLoading: isLoadingDetails } = useNotice(
    editing?.notice_id,
    { enabled: open && Boolean(editing?.notice_id) },
  )

  const { mutate: createNotice, isPending: isCreating } = useCreateNotice()
  const { mutate: updateNotice, isPending: isUpdating } = useUpdateNotice()
  const isSubmitting = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      notice_title: '',
      notice_content: '',
      notice_priority: 2,
      visibility: 'public',
      teacher_ids: [],
    },
  })

  const visibility = watch('visibility')
  const teacherIds = watch('teacher_ids')
  const teacherIdsError =
    errors.teacher_ids?.root?.message ??
    (errors.teacher_ids as FieldError | undefined)?.message

  useEffect(() => {
    if (!open) return

    if (!editing) {
      reset({
        notice_title: '',
        notice_content: '',
        notice_priority: 2,
        visibility: 'public',
        teacher_ids: [],
      })
      return
    }

    const source = noticeDetails ?? editing
    const ids = (source.notice_visibilities ?? []).map((v) => v.teacher_id)

    reset({
      notice_title: source.notice_title,
      notice_content: source.notice_content,
      notice_priority: source.notice_priority,
      visibility: ids.length > 0 ? 'restricted' : 'public',
      teacher_ids: ids,
    })
  }, [open, editing, noticeDetails, reset])

  if (!open) return null

  function onSubmit(values: NoticeFormValues) {
    const basePayload = {
      notice_title: values.notice_title.trim(),
      notice_content: values.notice_content.trim(),
      notice_priority: values.notice_priority,
    }

    if (isEditing && editing) {
      const payload: UpdateNoticePayload = {
        ...basePayload,
        teacher_ids:
          values.visibility === 'restricted' ? values.teacher_ids : [],
      }

      updateNotice({ id: editing.notice_id, payload }, { onSuccess: onClose })
      return
    }

    const payload: CreateNoticePayload =
      values.visibility === 'restricted'
        ? { ...basePayload, teacher_ids: values.teacher_ids }
        : basePayload

    createNotice(payload, {
      onSuccess: onClose,
      onError: (error) => {
        if (isPublicNoticeCreateGatewayError(error, payload)) onClose()
      },
    })
  }

  function handleToggleTeacher(teacherId: number) {
    setValue(
      'teacher_ids',
      teacherIds.includes(teacherId)
        ? teacherIds.filter((id) => id !== teacherId)
        : [...teacherIds, teacherId],
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar aviso' : 'Novo aviso'}
            </h2>
            <p className="text-xs text-slate-400">
              Preencha os dados do comunicado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoadingDetails ? (
          <div className="px-6 py-8 text-sm text-slate-400">
            Carregando aviso...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[calc(90vh-73px)] space-y-5 overflow-y-auto px-6 py-5"
          >
            <NoticeFormFields register={register} errors={errors} />

            <VisibilitySelector
              value={visibility}
              onChange={(v) => {
                setValue('visibility', v)
                if (v === 'public') setValue('teacher_ids', [])
              }}
            />

            {visibility === 'restricted' && (
              <TeacherPicker
                selectedIds={teacherIds}
                onToggle={handleToggleTeacher}
                open={open}
                error={teacherIdsError}
              />
            )}

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Salvando...'
                  : isEditing
                    ? 'Salvar alterações'
                    : 'Criar aviso'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
