import { create } from '@/lib/api'
import type {
  Teacher,
  TeacherDisciplinesResponse,
  ListTeachersParams,
  ListTeachersResponse,
  UpdateTeacher,
  RestoreTeacher,
} from '@/types/teacher'

const api = create('teachers')

export async function listTeachers(
  params?: ListTeachersParams,
): Promise<ListTeachersResponse> {
  const { data } = await api.get<ListTeachersResponse>('/listTeachers', {
    params,
  })
  return data
}

export async function getTeacherById(id: number): Promise<Teacher> {
  const { data } = await api.get<Teacher>(`/listTeacherById/${id}`)
  return data
}

export async function getTeacherByCpf(cpf: string): Promise<Teacher | null> {
  try {
    const { data } = await api.get<Teacher>(`/byCpf/${cpf}`)
    return data
  } catch {
    return null
  }
}

export async function getTeacherByEmail(
  email: string,
): Promise<Teacher | null> {
  try {
    const { data } = await api.get<Teacher>(`/byEmail/${email}`)
    return data
  } catch {
    return null
  }
}

export async function updateTeacherById(
  id: number,
  payload: UpdateTeacher,
): Promise<Teacher> {
  const { data } = await api.put<Teacher>(`/updateTeacherById/${id}`, payload)
  return data
}

export async function getTeacherDisciplines(
  teacherId: number,
): Promise<TeacherDisciplinesResponse> {
  const { data } = await api.get<TeacherDisciplinesResponse>(
    `/disciplines/${teacherId}`,
  )
  return data
}

export async function associateDiscipline(
  teacherId: number,
  disciplineId: number,
): Promise<void> {
  await api.post(`/linkDiscipline/${teacherId}`, {
    discipline_id: disciplineId,
  })
}

export async function removeDisciplineAssociation(
  teacherId: number,
  disciplineId: number,
): Promise<void> {
  await api.delete(`/unlinkDiscipline/${teacherId}/${disciplineId}`)
}

export async function deleteTeacher(id: number): Promise<void> {
  await api.delete(`/deleteTeacherById/${id}`)
}

export async function restoreTeacher(id: number): Promise<RestoreTeacher> {
  const { data } = await api.post<RestoreTeacher>(`/restoreTeacherById/${id}`)
  return data
}
