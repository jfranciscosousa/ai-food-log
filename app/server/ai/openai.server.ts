import { generateText, Output, type FlexibleSchema } from "ai";

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString("base64");

  return `data:${file.type};base64,${base64String}`;
}

export async function completion<T>(
  system: string,
  prompt: string | File,
  schema: FlexibleSchema<T>,
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

  const response = await generateText({
    model: "openai/gpt-oss-120b",

    system,

    output: Output.object({
      schema,
    }),

    temperature: 0.1,

    ...promptObj,
  });

  return response.output;
}
