import { createOpenAI } from "ai";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
