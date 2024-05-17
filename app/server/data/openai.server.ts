/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAIChatApi } from "llm-api";
import { ZodType, ZodTypeDef } from "zod";
import { completion as zodGptCompletion } from "zod-gpt";
import { SERVER_ENV } from "~/env.server";

const openai = new OpenAIChatApi(
  { apiKey: SERVER_ENV.OPENAI_KEY },
  { model: "gpt-4o", temperature: 0.2 },
);

type CompletionArguments<T extends ZodType<any, ZodTypeDef, any>> = Parameters<
  typeof zodGptCompletion<T>
>;

export function completion<T extends ZodType<any, ZodTypeDef, any>>(
  schema: CompletionArguments<T>[1],
  opt?: CompletionArguments<T>[2],
) {
  return zodGptCompletion(openai, schema, opt);
}

export default openai;
