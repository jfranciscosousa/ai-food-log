/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { type ZodType, type ZodTypeDef } from "zod";
import { SERVER_ENV } from "~/env.server";

const openai = new OpenAI({ apiKey: SERVER_ENV.OPENAI_KEY });

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString("base64");

  return `data:${file.type};base64,${base64String}`;
}

export async function completion<T extends ZodType<any, ZodTypeDef, any>>(
  system: string,
  prompt: string | File,
  schema: T,
) {
  const promptObj =
    prompt instanceof File
      ? { type: "image_url", image_url: { url: await fileToBase64(prompt) } }
      : { type: "text", text: prompt };

  return openai.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: system },
      { role: "user", content: [promptObj as any] },
    ],
    response_format: zodResponseFormat(schema, "schema"),
    temperature: 0,
  });
}
