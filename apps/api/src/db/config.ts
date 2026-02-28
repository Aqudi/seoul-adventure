function getEnv(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
}

export const config = {
    db: {
        host: getEnv("DB_HOST", "localhost"),
        port: Number(getEnv("DB_PORT", "5432")),
        user: getEnv("DB_USER", "postgres"),
        password: getEnv("DB_PASSWORD", "postgres"),
        database: getEnv("DB_NAME", "seoul_advanture"),
        debug: getEnv("NODE_ENV", "development") === "development",
    },
};
