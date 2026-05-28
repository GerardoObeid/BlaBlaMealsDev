#!/bin/bash

PROJECT_BASENAME="blablameals"
LOCATION="francecentral"
RESOURCE_GROUP="${PROJECT_BASENAME}-rg"
BACKEND_APP="${PROJECT_BASENAME}-api"
STORAGE_ACCT="blablamealswebstorage"
BACKEND_PLAN="${PROJECT_BASENAME}-plan"
VAULT_NAME="blablakeyvault"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

echo "Setting up infrastructure for subscription: $SUBSCRIPTION_ID"
echo "Creating Foundation..."

# Infrastructure
az group create --name $RESOURCE_GROUP --location $LOCATION -o none
az storage account create --name $STORAGE_ACCT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS -o none
az storage blob service-properties update --account-name $STORAGE_ACCT --static-website --404-document index.html --index-document index.html -o none
az appservice plan create --name $BACKEND_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux -o none
az webapp create --name $BACKEND_APP --plan $BACKEND_PLAN --resource-group $RESOURCE_GROUP --runtime "NODE:22-lts" -o none

# Identity & Security
IDENTITY_JSON=$(az webapp identity assign --name $BACKEND_APP --resource-group $RESOURCE_GROUP --output json)
PRINCIPAL_ID=$(echo $IDENTITY_JSON | jq -r '.principalId')

az role assignment create --role "Key Vault Secrets User" \
    --assignee $PRINCIPAL_ID \
    --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$VAULT_NAME \
    -o none

echo "Infrastructure setup complete."