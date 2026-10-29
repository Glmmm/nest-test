const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';

export interface AppEnv {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbSynchronize: boolean;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string[];
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = (source.NODE_ENV ?? 'development') as AppEnv['nodeEnv'];
  const jwtSecret = source.JWT_SECRET?.trim() || DEV_JWT_SECRET;

  return {
    nodeEnv,
    port: toNumber(source.PORT, 3000),
    dbHost: source.DB_HOST ?? 'localhost',
    dbPort: toNumber(source.DB_PORT, 5432),
    dbUser: source.DB_USER ?? 'postgres',
    dbPassword: source.DB_PASSWORD ?? '',
    dbName: source.DB_NAME ?? 'postgres',
    dbSynchronize: toBoolean(source.DB_SYNCHRONIZE, false),
    jwtSecret,
    jwtExpiresIn: source.JWT_EXPIRES_IN ?? '1h',
    corsOrigin: (source.CORS_ORIGIN ?? 'http://localhost:4200')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}

/**
 * Validates and normalizes the environment for `ConfigModule`.
 * Throws on boot when production is missing a real secret.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const env = readEnv({ ...process.env, ...config } as NodeJS.ProcessEnv);

  if (env.nodeEnv === 'production' && !config.JWT_SECRET) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  }

  if (env.nodeEnv === 'production' && env.dbSynchronize) {
    throw new Error('DB_SYNCHRONIZE must be false when NODE_ENV=production');
  }

  return {
    ...config,
    NODE_ENV: env.nodeEnv,
    PORT: env.port,
    DB_HOST: env.dbHost,
    DB_PORT: env.dbPort,
    DB_USER: env.dbUser,
    DB_PASSWORD: env.dbPassword,
    DB_NAME: env.dbName,
    DB_SYNCHRONIZE: env.dbSynchronize,
    JWT_SECRET: env.jwtSecret,
    JWT_EXPIRES_IN: env.jwtExpiresIn,
    CORS_ORIGIN: env.corsOrigin.join(','),
  };
}
