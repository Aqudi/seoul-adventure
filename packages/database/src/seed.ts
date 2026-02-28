import { getOrm } from "./index.js";
import {
  User,
  Place,
  Course,
  CoursePlace,
  Quest,
  QuestType,
  Difficulty,
} from "./entities/index.js";
import bcrypt from "bcryptjs";

async function main() {
  const orm = await getOrm();
  const em = orm.em.fork();

  let user = await em.findOne(User, { nickname: "testuser" });
  if (!user) {
    user = em.create(User, {
      nickname: "testuser",
      password: await bcrypt.hash("password123", 10),
    });
    em.persist(user);
  }

  let place1 = await em.findOne(Place, { name: "세빛섬" });
  if (!place1) {
    place1 = em.create(Place, {
      name: "세빛섬",
      lat: 37.5116,
      lng: 127.0594,
      landmarkNames: ["세빛섬", "가빛섬", "채빛섬", "솔빛섬"],
      facts: { builtYear: 2011, islandCount: 3 },
    });
    em.persist(place1);
  }

  let place2 = await em.findOne(Place, { name: "반포한강공원" });
  if (!place2) {
    place2 = em.create(Place, {
      name: "반포한강공원",
      lat: 37.5126,
      lng: 126.9972,
      landmarkNames: ["달빛무지개분수", "반포대교"],
      facts: { fountainLength: 1140 },
    });
    em.persist(place2);
  }

  await em.flush();

  let course = await em.findOne(Course, { weekKey: "2026-W09" });
  if (true || !course) {
    course = em.create(Course, {
      title: "세빛섬의 비밀",
      theme: "한강 야경 탐험",
      weekKey: "2026-W09",
      estimatedDuration: 90,
      difficulty: Difficulty.MEDIUM,
      prologue: 
        "이보게 탐험가! 한강에 떠 있는 세 개의 빛나는 섬에 비밀이 숨겨져 있다 하오. 그대가 모든 단서를 모아 진실을 밝혀주시오!",
      epilogue:
        "훌륭하오! 모든 단서를 모아냈군요. 이제 그대는 한강의 비밀을 아는 단 한 명의 탐험가가 되었소. 명예 탐험단으로 임명하오!",
    });
    em.persist(course);
    await em.flush();

    em.persist(em.create(CoursePlace, { course, place: place1, order: 1 }));
    em.persist(em.create(CoursePlace, { course, place: place2, order: 2 }));

    em.persist(
      em.create(Quest, {
        course,
        place: place1,
        order: 1,
        type: QuestType.PHOTO,
        narrativeText:
          '이보게! 세빛섬 앞에서 "출발 둥둥 세빛섬!" 을 외치며 인증샷을 올려보시오!',
        instruction:
          '"출발 둥둥 세빛섬!" 을 외치는 모습을 사진으로 찍어 올리세요.',
        mapHint:
          "다음 목적지: 반포한강공원 달빛무지개분수 방향으로 이동하시오 (도보 약 15분)",
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place1,
        order: 2,
        type: QuestType.ANSWER,
        narrativeText: "세빛섬이 만들어진 해를 아시오? 정답을 맞춰보시오!",
        instruction: "세빛섬이 완공된 연도를 입력하세요.",
        mapHint: "정답을 맞혔다면 반포한강공원으로 출발하시오!",
        answer: "2011",
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place2,
        order: 3,
        type: QuestType.ANSWER,
        narrativeText:
          "물 위에 떠 있는 세 개의 빛나는 섬, 세빛섬에는 비밀번호가 숨겨진 안내판이 있습니다. 이곳은 가빛, 채빛, 솔빛 세 섬으로 이루어져 있습니다. 여기에 미디어 아트 갤러리인 '이 섬'을 포함하면 총 몇 개의 섬이 될까요?",
        instruction:
          "세빛섬 구성 요소 중 미디어 아트 갤러리인 '예빛'을 포함한 전체 섬의 총 개수는 숫자로 몇 개입니까?",
        answer: "4",
        mapHint: "위치 인증이 완료되면 마지막 퀘스트가 활성화됩니다.",
        gpsRadiusM: 200,
        timeLimitSec: 300,
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place2,
        order: 4,
        type: QuestType.PHOTO,
        narrativeText:
          "달빛무지개분수 앞에서 가장 멋진 포즈로 인증샷을 찍어오시오!",
        instruction: "달빛무지개분수가 보이게 인증샷을 찍으세요.",
        mapHint: "마지막 인증입니다. 완료하면 엔딩이 기다리고 있소!",
      }),
    );

    await em.flush();
  }

  console.log("✅ Seed complete");
  await orm.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
