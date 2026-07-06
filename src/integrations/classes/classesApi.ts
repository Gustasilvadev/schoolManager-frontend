import { create } from '@/lib/api'
import type {
  ClassItem,
  ClassStudent,
  ClassTeacher,
  ClassDisciplineEntry,
  ListClassesParams,
  ListClassesResponse,
} from '@/types/classes'

const api = create('classes')

export async function listClasses(
  params?: ListClassesParams,
): Promise<ListClassesResponse> {
  const { data } = await api.get<ListClassesResponse>('/listClasses', {
    params,
  })
  return data
}

export async function getClassById(id: number): Promise<ClassItem> {
  const { data } = await api.get<ClassItem>(`/listClassById/${id}`)
  return data
}

export async function createClass(payload: {
  class_name: string
  class_school_year: string
}): Promise<ClassItem> {
  const { data } = await api.post<ClassItem>('/createClass', payload)
  return data
}

export async function updateClass(
  id: number,
  payload: Partial<{
    class_name: string
    class_school_year: string
    class_status: number
  }>,
): Promise<ClassItem> {
  const { data } = await api.put<ClassItem>(`/updateClassById/${id}`, payload)
  return data
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/deleteClassById/${id}`)
}

export async function restoreClass(id: number): Promise<void> {
  await api.post(`/restoreClassById/${id}`)
}

export async function getClassStudents(
  classId: number,
): Promise<ClassStudent[]> {
  const { data } = await api.get<ClassStudent[]>(`/students/${classId}`)
  return data
}

export async function enrollStudent(
  classId: number,
  studentId: number,
): Promise<void> {
  await api.post(`/enroll/${classId}`, { student_id: studentId })
}

export async function unenrollStudent(
  classId: number,
  studentId: number,
): Promise<void> {
  await api.delete(`/enroll/${classId}/${studentId}`)
}

export async function getClassTeachers(
  classId: number,
): Promise<ClassTeacher[]> {
  const { data } = await api.get<ClassTeacher[]>(`/teachers/${classId}`)
  return data
}

export async function assignTeacher(
  classId: number,
  teacherId: number,
): Promise<void> {
  await api.post(`/assignTeacher/${classId}`, { teacher_id: teacherId })
}

export async function unassignTeacher(
  classId: number,
  teacherId: number,
): Promise<void> {
  await api.delete(`/assignTeacher/${classId}/${teacherId}`)
}

export async function getClassDisciplines(
  classId: number,
): Promise<ClassDisciplineEntry[]> {
  const { data } = await api.get<ClassDisciplineEntry[]>(
    `/disciplines/${classId}`,
  )
  return data
}

export async function getAllClassDisciplines(): Promise<ClassDisciplineEntry[]> {
  const { data } = await api.get<ClassDisciplineEntry[]>(
    '/listAllClassDisciplines',
  )
  return data
}

export async function addDisciplineToClass(
  classId: number,
  disciplineId: number,
): Promise<void> {
  await api.post(`/disciplines/${classId}`, { discipline_id: disciplineId })
}

export async function removeDisciplineFromClass(
  classId: number,
  disciplineId: number,
): Promise<void> {
  await api.delete(`/disciplines/${classId}/${disciplineId}`)
}
