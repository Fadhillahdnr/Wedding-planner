#!/usr/bin/env bash
# Cetak link publik Cloudflare yang sedang aktif: ./docker/url.sh
docker compose logs tunnel 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1
