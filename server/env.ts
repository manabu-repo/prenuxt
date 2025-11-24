import * as dotenvFlow from 'dotenv-flow'
import { z } from 'zod'

// Load .env files according to NODE_ENV (this mutates process.env)
dotenvFlow.config({ node_env: process.env.NODE_ENV || 'development' })

// Define and parse environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'local']).default('development'),
  API_BASE_URL: z.string().url().optional(),
  NUXT_PUBLIC_APP_NAME: z.string().default('PreNuxt'),
  NUXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NUXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  API_SECRET: z.string().optional()
})

export const parsedEnv = envSchema.parse(process.env as Record<string, unknown>)

export const NODE_ENV = parsedEnv.NODE_ENV
export const allowDevtools = ['development', 'test', 'local'].includes(NODE_ENV)

export default parsedEnv
