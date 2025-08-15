from envparse import env

env.read_envfile()

class Settings():
    DATABASE_URL: str = env.str("DATABASE_URL")
    SECRET_KEY: str = env.str("SECRET_KEY")
    ALGORITHM: str = env.str("ALGORITHM", default="HS256")

settings = Settings()