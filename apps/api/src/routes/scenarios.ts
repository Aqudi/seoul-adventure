import type { FastifyInstance } from "fastify";
import { Scenario, ScenarioQuest, ScenarioQuestType } from "@seoul-advanture/database";
import { generateScenario } from "../services/gemini.js";

interface GenerateBody {
  landmark: string;
}

interface ScenarioParams {
  id: string;
}

export async function scenarioRoutes(fastify: FastifyInstance) {
  // POST /scenarios/generate - 랜드마크명으로 시나리오 생성 후 저장
  fastify.post<{ Body: GenerateBody }>(
    "/scenarios/generate",
    {
      schema: {
        body: {
          type: "object",
          required: ["landmark"],
          properties: {
            landmark: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { landmark } = request.body;
      const em = request.em;

      let scenarioData;
      try {
        scenarioData = await generateScenario(landmark);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gemini API 호출 실패";
        return reply.code(502).send({ error: message });
      }

      const scenario = em.create(Scenario, {
        landmark: scenarioData.landmark,
        gameTitle: scenarioData.game_title,
        prologue: scenarioData.prologue,
        epilogue: scenarioData.epilogue,
      });

      for (const q of scenarioData.quests) {
        em.create(ScenarioQuest, {
          scenario,
          step: q.step,
          type: q.type as ScenarioQuestType,
          title: q.title,
          locationName: q.location_name,
          latitude: q.latitude,
          longitude: q.longitude,
          scenarioText: q.scenario_text,
          question: q.question ?? null,
          answer: q.answer ?? null,
          factInfo: q.fact_info,
          successMsg: q.success_msg,
          failureMsg: q.failure_msg,
        });
      }

      await em.flush();
      await em.populate(scenario, ["quests"]);

      return reply.code(201).send(serializeScenario(scenario));
    }
  );

  // GET /scenarios - 전체 시나리오 목록 조회
  fastify.get("/scenarios", async (request) => {
    const em = request.em;
    const scenarios = await em.find(
      Scenario,
      {},
      { orderBy: { createdAt: "DESC" } }
    );
    return scenarios.map((s) => ({
      id: s.id,
      landmark: s.landmark,
      gameTitle: s.gameTitle,
      createdAt: s.createdAt,
    }));
  });

  // GET /scenarios/:id - 시나리오 상세 조회
  fastify.get<{ Params: ScenarioParams }>(
    "/scenarios/:id",
    async (request, reply) => {
      const em = request.em;
      const scenario = await em.findOne(
        Scenario,
        { id: request.params.id },
        { populate: ["quests"] }
      );

      if (!scenario) {
        return reply.code(404).send({ error: "시나리오를 찾을 수 없습니다." });
      }

      return serializeScenario(scenario);
    }
  );
}

function serializeScenario(scenario: Scenario) {
  const quests = scenario.quests.isInitialized()
    ? scenario.quests.getItems().map((q) => ({
        id: q.id,
        step: q.step,
        type: q.type,
        title: q.title,
        locationName: q.locationName,
        latitude: q.latitude,
        longitude: q.longitude,
        scenarioText: q.scenarioText,
        question: q.question ?? null,
        factInfo: q.factInfo,
        successMsg: q.successMsg,
        failureMsg: q.failureMsg,
      }))
    : [];

  return {
    id: scenario.id,
    landmark: scenario.landmark,
    gameTitle: scenario.gameTitle,
    prologue: scenario.prologue,
    epilogue: scenario.epilogue,
    createdAt: scenario.createdAt,
    quests,
  };
}
