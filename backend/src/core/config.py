from envparse import env

class Settings():
    DATABASE_URL: str = env.str("DATABASE_URL")
    SECRET_KEY: str = env.str("SECRET_KEY")
    ALOGORITHM: str = env.str("ALOGORITHM", default="HS256")

settings = Settings()