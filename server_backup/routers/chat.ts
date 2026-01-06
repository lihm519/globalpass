/**
 * AI 导购聊天路由
 * 使用 Gemini AI + RAG 检索增强
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { generateGeminiResponse } from "../_core/gemini";
import {
  getCheapestPackagesByCountry,
  searchPackages,
  getUnlimitedPackages,
  formatPackagesForAI,
} from "../esim-db";

export const chatRouter = router({
  /**
   * AI 导购问答
   * 用户提问 → RAG 检索 → Gemini 生成回答
   */
  ask: publicProcedure
    .input(
      z.object({
        question: z.string().min(1, "问题不能为空"),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { question, country } = input;

      try {
        // Step 1: RAG 检索 - 根据问题类型查询相关套餐
        let packages: Awaited<ReturnType<typeof getCheapestPackagesByCountry>> = [];
        let context = "";

        // 判断问题类型
        const isUnlimitedQuery = /无限|unlimited/i.test(question);
        const isCountryQuery = country || /日本|美国|泰国|韩国|新加坡|中国|法国|英国/i.test(question);

        if (isUnlimitedQuery) {
          // 查询无限流量套餐
          packages = await getUnlimitedPackages(10);
          context = formatPackagesForAI(packages);
        } else if (isCountryQuery) {
          // 查询特定国家的套餐
          const targetCountry = country || extractCountryFromQuestion(question);
          if (targetCountry) {
            packages = await getCheapestPackagesByCountry(targetCountry, 10);
            context = formatPackagesForAI(packages);
          }
        } else {
          // 通用搜索
          packages = await searchPackages(question, 10);
          context = formatPackagesForAI(packages);
        }

        // Step 2: 使用 Gemini 生成回答
        const answer = await generateGeminiResponse({
          prompt: question,
          context,
          model: "gemini-2.5-flash",
        });

        return {
          answer,
          packages: packages.slice(0, 5), // 返回前 5 个套餐供前端展示
        };
      } catch (error) {
        console.error("[Chat] Error:", error);
        throw new Error("AI 导购服务暂时不可用，请稍后重试");
      }
    }),
});

/**
 * 从问题中提取国家名称
 */
function extractCountryFromQuestion(question: string): string | null {
  const countryMap: Record<string, string> = {
    日本: "Japan",
    美国: "USA",
    泰国: "Thailand",
    韩国: "South Korea",
    新加坡: "Singapore",
    中国: "China",
    法国: "France",
    英国: "United Kingdom",
  };

  for (const [cn, en] of Object.entries(countryMap)) {
    if (question.includes(cn) || question.toLowerCase().includes(en.toLowerCase())) {
      return en;
    }
  }

  return null;
}
