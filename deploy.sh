#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Error: No commit message provided."
  echo "Usage: ./deploy.sh \"Your commit message\" [environment]"
  echo "Environment options: staging, production (default: production)"
  exit 1
fi

COMMIT_MSG="$1"
ENVIRONMENT="${2:-production}"

echo "⚡️ Staging all changes..."
git add .

echo "⚡️ Committing changes..."
git commit -m "$COMMIT_MSG"

echo "⚡️ Pulling latest changes from GitHub main..."
git pull origin main --rebase

echo "⚡️ Pushing to GitHub main..."
git push origin main

echo "⚡️ Deploying to Cloudflare Workers ($ENVIRONMENT environment)..."
if [ "$ENVIRONMENT" = "staging" ]; then
    wrangler deploy --env staging
    echo "✅ Staging deployment complete"
else
    wrangler deploy --env production
    echo "✅ Production deployment complete"
fi

echo "⚡️ Checking deployment status..."
wrangler deployments list

echo "✅ Deployment complete and ready for testing"
