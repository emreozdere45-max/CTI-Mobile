from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CTI-Mobile API"
    app_env: str = "local"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://cti_mobile:cti_mobile_password@localhost:5432/cti_mobile"
    jwt_secret_key: str = "change-this-local-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    feed_scheduler_enabled: bool = True
    feed_scheduler_interval_minutes: int = 30
    feed_scheduler_limit_per_source: int = 3
    feed_scheduler_cisa_kev_limit: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
