import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export const parseEnv = (env: NodeJS.ProcessEnv): Env => envSchema.parse(env);
