import { create } from '@/lib/api'
import type {
  CreateNoticePayload,
  ListNoticesParams,
  ListNoticesResponse,
  NoticeItem,
  TeacherNotice,
  UpdateNoticePayload,
} from '@/types/notice'

const api = create('notices')

export async function listNotices(
  params?: ListNoticesParams,
): Promise<ListNoticesResponse> {
  const { data } = await api.get<ListNoticesResponse>('/listNotices', {
    params,
  })

  return data
}

export async function deleteNotice(id: number): Promise<void> {
  await api.delete(`/deleteNoticeById/${id}`)
}

export async function restoreNotice(id: number): Promise<void> {
  try {
    await api.post(`/restoreNoticeById/${id}`)
  } catch (error) {
    const status = (error as Error & { status?: number }).status
    if (status === 502) return
    if (status !== 404 && status !== 405) throw error

    await api.put(`/restoreNoticeById/${id}`)
  }
}

export async function getNoticeById(id: number): Promise<NoticeItem> {
  const { data } = await api.get<NoticeItem>(`/listNoticeById/${id}`)

  return data
}

export async function createNotice(
  payload: CreateNoticePayload,
): Promise<NoticeItem> {
  const { data } = await api.post<NoticeItem>('/createNotice', payload)

  return data
}

export async function updateNotice(
  id: number,
  payload: UpdateNoticePayload,
): Promise<NoticeItem> {
  const { data } = await api.put<NoticeItem>(`/updateNoticeById/${id}`, payload)

  return data
}

export async function getNoticesForTeacher(
  teacherId: number,
): Promise<TeacherNotice[]> {
  const { data } = await api.get<TeacherNotice[]>(`/teacher/${teacherId}`)

  return data
}

export async function markAsViewed(noticeId: number): Promise<void> {
  await api.post(`/markAsViewed/${noticeId}`)
}
