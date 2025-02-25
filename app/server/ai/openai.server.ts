/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { ZodType, type ZodTypeDef } from "zod";
import { SERVER_ENV } from "~/env.server";

const openai = new OpenAI({ apiKey: SERVER_ENV.OPENAI_KEY });

export function completion<T extends ZodType<any, ZodTypeDef, any>>(
  system: string,
  prompt: string,
  schema: T,
) {
  return openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(schema, "schema"),
    temperature: 0,
  });
}
