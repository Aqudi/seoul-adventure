"use client";

import { useState, useEffect } from "react";
import { getCourses, getCourseDetail } from "@/lib/api/courses";
import { CourseListResponse, CourseDetailResponse } from "@seoul-advanture/schemas";

/**
 * 코스 목록을 가져오는 훅
 */
export function useCourses() {
  const [data, setData] = useState<CourseListResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getCourses();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { data, isLoading, error };
}

/**
 * 특정 코스 상세 정보를 가져오는 훅
 */
export function useCourseDetail(id: string) {
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const result = await getCourseDetail(id);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  return { data, isLoading, error };
}
