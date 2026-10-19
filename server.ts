import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Endpoint: Generate ERS Comprehensive Opinion and Customized Service Plan
  app.post("/api/ai/generate-ers-opinion", async (req, res) => {
    try {
      const {
        traineeName,
        gender,
        birthDate,
        disabilityType,
        disabilityLevel,
        trainingClass,
        ersScores,
        ersConvertedSum,
        ersStandardScore,
        ersLowestDomain,
        clientGoals,
        mainDifficulty,
        stylePrompt
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 API 키를 설정해주세요."
        });
      }

      const domainDetails = (ersScores || [])
        .map((s: { domain: string; rawScore: number; convertedScore: number }) =>
          `• ${s.domain}: 원점수 ${s.rawScore}점, 환산점수 ${s.convertedScore}점`
        )
        .join("\n");

      const prompt = `당신은 장애인종합복지관 직업재활팀의 수석 직업재활전문가(직업재활사)입니다.
아래 훈련생의 기초 정보 및 ERS(고용준비도검사) 평가 결과를 정밀하게 분석하여, 개별화서비스계획서(IWP)의 [3-1. 직업평가 - ERS 종합 소견 및 맞춤형 서비스 내용] 항목에 들어갈 전문적이고 신뢰도 높은 소견 텍스트를 작성해주세요.

[훈련생 정보]
- 성명: ${traineeName || '훈련생'}
- 성별/생년월일: ${gender || '미상'} / ${birthDate || '미상'}
- 장애유형 및 정도: ${disabilityType || '발달장애'} (${disabilityLevel || '중증'})
- 소속 훈련반: ${trainingClass || '문화예술반'}
- 주된 어려움/특성: ${mainDifficulty || '직업생활 및 대인관계 적응'}
- 본인/보호자 희망목표: ${clientGoals || '직무수행능력 향상 및 취업/사회참여'}

[ERS (고용준비도검사) 7대 영역 평가 결과]
${domainDetails}
- 환산점수 총점: ${ersConvertedSum || 0}점
- 표준점수: ${ersStandardScore || 0}점 (T-점수/백분위 기준)
- 최하위(상대적 취약) 영역: ${ersLowestDomain || '취약 영역'}

[작성 요구사항]
1. 불필요한 인사말, 머리말, 마크다운 코드블록(\`\`\`) 없이 바로 계획서에 붙여넣어 사용할 수 있는 텍스트 본문만 출력하세요.
2. 가독성을 위해 개조식 기호(○, -, ㆍ)와 체계적인 단락 구분을 사용하세요.
3. 다음 핵심 내용이 반드시 충실하게 포함되도록 작성하세요:
   ○ ERS 종합 분석 및 영역별 성취도 (강점 영역 분석 및 표준점수 ${ersStandardScore}점에 따른 전반적인 고용준비 수준 진단)
   ○ 상대적 취약 영역(${ersLowestDomain})에 대한 직업재활적 요인 분석 (훈련 참여 시 나타날 수 있는 구체적 행동 특성)
   ○ 맞춤형 서비스 지원 내용 및 지도 방안 (소속 훈련반인 [${trainingClass}]의 직무 활동과 연계하여 취약 영역을 보완할 수 있는 반복실습, 시각적 단서, 보조도구, 긍정적 강화, 단계별 피드백 등 실질적 개입 계획)
   ○ 향후 훈련을 통한 기대효과 및 취업 연계 전망
4. 장애인 복지관 공식 문서에 걸맞은 격조 있고 전문적인 임상 평가체(~임, ~함, ~로 사료됨, ~가 요구됨)로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      return res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("Gemini ERS opinion generation error:", error);
      return res.status(500).json({
        error: error?.message || "AI 소견 생성 중 오류가 발생했습니다."
      });
    }
  });

  // AI Endpoint: Generate Picture Vocational Interest Opinion from uploaded PDF & details
  app.post("/api/ai/generate-picture-interest-opinion", async (req, res) => {
    try {
      const {
        traineeName,
        gender,
        birthDate,
        disabilityType,
        disabilityLevel,
        trainingClass,
        pdfNotes,
        pdfFileName,
        pdfBase64
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 API 키를 설정해주세요."
        });
      }

      const promptText = `당신은 장애인종합복지관 직업재활팀의 수석 직업재활전문가(직업재활사)입니다.
아래 훈련생의 정보와 그림직업흥미검사(Picture Vocational Interest Test) 검사 기록(업로드된 검사지 내용/메모/파일)을 바탕으로, 개별화재활계획서(IWP) [3-2. 그림직업흥미검사 분석 소견]에 들어갈 전문적인 임상 분석 소견을 작성해주세요.

[훈련생 정보]
- 성명: ${traineeName || '훈련생'}
- 성별/생년월일: ${gender || '미상'} / ${birthDate || '미상'}
- 장애유형 및 정도: ${disabilityType || '발달장애'} (${disabilityLevel || '중증'})
- 소속 훈련반: ${trainingClass || '문화예술반'}

[그림직업흥미검사 관련 정보]
- 업로드된 파일명: ${pdfFileName || '그림직업흥미검사지.pdf'}
- 검사 특이사항 및 메모: ${pdfNotes || '서비스 직무, 도구 사용, 협동 활동에 대한 긍정적 흥미 보임'}

[작성 요구사항]
1. 불필요한 서두나 마크다운 코드블록(\`\`\`) 없이 바로 계획서에 반영할 수 있는 개조식(○, -, ㆍ) 형식의 임상 평가 텍스트(3~6문장)로 작성하세요.
2. 주요 흥미 영역(예: 음식·서비스, 청소·환경정리, 기계·도구 조작, 농업·원예, 사무보조, 창작·예술활동 등)과 작업 환경 선호(실내/실외, 대인/비대인, 개인/집단 협력, 구조화된 작업 등)를 명확히 짚어주세요.
3. 소속 훈련반(${trainingClass}) 및 향후 직업적응훈련 활동과의 연계성 및 지원 방향을 제시하세요.
4. 장애인 복지관 공식 문서에 부합하는 전문적인 어조(~임, ~로 확인됨, ~가 적합할 것으로 사료됨)로 작성하세요.`;

      let contents: any = promptText;

      // If PDF base64 is provided (without the data URL prefix)
      if (pdfBase64 && typeof pdfBase64 === 'string' && pdfBase64.length > 50) {
        let cleanBase64 = pdfBase64;
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.split(',')[1];
        }
        contents = [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64
            }
          },
          {
            text: promptText
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      return res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("Gemini Picture Interest opinion error:", error);
      return res.status(500).json({
        error: error?.message || "그림흥미검사 AI 소견 생성 중 오류가 발생했습니다."
      });
    }
  });

  // AI Endpoint: Generate 3-4 Vocational Adaptation Training Evaluation Opinion
  app.post("/api/ai/generate-training-opinion", async (req, res) => {
    try {
      const {
        traineeName,
        trainingClass,
        firstHalfScores,
        secondHalfScores,
        isFirstTerm
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 API 키를 설정해주세요."
        });
      }

      const firstScoresText = (firstHalfScores || [])
        .map((s: { item: string; convertedScore: number; percentage: number }) =>
          `• ${s.item}: 환산점수 ${s.convertedScore}점 (백분율 ${s.percentage}%)`
        )
        .join("\n");

      let secondScoresText = "";
      if (!isFirstTerm && secondHalfScores && secondHalfScores.length > 0) {
        secondScoresText = (secondHalfScores || [])
          .map((s: { item: string; convertedScore: number; percentage: number }) =>
            `• ${s.item}: 환산점수 ${s.convertedScore}점 (백분율 ${s.percentage}%)`
          )
          .join("\n");
      }

      const prompt = `당신은 장애인종합복지관 직업재활팀의 수석 직업재활전문가입니다.
아래 훈련생의 [3-4. 직업적응훈련반 훈련 영역별 성취도 평가] 결과를 분석하여, 계획서의 [3-4 종합 소견 및 총평]란에 들어갈 신뢰도 높은 임상 총평 텍스트를 작성해주세요.

[훈련생 및 훈련반]
- 훈련생명: ${traineeName || '훈련생'}
- 소속 훈련반: ${trainingClass || '직업적응훈련반'}
- 평가 차수: ${isFirstTerm ? '1차 개별화재활계획서 (상반기 평가)' : '2차 개별화재활계획서 (상·하반기 비교 평가)'}

[${isFirstTerm ? '상반기 훈련 5대 영역 평가 성취율' : '상반기 평가'}]
${firstScoresText}

${!isFirstTerm ? `[하반기 평가 및 비교]\n${secondScoresText}` : ''}

[작성 요구사항]
1. 인사말이나 마크다운 코드블록(\`\`\`) 없이 바로 붙여넣을 수 있는 텍스트만 출력하세요.
2. 개조식 기호(○, -, ㆍ)를 사용하여 3~5문장 내외로 명확하게 작성하세요.
3. ${isFirstTerm ? '상반기 영역별(작업훈련, 직업교육, 직종훈련, 자치회의/동아리, 공통교육) 성취도 특성과 강점/보완점을 분석하고 직무적응력 향상을 위한 방향을 제시하세요.' : '상반기 대비 하반기의 영역별 향상도와 성취율 변화, 훈련생의 성장 추이를 비교 총평하세요.'}
4. 전문 직업재활사 임상 평가체(~임, ~를 나타냄, ~로 사료됨)로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      return res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("Gemini Training opinion error:", error);
      return res.status(500).json({
        error: error?.message || "직업적응훈련 평가 AI 소견 생성 중 오류가 발생했습니다."
      });
    }
  });

  // AI Endpoint: Generate 3-5 Major Program Evaluation Opinion
  app.post("/api/ai/generate-major-opinion", async (req, res) => {
    try {
      const {
        traineeName,
        trainingClass,
        firstHalfScores,
        secondHalfScores,
        isFirstTerm
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 API 키를 설정해주세요."
        });
      }

      const firstScoresText = (firstHalfScores || [])
        .map((s: { item: string; convertedScore: number; percentage: number }) =>
          `• ${s.item}: 환산점수 ${s.convertedScore}점 (백분율 ${s.percentage}%)`
        )
        .join("\n");

      let secondScoresText = "";
      if (!isFirstTerm && secondHalfScores && secondHalfScores.length > 0) {
        secondScoresText = (secondHalfScores || [])
          .map((s: { item: string; convertedScore: number; percentage: number }) =>
            `• ${s.item}: 환산점수 ${s.convertedScore}점 (백분율 ${s.percentage}%)`
          )
          .join("\n");
      }

      const prompt = `당신은 장애인종합복지관 직업재활팀의 수석 직업재활전문가입니다.
아래 훈련생의 [3-5. 전공훈련 프로그램 과목별 평가 결과]를 분석하여, 계획서의 [3-5 전공훈련 종합 소견 및 평가 비고]란에 들어갈 전문 임상 평가 소견을 작성해주세요.

[훈련생 및 훈련반]
- 훈련생명: ${traineeName || '훈련생'}
- 소속 훈련반: ${trainingClass || '직업적응훈련반'}
- 평가 차수: ${isFirstTerm ? '1차 개별화재활계획서 (상반기 평가)' : '2차 개별화재활계획서 (상·하반기 비교 평가)'}

[${isFirstTerm ? '상반기 전공과목 평가 결과' : '상반기 평가'}]
${firstScoresText}

${!isFirstTerm ? `[하반기 전공과목 평가 결과]\n${secondScoresText}` : ''}

[작성 요구사항]
1. 인사말이나 마크다운 코드블록(\`\`\`) 없이 바로 사용할 수 있는 텍스트만 출력하세요.
2. 개조식 기호(○, -, ㆍ)를 사용하여 3~5문장 내외로 체계적으로 작성하세요.
3. ${isFirstTerm ? '각 전공과목별 습득도와 실무 작업 참여 태도, 향후 전공 기술 숙련을 위한 지원 방안을 제시하세요.' : '상·하반기 전공과목별 숙련도 변화와 기술 성취도를 종합 비교 평가하세요.'}
4. 전문 직업재활사 임상 평가체(~임, ~가 돋보임, ~로 사료됨)로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      return res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("Gemini Major opinion error:", error);
      return res.status(500).json({
        error: error?.message || "전공훈련 평가 AI 소견 생성 중 오류가 발생했습니다."
      });
    }
  });

  // AI Endpoint: Generate Midterm Job Training Report Manager Opinion
  app.post("/api/ai/generate-midterm-job-opinion", async (req, res) => {
    try {
      const {
        traineeName,
        majorDept,
        semesterType,
        evaluationYear,
        rows,
        totalScore
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 API 키를 설정해주세요."
        });
      }

      const rowsDetail = (rows || [])
        .map((r: any) => `• [${r.subjectName}] 과제: ${r.taskName || ''}, 5대 영역 평가점수: ${r.score}/25점`)
        .join("\n");

      const isSecond = semesterType === 'second';
      const prompt = `당신은 장애인종합복지관 직업재활팀의 수석 직업재활전문가입니다.
아래 훈련생의 [${evaluationYear || new Date().getFullYear()}년도 ${isSecond ? '하반기 기말' : '상반기 중간'} 직종훈련 프로그램 및 공통교육(합창) 성적표] 결과를 분석하여, 성적표 하단의 [3. 담당자 의견 - 종합의견]란에 기재할 전문적이고 신뢰도 높은 임상 종합의견을 작성해주세요.

[훈련생 정보]
- 훈련생명: ${traineeName || '훈련생'}
- 소속 훈련과: ${majorDept || '직업적응훈련반'}
- 평가 시기: ${isSecond ? '하반기 기말평가 (7월 ~ 12월)' : '상반기 중간평가 (1월 ~ 6월)'}
- 총점: ${totalScore || 0}점 / ${(rows?.length || 1) * 25}점 만점

[과목별 수행과제 및 평가점수]
${rowsDetail}

[작성 요구사항]
1. 불필요한 인사말, 마크다운 코드블록(\`\`\`) 없이 바로 성적표 종합의견란에 반영할 수 있는 텍스트만 출력하세요.
2. 머리글은 '○ ${isSecond ? '하반기 종합의견:' : '상반기 종합의견:'}' 으로 시작하며, 2~4문장으로 명확하게 구성하세요.
3. 직종 훈련과목(기술 습득, 과제 수행 완성도, 작업 태도)과 공통교육(합창 - 참여도, 협동심, 규칙 준수)을 아우르는 종합 평가를 담아주세요.
4. 장애인 복지관 공식 문서에 적합한 격조 있는 직업재활 임상 평가체(~임, ~를 나타냄, ~로 사료됨)로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      return res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("Gemini Midterm Job opinion error:", error);
      return res.status(500).json({
        error: error?.message || "직종훈련 성적표 AI 종합의견 생성 중 오류가 발생했습니다."
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
