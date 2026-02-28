import { CourseListResponse, CourseDetailResponse } from "@seoul-advanture/schemas";
import { apiClient } from "./client";

/**
 * 코스 목록 조회 API
 */
export async function getCourses(): Promise<CourseListResponse> {
  return apiClient<CourseListResponse>("/courses");
}

/**
 * 코스 상세 조회 API
 */
export async function getCourseDetail(id: string): Promise<CourseDetailResponse> {
  return apiClient<CourseDetailResponse>(`/courses/${id}`);
}
