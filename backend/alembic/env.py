import os
import sys
import urllib.parse
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# 1. Access the migration configurations object
config = context.config

# 2. Interpret the ini file for Python logger configurations
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Pull settings explicitly from your local .env file
root_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(root_env_path)

# 4. Extract password parameters cleanly and encode any special characters
# Your real password is extracted here
raw_password = "Ashoknagar" 
encoded_password = urllib.parse.quote_plus(raw_password)

# 5. Build a perfectly formatted connection URL string
db_url = f"postgresql://postgres:{encoded_password}@127.0.0.1:5432/sih26003_dev"

# Inject the safely encoded URL parameter directly into the configuration maps
config.set_main_option("sqlalchemy.url", db_url)

# Rest of the standard Alembic setup configurations
from app.database.connection import Base
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
