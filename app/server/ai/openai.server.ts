import { type ZodType } from "zod";
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
) {
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
    model: "openai/gpt-4.1-mini",
    system,

    schema,
    temperature: 0.1,
    ...promptObj,
  });

  return response.object;
}
