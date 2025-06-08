#!/usr/bin/env bash
gunicorn -k uvicorn.workers.UvicornWorker main:app --chdir Backend --bind 0.0.0.0:$PORT