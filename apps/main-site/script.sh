#!/bin/bash
TOKEN=\
curl -X POST http://localhost:3000/api/partner/onboarding/session \
  -H 'Content-Type: application/json' \
  -H " Cookie: access-token=\\
