import { CourseListResponse, CourseDetailResponse } from "@seoul-advanture/schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * 코스 목록 조회 API
 */
export async function getCourses(): Promise<CourseListResponse> {
  // 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`${API_BASE_URL}/courses`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
  */
  
  // 현재는 목데이터 반환 (스키마 구조 준수)
  return [
    { 
      id: "c1", 
      title: "경복궁 근정전", 
      theme: "조선 왕실의 권위",
      weekKey: "2024-W09",
      difficulty: "MEDIUM", 
      estimatedDuration: 48,
      isActive: true,
      prologue: "...",
      epilogue: "...",
      createdAt: new Date().toISOString(),
      places: [{ id: "p1", order: 1, place: { lat: 37.5786, lng: 126.9772, name: "근정전", id: "pl1", landmarkNames: ["근정전"] } }]
    },
    // ... 필요한 만큼 추가
  ];
}

/**
 * 코스 상세 조회 API
 */
export async function getCourseDetail(id: string): Promise<CourseDetailResponse> {
  // 실제 API 연동 시 주석 해제
  // const res = await fetch(`${API_BASE_URL}/courses/${id}`);
  // return res.json();

  return {
    id,
    title: "한양 도성 북문 코스",
    theme: "조선 왕실의 권위",
    weekKey: "2024-W09",
    estimatedDuration: 48,
    difficulty: "MEDIUM",
    prologue: "왕실 서고에서 사라진 의궤 단서를 찾으라. 성문마다 남은 기록을 복원해 보자.",
    epilogue: "모든 단서를 모았군! 그대는 오늘부로 명예 사관이오.",
    isActive: true,
    createdAt: new Date().toISOString(),
    places: [
      { id: "cp1", order: 1, place: { id: "p1", name: "숙정문", lat: 37.5956, lng: 126.9811, landmarkNames: ["숙정문"] } },
    ],
    quests: [
      { id: "q1", order: 1, type: "PHOTO", narrativeText: "[안내관] 숙정문으로 이동하세요.", instruction: "사진을 찍으시오.", mapHint: "북악산 부근" },
    ]
  };
}
