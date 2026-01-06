import { describe, expect, it } from "vitest";
import { generateGeminiResponse } from "./_core/gemini";

describe("Gemini AI Integration", () => {
  it("should generate response with valid API key", async () => {
    const response = await generateGeminiResponse({
      prompt: "Say hello in one word",
      model: "gemini-2.5-flash",
    });

    expect(response).toBeTruthy();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call
});
