import { generateText, Output, type FlexibleSchema } from "ai";

export type Prompt =
  | {
      type: "string";
      content: string;
    }
  | { type: "base64file"; content: string };

export async function completion<T>(
  system: string,
  prompt: Prompt,
  schema: FlexibleSchema<T>,
) {
  const promptObj =
    prompt.type === "base64file"
      ? {
          messages: [
            {
              content: [
                {
                  type: "file" as const,
                  data: prompt.content,
                  mediaType: prompt.type,
                },
              ],
              role: "user" as const,
            },
          ],
        }
      : { prompt: prompt.content };

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
