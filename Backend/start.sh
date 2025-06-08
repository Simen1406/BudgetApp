#!/usr/bin/env bash
gunicorn -k uvicorn.workers.UvicornWorker main:app --chdir backend --bind 0.0.0.0:$PORT