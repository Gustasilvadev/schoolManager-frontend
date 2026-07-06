import { create } from '@/lib/api'
import type {
  ListStudentsParams,
  ListStudentsResponse,
  Student,
  CreateStudentPayload,
  UpdateStudentPayload,
  RestoreStudent,
} from '@/types/student'

const api = create('students')

export async function listStudents(
  params?: ListStudentsParams,
): Promise<ListStudentsResponse> {
  const { data } = await api.get<ListStudentsResponse>('/listStudents', {
    params,
  })
  return data
}

export async function getStudentById(id: number): Promise<Student> {
  const { data } = await api.get<Student>(`/listStudentById/${id}`)
  return data
}

export async function createStudent(
  payload: CreateStudentPayload,
): Promise<Student> {
  const { data } = await api.post<Student>('/createStudent', payload)
  return data
}

export async function updateStudent(
  id: number,
  payload: UpdateStudentPayload,
): Promise<Student> {
  const { data } = await api.put<Student>(`/updateStudentById/${id}`, payload)
  return data
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/deleteStudentById/${id}`)
}

export async function restoreStudent(id: number): Promise<RestoreStudent> {
  const { data } = await api.post<RestoreStudent>(`/restoreStudentById/${id}`)
  return data
}

// Override do Content-Type derruba o default JSON do client; o browser injeta o boundary.
export async function uploadStudentPhoto(
  id: number,
  file: File,
): Promise<Student> {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await api.post<Student>(`/uploadPhotoById/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
