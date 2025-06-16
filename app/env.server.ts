import z from "zod/v4";
import { generateErrorMessage } from "zod-error";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  SECURE_AUTH_COOKIE: z.enum(["true", "false"]).transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]),
  SECRET_KEY_BASE: z.string(),
  OPENAI_KEY: z.string(),
  // Only needed in dev
  VERCEL_OIDC_TOKEN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Zod will filter all the keys not specified on the schema */
function buildEnv(): ServerEnv {
  try {
    console.log(serverEnvSchema.parse(process.env));
    return serverEnvSchema.parse(process.env);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Warning: invalid server env vars!");
    console.error(
      generateErrorMessage(error.issues, {
        delimiter: { error: "\n" },
      }),
    );

    return {} as ServerEnv;
  }
}

export const SERVER_ENV = buildEnv();
