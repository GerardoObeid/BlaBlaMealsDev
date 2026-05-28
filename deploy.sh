#!/bin/bash

RESOURCE_GROUP="blablameals-rg"
BACKEND_APP="blablameals-api"
STORAGE_ACCT="blablamealswebstorage"
VAULT_NAME="blablakeyvault"

echo "Deploying Application..."

# 1. Update Settings 
az webapp config appsettings set --name $BACKEND_APP --resource-group $RESOURCE_GROUP \
  --settings DB_PATH="/home/site/data/mealshare.db" \
           NODE_ENV="production" \
           SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
           JWT_SECRET='@Microsoft.KeyVault(VaultName='$VAULT_NAME';SecretName=JWTSECRET)' -o none

# 2. Deploy Backend
echo "Preparing backend source files..."
cd backend


zip -r ../backend.zip . -x "node_modules/*" ".env*" "public/*" -q
cd ..

echo "Uploading backend code to Azure App Service..."

az webapp deploy --resource-group $RESOURCE_GROUP --name $BACKEND_APP --src-path backend.zip --type zip --async true  -o none
rm backend.zip

# 3. Deploy Frontend
cd frontend
VITE_API_URL="https://$BACKEND_APP.azurewebsites.net"

echo "VITE_API_URL=$VITE_API_URL" > .env.production
npm install > /dev/null && npm run build > /dev/null
cd ..
ACCOUNT_KEY=$(az storage account keys list -g $RESOURCE_GROUP -n $STORAGE_ACCT --query "[0].value" -o tsv)

az storage blob upload-batch \
    --source ./frontend/dist \
    --destination '$web' \
    --account-name $STORAGE_ACCT \
    --account-key $ACCOUNT_KEY \
    --overwrite \
    -o none

echo "Deployment complete."