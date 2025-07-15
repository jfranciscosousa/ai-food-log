import { z, type ZodType } from "zod";
import { gateway } from "@vercel/ai-sdk-gateway";
import { generateObject } from "ai";

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString("base64");

  return `data:${file.type};base64,${base64String}`;
}

export async function completion<T extends ZodType>(
  system: string,
  prompt: string | File,
  schema: T,
): Promise<z.infer<T>> {
  const promptObj =
    prompt instanceof File
      ? {
          messages: [
            {
              content: [
                {
                  type: "file" as const,
                  data: await fileToBase64(prompt),
                  mediaType: prompt.type,
                },
              ],
              role: "user" as const,
            },
          ],
        }
      : { prompt };

  const response = await generateObject({
    model: gateway("openai/gpt-4.1"),
    system,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: schema as any,
    temperature: 0.1,
    ...promptObj,
  });

  return response.object;
}
