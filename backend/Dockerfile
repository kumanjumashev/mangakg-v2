ARG PYTHON_VERSION=3.11-slim

FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies.
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /code

WORKDIR /code

RUN pip install poetry
COPY pyproject.toml poetry.lock /code/
RUN poetry config virtualenvs.create false
RUN poetry install --only main --no-root --no-interaction
COPY . /code

ENV SECRET_KEY "fzwiQehcKajU23ifGieH1EQ51THdUdczEDRh0CIl7i2SZJFASs"
RUN python manage.py collectstatic --noinput

# Create entrypoint script to handle permissions
RUN echo '#!/bin/bash\n\
# Ensure /data directory exists and has proper permissions\n\
if [ -d "/data" ]; then\n\
    chown -R root:root /data\n\
    chmod -R 755 /data\n\
fi\n\
\n\
# Run the command\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn","--bind",":8000","--workers","2","mangakg.wsgi"]
