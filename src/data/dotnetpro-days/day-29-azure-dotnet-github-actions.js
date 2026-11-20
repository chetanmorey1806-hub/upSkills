const provisionCode = `# ===== Azure CLI: install, login, pick the subscription =====
winget install Microsoft.AzureCLI
az login
az account show --output table
az account set --subscription "Azure for Students"

# ===== Variables (PowerShell) =====
$rg       = "rg-placement-dev"
$loc      = "centralindia"
$plan     = "asp-placement-dev"
$app      = "placement-api-gcoe"            # must be globally unique -> placement-api-gcoe.azurewebsites.net
$sqlsrv   = "sql-placement-gcoe"
$db       = "PlacementDb"
$kv       = "kv-placement-gcoe"
$storage  = "stplacementgcoe"              # 3-24 lowercase letters/digits, globally unique
$ai       = "appi-placement-dev"

# ===== 1. Resource group = a folder for everything in this project =====
az group create --name $rg --location $loc

# ===== 2. App Service plan (the VM you pay for) + Web App (your API) =====
az appservice plan create --name $plan --resource-group $rg --sku S1 --is-linux
az webapp create --name $app --resource-group $rg --plan $plan --runtime "DOTNETCORE:8.0"
az webapp config set --name $app --resource-group $rg --always-on true --http20-enabled true --min-tls-version 1.2
az webapp update --name $app --resource-group $rg --https-only true
az webapp config set --name $app --resource-group $rg --generic-configurations '{"healthCheckPath": "/health/ready"}'

# ===== 3. Azure SQL server + database =====
az sql server create --name $sqlsrv --resource-group $rg --location $loc \`
  --admin-user sqladminuser --admin-password "Str0ng#Placement2026"
az sql db create --resource-group $rg --server $sqlsrv --name $db \`
  --edition GeneralPurpose --compute-model Serverless --family Gen5 --capacity 1 --auto-pause-delay 60
# allow other Azure services (App Service) to connect
az sql server firewall-rule create --resource-group $rg --server $sqlsrv --name AllowAzure \`
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
# allow YOUR PC for SSMS (replace with your public IP)
az sql server firewall-rule create --resource-group $rg --server $sqlsrv --name MyLaptop \`
  --start-ip-address 49.36.12.34 --end-ip-address 49.36.12.34

# ===== 4. App settings + connection string (they become environment variables) =====
az webapp config appsettings set --name $app --resource-group $rg --settings \`
  ASPNETCORE_ENVIRONMENT=Production Cors__AllowedOrigins__0=https://placement.gcoe.ac.in
az webapp config connection-string set --name $app --resource-group $rg --connection-string-type SQLAzure \`
  --settings PlacementDb="Server=tcp:sql-placement-gcoe.database.windows.net,1433;Database=PlacementDb;Authentication=Active Directory Default;Encrypt=True;"

# ===== 5. Scale =====
az appservice plan update --name $plan --resource-group $rg --number-of-workers 2   # scale OUT (more instances)
az appservice plan update --name $plan --resource-group $rg --sku P0V3              # scale UP (bigger machine)

# ===== Logs =====
az webapp log config --name $app --resource-group $rg --docker-container-logging filesystem
az webapp log tail --name $app --resource-group $rg`;

const kvCode = `# ===== Managed Identity: the app gets its own Azure AD identity (no passwords in config) =====
az webapp identity assign --name $app --resource-group $rg
$principalId = az webapp identity show --name $app --resource-group $rg --query principalId -o tsv

# ===== Key Vault with Azure RBAC =====
az keyvault create --name $kv --resource-group $rg --location $loc --enable-rbac-authorization true
$kvId = az keyvault show --name $kv --query id -o tsv
az role assignment create --assignee $principalId --role "Key Vault Secrets User" --scope $kvId
# you also need "Key Vault Secrets Officer" on the vault to add secrets yourself
az keyvault secret set --vault-name $kv --name "Jwt--Key" --value "a-very-long-random-signing-key-1234567890"
az keyvault secret set --vault-name $kv --name "Email--SmtpPassword" --value "app-password-here"
#   "--" in a secret name becomes ":" in .NET configuration -> Jwt:Key, Email:SmtpPassword

# ===== Azure SQL: let the app's identity log in (run in SSMS / Query editor as the Entra admin) =====
# CREATE USER [placement-api-gcoe] FROM EXTERNAL PROVIDER;
# ALTER ROLE db_datareader ADD MEMBER [placement-api-gcoe];
# ALTER ROLE db_datawriter ADD MEMBER [placement-api-gcoe];
# ALTER ROLE db_ddladmin   ADD MEMBER [placement-api-gcoe];   -- only if the app runs migrations

// ===== Program.cs =====
// dotnet add package Azure.Identity
// dotnet add package Azure.Extensions.AspNetCore.Configuration.Secrets
// dotnet add package Azure.Storage.Blobs
// dotnet add package Microsoft.Extensions.Azure
// dotnet add package Azure.Monitor.OpenTelemetry.AspNetCore
using Azure.Identity;
using Azure.Monitor.OpenTelemetry.AspNetCore;
using Microsoft.Extensions.Azure;

var builder = WebApplication.CreateBuilder(args);

// DefaultAzureCredential: Managed Identity in Azure, your "az login" / Visual Studio account on your laptop
var credential = new DefaultAzureCredential();

if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri("https://kv-placement-gcoe.vault.azure.net/"), credential);   // Jwt--Key -> Jwt:Key
}

// Application Insights through OpenTelemetry (reads APPLICATIONINSIGHTS_CONNECTION_STRING)
builder.Services.AddOpenTelemetry().UseAzureMonitor();

// Blob Storage client, authenticated with the same identity
builder.Services.AddAzureClients(clients =>
{
    clients.AddBlobServiceClient(new Uri("https://stplacementgcoe.blob.core.windows.net"));
    clients.UseCredential(credential);
});

builder.Services.AddDbContext<PlacementDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("PlacementDb"),
        sql => sql.EnableRetryOnFailure()));            // transient faults are normal in the cloud

// ===== Alternative: Key Vault REFERENCE in App Settings (no code change) =====
# az webapp config appsettings set --name $app --resource-group $rg --settings \`
#   "Jwt__Key=@Microsoft.KeyVault(SecretUri=https://kv-placement-gcoe.vault.azure.net/secrets/Jwt--Key/)"`;

const blobAiCode = `# ===== Storage account + private container for resumes =====
az storage account create --name $storage --resource-group $rg --location $loc --sku Standard_LRS --kind StorageV2 --allow-blob-public-access false
$stId = az storage account show --name $storage --resource-group $rg --query id -o tsv
az role assignment create --assignee $principalId --role "Storage Blob Data Contributor" --scope $stId
az storage container create --account-name $storage --name resumes --auth-mode login

# ===== Application Insights (workspace-based) =====
az monitor log-analytics workspace create --resource-group $rg --workspace-name law-placement-dev
az monitor app-insights component create --app $ai --location $loc --resource-group $rg --workspace law-placement-dev
$aiConn = az monitor app-insights component show --app $ai --resource-group $rg --query connectionString -o tsv
az webapp config appsettings set --name $app --resource-group $rg --settings APPLICATIONINSIGHTS_CONNECTION_STRING=$aiConn

// ===== Controllers/ResumesController.cs =====
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController, Route("api/students/{studentId:int}/resume"), Authorize]
public class ResumesController(BlobServiceClient blobService, ILogger<ResumesController> logger) : ControllerBase
{
    private BlobContainerClient Container => blobService.GetBlobContainerClient("resumes");

    [HttpPost]
    [RequestSizeLimit(2 * 1024 * 1024)]                  // 2 MB
    public async Task<IActionResult> Upload(int studentId, IFormFile file, CancellationToken ct)
    {
        if (file.ContentType != "application/pdf") return BadRequest("Only PDF resumes are allowed");

        var blob = Container.GetBlobClient($"{studentId}/resume.pdf");
        await using var stream = file.OpenReadStream();
        await blob.UploadAsync(stream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = "application/pdf" }
        }, ct);

        // structured log -> becomes a searchable trace in Application Insights
        logger.LogInformation("Resume uploaded for student {StudentId}, size {Bytes} bytes", studentId, file.Length);
        return Ok(new { blob = blob.Name });
    }

    [HttpGet("link")]
    public async Task<IActionResult> GetLink(int studentId)
    {
        var blob = Container.GetBlobClient($"{studentId}/resume.pdf");
        if (!await blob.ExistsAsync()) return NotFound();

        // user delegation SAS: a 15-minute read-only link signed with the app identity (no account key)
        var key = await blobService.GetUserDelegationKeyAsync(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMinutes(15));
        var sas = new BlobSasBuilder
        {
            BlobContainerName = "resumes",
            BlobName = blob.Name,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
        };
        sas.SetPermissions(BlobSasPermissions.Read);
        var uri = new BlobUriBuilder(blob.Uri)
        {
            Sas = sas.ToSasQueryParameters(key.Value, blobService.AccountName)
        }.ToUri();
        return Ok(new { url = uri.ToString() });
    }
}

// ===== KQL queries in Application Insights > Logs =====
// slowest endpoints in the last 24 hours
requests
| where timestamp > ago(24h)
| summarize calls = count(), avgMs = avg(duration), p95Ms = percentile(duration, 95) by name
| order by p95Ms desc

// failures with their exception
requests
| where success == false
| join kind=inner (exceptions) on operation_Id
| project timestamp, name, resultCode, type, outerMessage
| take 20`;

const workflowCode = `# ===== One-time setup: OIDC (no client secret stored in GitHub) =====
az ad app create --display-name gh-placement-deploy
$appId = az ad app list --display-name gh-placement-deploy --query "[0].appId" -o tsv
az ad sp create --id $appId
az ad app federated-credential create --id $appId --parameters '{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:gcoe-tpo/placement-portal:environment:production",
  "audiences": ["api://AzureADTokenExchange"] }'
az role assignment create --assignee $appId --role "Website Contributor" --scope (az group show -n $rg --query id -o tsv)
# GitHub repo > Settings > Secrets and variables > Actions: AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID
# GitHub repo > Settings > Environments: "staging" and "production" (add required reviewers to production)

# ===== .github/workflows/placement-api.yml =====
name: Placement API CI/CD

on:
  push:
    branches: [ main ]
    paths: [ "src/**", "tests/**", ".github/workflows/placement-api.yml" ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:                       # manual "Run workflow" button

permissions:
  id-token: write                          # needed for OIDC login to Azure
  contents: read

env:
  DOTNET_VERSION: "8.0.x"
  APP_NAME: placement-api-gcoe
  RESOURCE_GROUP: rg-placement-dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: \${{ env.DOTNET_VERSION }}

      - name: Restore
        run: dotnet restore PlacementPortal.sln

      - name: Build
        run: dotnet build PlacementPortal.sln -c Release --no-restore

      - name: Test
        run: dotnet test PlacementPortal.sln -c Release --no-build --logger trx --collect:"XPlat Code Coverage"

      - name: Publish
        run: dotnet publish src/Placement.Api/Placement.Api.csproj -c Release --no-build -o \${{ github.workspace }}/publish

      - name: Create EF Core migration bundle
        run: |
          dotnet tool install --global dotnet-ef
          dotnet ef migrations bundle -p src/Placement.Infrastructure -s src/Placement.Api -o \${{ github.workspace }}/efbundle --self-contained -r linux-x64

      - uses: actions/upload-artifact@v4
        with:
          name: api
          path: |
            \${{ github.workspace }}/publish
            \${{ github.workspace }}/efbundle

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://placement-api-gcoe-staging.azurewebsites.net
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: api

      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to the staging slot
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.APP_NAME }}
          slot-name: staging
          package: publish

      - name: Smoke test
        run: curl --fail --retry 10 --retry-delay 10 https://placement-api-gcoe-staging.azurewebsites.net/health/ready

  swap-to-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production                     # waits for a reviewer's approval
      url: https://placement-api-gcoe.azurewebsites.net
    steps:
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Swap staging -> production
        run: az webapp deployment slot swap -g \${{ env.RESOURCE_GROUP }} -n \${{ env.APP_NAME }} --slot staging --target-slot production`;

const slotCode = `# ===== Deployment slots (Standard tier or higher) =====
az webapp deployment slot create --name $app --resource-group $rg --slot staging --configuration-source $app
az webapp deployment slot list --name $app --resource-group $rg -o table

# staging gets its own database - mark it as a SLOT SETTING so it does NOT move during a swap
az webapp config connection-string set --name $app --resource-group $rg --slot staging \`
  --connection-string-type SQLAzure --slot-settings PlacementDb="Server=tcp:sql-placement-gcoe.database.windows.net,1433;Database=PlacementDb-Staging;Authentication=Active Directory Default;"
az webapp config appsettings set --name $app --resource-group $rg --slot staging --slot-settings ASPNETCORE_ENVIRONMENT=Staging

# swap (warm-up happens first: Azure calls the staging app until it responds, then switches the routing)
az webapp deployment slot swap --name $app --resource-group $rg --slot staging --target-slot production

# something is wrong? swap again = instant rollback (the old version is now in staging)
az webapp deployment slot swap --name $app --resource-group $rg --slot staging --target-slot production

# canary: send 10% of real users to staging
az webapp traffic-routing set --name $app --resource-group $rg --distribution staging=10
az webapp traffic-routing clear --name $app --resource-group $rg

# ===== Cost basics =====
# Budget alert: Portal > Cost Management > Budgets > Add (e.g. 1000 INR/month, alert at 80%)
az consumption usage list --start-date 2026-11-01 --end-date 2026-11-20 -o table
# Stop paying for a practice environment completely:
az group delete --name $rg --yes --no-wait`;

export default {
  id: 'day-29-azure-dotnet-github-actions',
  title: 'Azure for .NET Developers: App Service, Azure SQL, Key Vault, App Insights, Blob Storage and GitHub Actions',
  module: 'Module 7: DevOps & Cloud for .NET',
  day: 29,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Deploy the Placement API to Microsoft Azure like a professional team. You will create App Service and Azure SQL with the az CLI, store secrets in Key Vault and read them with Managed Identity, monitor the app with Application Insights and KQL, and save resumes in Blob Storage. Then you will build a GitHub Actions CI/CD pipeline that deploys to a staging slot and swaps to production, and finish with the cost basics every fresher must know.',
  objectives: [
    'Create and configure App Service, App Service plans, app settings and connection strings with the az CLI',
    'Connect to Azure SQL with firewall rules and passwordless Managed Identity authentication',
    'Store secrets in Key Vault and load them with DefaultAzureCredential, or with Key Vault references',
    'Add Application Insights telemetry, write KQL queries, and upload/download files with Blob Storage and SAS',
    'Write a GitHub Actions workflow with OIDC login, deployment slots, swaps and approvals, and control costs',
  ],
  theory: [
    {
      heading: 'Azure basics and App Service',
      content:
        'Azure organises everything in a hierarchy: Tenant (your organisation\'s Entra ID) > Subscription (the billing account) > Resource Group (a folder for one project and environment, such as rg-placement-dev) > Resources (web app, database, vault). Delete the resource group and everything inside is deleted, which is the easiest way to stop paying for practice work. Azure App Service is a PaaS (Platform as a Service) for web apps and APIs. You upload your published .NET app or a container image, and Azure manages the OS, patching, load balancer, TLS certificates and scaling. You pay for the App Service PLAN (the machines), not per app. Several apps can share one plan.',
      points: [
        'Tiers: Free F1 / Basic B1 (dev and test), Standard S1 (slots, autoscale), Premium v3 (production, more power), Isolated (private network)',
        'Scale UP = a bigger machine (B1 -> P1v3). Scale OUT = more instances (1 -> 3) behind the built-in load balancer',
        'App settings and connection strings in the portal become environment variables, overriding appsettings.json (Day 27 double underscore rules)',
        'Turn on Always On (keeps the app warm), HTTPS only, minimum TLS 1.2, and set the Health check path (/health/ready) so bad instances are replaced',
        'Other hosting options: Azure Container Apps (containers without managing K8s), AKS (full Kubernetes, Day 28), Azure Functions (serverless), Static Web Apps (Angular)',
      ],
      tip: 'Students can get "Azure for Students" credit without a credit card using a college email. Always create a budget alert first.',
    },
    {
      heading: 'Azure SQL Database',
      content:
        'Azure SQL Database is SQL Server as a managed service. Microsoft handles backups (point-in-time restore), patching, high availability and much of the tuning. Your EF Core and Dapper code works unchanged. Only the connection string changes. A logical server (sql-placement-gcoe.database.windows.net) holds one or more databases. Pricing models: DTU (Basic/Standard/Premium, simple bundles) or vCore (General Purpose / Business Critical, with a Serverless option that auto-pauses when idle, which suits dev). By default the server firewall blocks everything. Add a rule for your IP (SSMS) and allow Azure services, or better, use Private Endpoints.',
      points: [
        'Passwordless: the App Service Managed Identity logs in with Authentication=Active Directory Default. Create the user with CREATE USER [app-name] FROM EXTERNAL PROVIDER',
        'Always use EnableRetryOnFailure(), because cloud databases have short transient failures during failovers',
        'Apply migrations from the pipeline (an EF migration bundle or an idempotent SQL script), not on app startup, when there are many instances',
        'Elastic pools share resources between many small databases (multi-tenant SaaS)',
      ],
    },
    {
      heading: 'Key Vault and Managed Identity: no secrets in code',
      content:
        'Azure Key Vault stores secrets (connection strings, JWT keys, SMTP passwords), keys and certificates, with access control and an audit log. A Managed Identity is an identity Azure gives your App Service automatically, so the app proves who it is without any password. Give that identity the "Key Vault Secrets User" role, and the app can read secrets. In code, DefaultAzureCredential tries several sign-in methods in order. In Azure it uses the Managed Identity. On your laptop it uses your Visual Studio or az login account. The SAME code works in both places. builder.Configuration.AddAzureKeyVault(...) loads all secrets into IConfiguration. A secret named Jwt--Key becomes Jwt:Key.',
      points: [
        'System-assigned identity: lives and dies with the app. User-assigned identity: shared between resources, created separately',
        'Key Vault reference in App Settings: @Microsoft.KeyVault(SecretUri=...) needs no code change',
        'Prefer Azure RBAC on the vault (--enable-rbac-authorization) over old access policies',
        'Soft delete and purge protection prevent accidental permanent loss of secrets',
        'The same DefaultAzureCredential also authenticates to Azure SQL, Blob Storage, Service Bus and more',
      ],
      syntax: `builder.Configuration.AddAzureKeyVault(
    new Uri("https://kv-placement-gcoe.vault.azure.net/"),
    new DefaultAzureCredential());`,
    },
    {
      heading: 'Application Insights: know what production is doing',
      content:
        'Application Insights (part of Azure Monitor) collects requests, dependencies (SQL, HTTP, Redis calls), exceptions, logs (ILogger), and performance counters from your app. It shows them as dashboards: Failures, Performance, Live Metrics, and an Application Map of how your services call each other. The modern way to send data is OpenTelemetry: builder.Services.AddOpenTelemetry().UseAzureMonitor() with the APPLICATIONINSIGHTS_CONNECTION_STRING setting. You query the data with KQL (Kusto Query Language) in Logs and can create alerts, such as "failed requests > 20 in 5 minutes -> email the team".',
      points: [
        'Tables: requests, dependencies, exceptions, traces, customEvents, performanceCounters',
        'operation_Id links all telemetry of one request across services (distributed tracing)',
        'Use structured logging: logger.LogInformation("Resume uploaded for {StudentId}", id). The value becomes a searchable property',
        'Sampling keeps cost under control on high traffic. Do not log personal data such as passwords or Aadhaar numbers',
        'Older package: Microsoft.ApplicationInsights.AspNetCore with AddApplicationInsightsTelemetry(). It is still common in existing projects',
      ],
      syntax: `requests
| where timestamp > ago(1h)
| summarize count(), avg(duration) by name, resultCode
| order by count_ desc`,
    },
    {
      heading: 'Blob Storage for files',
      content:
        'Never store uploaded files (resumes, offer letters, photos) on the App Service disk or in a container. Instances are replaced and scaled, and files get lost or become inconsistent. Azure Blob Storage stores unlimited files cheaply. Structure: Storage account > Container (like a folder, e.g. resumes) > Blob (the file, e.g. 101/resume.pdf). Use the Azure.Storage.Blobs SDK: BlobServiceClient > BlobContainerClient > BlobClient.UploadAsync / DownloadStreamingAsync. Keep containers private and give users a short-lived SAS (Shared Access Signature) link when they need to download.',
      points: [
        'Access tiers: Hot (frequent), Cool, Cold, Archive (cheapest, hours to read). Lifecycle rules move old blobs automatically',
        'Redundancy: LRS (one datacenter), ZRS (zones), GRS (another region)',
        'Prefer identity-based access (role "Storage Blob Data Contributor") over account keys. A user-delegation SAS is signed with Entra ID, not the account key',
        'Validate file type and size before upload. For big files, let the browser upload directly with a SAS',
      ],
    },
    {
      heading: 'CI/CD with GitHub Actions, deployment slots and cost basics',
      content:
        'A GitHub Actions workflow (.github/workflows/*.yml) runs on triggers (push, pull_request, workflow_dispatch). Its jobs run on runners (ubuntu-latest) and are made of steps. Each step uses an action (actions/checkout, actions/setup-dotnet, azure/login, azure/webapps-deploy) or runs a shell command. Use OIDC federated credentials so GitHub gets a short-lived Azure token, with no long-lived secret stored. Deployment slots (Standard tier+) are live copies of your app with their own URL, for example -staging. Deploy to staging, run smoke tests, then SWAP. Azure warms up staging and switches the routing, which gives near-zero downtime and an instant rollback (swap back). Settings marked as slot settings (sticky) stay with their slot during a swap. GitHub Environments add manual approval before production.',
      points: [
        'needs: makes jobs run in order. if: adds conditions. environment: adds approvals and secrets per environment',
        'Upload and download artifacts to pass the publish output between jobs',
        'Cost basics: you pay per plan per hour even when the app is idle. Serverless SQL auto-pauses. Stop or delete dev resources. Set Budgets and alerts. Tag resources (env=dev, owner=tpo)',
        'Approximate monthly costs (check the Azure Pricing Calculator for INR): B1 plan about 13 USD, S1 about 70 USD, SQL Basic 5 DTU about 5 USD, Key Vault and Blob Storage are a few rupees for small use',
        'The biggest bill surprises are forgotten Premium plans and VMs, AKS node pools left running, and log ingestion without sampling',
      ],
    },
  ],
  examples: [
    {
      title: 'Provision App Service and Azure SQL with the az CLI',
      scenario:
        'The TPO wants the placement API online before the next drive. Create a resource group, a Linux App Service plan and web app, an Azure SQL serverless database, firewall rules and app settings, using commands only so it can be repeated for QA.',
      steps: [
        'Install the Azure CLI and run az login (a browser window opens)',
        'Open PowerShell, paste the variables block and change the names so they are globally unique',
        'Run the commands section by section and check each result in the Azure Portal',
        'Connect SSMS to sql-placement-gcoe.database.windows.net with the admin login to confirm the firewall rule',
        'Visual Studio alternative: right-click the API > Publish > Azure > Azure App Service (Linux)',
      ],
      code: provisionCode,
      result: `PS> az webapp create --name placement-api-gcoe --resource-group rg-placement-dev --plan asp-placement-dev --runtime "DOTNETCORE:8.0"
{
  "defaultHostName": "placement-api-gcoe.azurewebsites.net",
  "httpsOnly": false,
  "kind": "app,linux",
  "location": "Central India",
  "state": "Running",
  ...
}

PS> az sql db show -g rg-placement-dev -s sql-placement-gcoe -n PlacementDb --query "{name:name, sku:currentSku.name, status:status}"
{ "name": "PlacementDb", "sku": "GP_S_Gen5", "status": "Online" }

PS> az webapp log tail --name placement-api-gcoe --resource-group rg-placement-dev
2026-11-20T09:41:12  info: Microsoft.Hosting.Lifetime[14] Now listening on: http://[::]:8080
2026-11-20T09:41:12  info: Microsoft.Hosting.Lifetime[0] Application started.`,
      explanation:
        'The plan is the machine you pay for, and the web app runs on it. httpsOnly is false right after creation, which is why the next command turns it on. Settings set with az webapp config appsettings become environment variables, so Cors__AllowedOrigins__0 overrides appsettings.json exactly as in Docker. The connection string uses Authentication=Active Directory Default, so there is no password at all: the app logs in with its Managed Identity (next example). Firewall rule 0.0.0.0-0.0.0.0 is the special "allow Azure services" rule.',
    },
    {
      title: 'Key Vault + Managed Identity + passwordless Azure SQL',
      scenario:
        'Security review: "No passwords in appsettings.json, in GitHub, or in App Service settings." Move the JWT key and SMTP password to Key Vault and make the app log in to SQL and the vault with its own identity.',
      steps: [
        'Enable the system-assigned identity on the web app',
        'Create the vault with RBAC, grant "Key Vault Secrets User" to the identity, and add the secrets',
        'In SSMS (logged in as the Entra admin of the SQL server) run the CREATE USER ... FROM EXTERNAL PROVIDER script',
        'Add the NuGet packages and the Program.cs code, then redeploy',
        'Locally run az login. DefaultAzureCredential then uses your account, so the same code works on your laptop',
      ],
      code: kvCode,
      result: `PS> az keyvault secret list --vault-name kv-placement-gcoe --query "[].name" -o tsv
Email--SmtpPassword
Jwt--Key

App start (Application Insights traces):
  Loaded configuration from https://kv-placement-gcoe.vault.azure.net/
  Configuration["Jwt:Key"] length = 41 characters (value never logged)
  EF Core connected to PlacementDb as placement-api-gcoe (Managed Identity)

Without the role assignment the app fails at startup with:
  Azure.RequestFailedException: Caller is not authorized to perform action on resource. Status: 403 (Forbidden)`,
      explanation:
        'The app has no password anywhere. Azure issues tokens to the Managed Identity, and Key Vault and Azure SQL trust those tokens because of the role assignment and the CREATE USER ... FROM EXTERNAL PROVIDER statement. The "--" in secret names maps to ":" so Jwt--Key appears as Jwt:Key and the JWT code from Day 26 needs no change. If you forget the role assignment, you get a 403 at startup, which is the most common Key Vault mistake.',
    },
    {
      title: 'Blob Storage resume upload with SAS links and Application Insights',
      scenario:
        'Students upload PDF resumes (max 2 MB). Recruiters get a 15-minute download link. The team wants to see slow endpoints and failures in Application Insights.',
      steps: [
        'Create the storage account and private "resumes" container, and give the app identity "Storage Blob Data Contributor"',
        'Create the Log Analytics workspace and Application Insights, and set APPLICATIONINSIGHTS_CONNECTION_STRING on the web app',
        'Add ResumesController, deploy, and upload a PDF with Postman (form-data, key "file")',
        'Call GET /api/students/101/resume/link and open the URL in a browser',
        'In the Portal: Application Insights > Logs, run the KQL queries',
      ],
      code: blobAiCode,
      result: `POST /api/students/101/resume  (form-data file=Asha_Resume.pdf)  -> 200 { "blob": "101/resume.pdf" }
POST /api/students/101/resume  (file=photo.png)                   -> 400 "Only PDF resumes are allowed"
GET  /api/students/101/resume/link -> 200
{ "url": "https://stplacementgcoe.blob.core.windows.net/resumes/101/resume.pdf?skoid=...&sp=r&se=2026-11-20T10%3A05%3A00Z&sig=..." }
(after 15 minutes the same URL returns 403 AuthenticationFailed)

KQL result (sample):
name                                   calls  avgMs   p95Ms
POST Resumes/Upload                    48     412.7   980.2
GET Students/GetAll                    1260   38.4    95.0
GET Resumes/GetLink                    75     61.9    140.3`,
      explanation:
        'Files live in Blob Storage, so any App Service instance can serve any request and nothing is lost when instances restart. The container is private, and the SAS link grants read-only access to one blob for 15 minutes. It is signed with a user delegation key from the app identity, so the storage account key is never used. Application Insights automatically records every request and the Blob dependency call. The structured log adds StudentId as a searchable field. Your timings and SAS values will differ.',
    },
    {
      title: 'GitHub Actions: build, test, deploy to staging, approve, swap',
      scenario:
        'Every push to main must build and test the solution, deploy to the staging slot, smoke-test it, and wait for the TPO tech lead\'s approval before swapping into production. No Azure password may be stored in GitHub.',
      steps: [
        'Create the Entra app registration and federated credential (OIDC) with the az commands, and assign "Website Contributor" on the resource group',
        'Add AZURE_CLIENT_ID, AZURE_TENANT_ID and AZURE_SUBSCRIPTION_ID as repository secrets',
        'Create the GitHub Environments "staging" and "production", and add yourself as a required reviewer on production',
        'Commit .github/workflows/placement-api.yml and push to main',
        'Open the Actions tab, watch the jobs, approve the production job, and check the live URL',
      ],
      code: workflowCode,
      result: `Actions > Placement API CI/CD > #14 (push to main by asha-patil)

build                 OK 2m 41s   Restore, Build, Test (126 passed), Publish, EF bundle, Upload artifact
deploy-staging        OK 1m 05s   azure/login (OIDC), webapps-deploy slot=staging, Smoke test 200
swap-to-production    PAUSED  Waiting for review: production needs approval from @tpo-lead
                      OK 0m 38s   (approved) slot swap staging -> production

https://placement-api-gcoe.azurewebsites.net/health/ready -> Healthy

Pull request #15: only "build" runs (deploy jobs skipped by the if: condition)`,
      explanation:
        'permissions: id-token: write lets the workflow request an OIDC token. azure/login exchanges it for an Azure token that is trusted only for this repository and environment (the "subject"), so no client secret exists. The build job publishes once, and later jobs reuse the same artifact, so production runs exactly what was tested. The production environment pauses for approval. The swap warms up the new version before switching traffic. The EF migration bundle is built here, and you run it against the database in a pipeline step before the swap.',
    },
    {
      title: 'Deployment slots, sticky settings, canary traffic and cost control',
      scenario:
        'The staging slot must use its own database (PlacementDb-Staging) even after swaps. Before a big release, send 10% of real users to the new version. At the end of the course, delete the practice environment so the bill stops.',
      steps: [
        'Create the staging slot (needs the S1 plan or higher)',
        'Set the staging connection string and ASPNETCORE_ENVIRONMENT with --slot-settings so they stick to the slot',
        'Swap, check production, then swap back to practise a rollback',
        'Set 10% traffic routing to staging and clear it afterwards',
        'Create a budget in Cost Management, then run az group delete when you are done',
      ],
      code: slotCode,
      result: `PS> az webapp deployment slot list --name placement-api-gcoe --resource-group rg-placement-dev -o table
Name     ResourceGroup      State    DefaultHostName
-------  -----------------  -------  -------------------------------------------
staging  rg-placement-dev   Running  placement-api-gcoe-staging.azurewebsites.net

After swap:
  production -> new code, connection string PlacementDb (production DB)   (sticky setting stayed)
  staging    -> old code, connection string PlacementDb-Staging           (instant rollback = swap again)

PS> az group delete --name rg-placement-dev --yes --no-wait
(all resources in the group are deleted in a few minutes; billing for them stops)`,
      explanation:
        'A swap moves code and non-sticky settings between slots, while slot settings stay where they are. That is why the staging database never ends up in production by mistake. Traffic routing sends a percentage of users (with a cookie, so each user stays on one version) to staging for canary testing. Slots run on the same plan, so they add no plan cost but share its CPU and memory. Deleting the resource group is the cleanest way to stop all charges for a practice setup.',
    },
  ],
  interview: [
    { q: 'What is Azure App Service and what is an App Service plan?', a: 'App Service is a PaaS for hosting web apps and APIs without managing servers: OS patching, TLS, load balancing and scaling are handled by Azure. The App Service plan defines the compute (tier, size, instance count) and is what you pay for. Several apps can share one plan.', level: 'Easy' },
    { q: 'Scale up vs scale out?', a: 'Scale up (vertical) moves to a bigger machine or tier, with more CPU and RAM. Scale out (horizontal) adds more instances behind the load balancer. It can be automatic with autoscale rules (CPU > 70% -> add an instance). Scaling out needs a stateless app.', level: 'Easy' },
    { q: 'How do App Service app settings relate to appsettings.json?', a: 'They are exposed as environment variables, which override appsettings.json. Nested keys use a double underscore on Linux (Jwt__Issuer). Connection strings set in the portal are read by GetConnectionString().', level: 'Medium' },
    { q: 'What is a Managed Identity and why use it?', a: 'An Entra ID identity that Azure creates and manages for a resource (App Service, Function, VM). The app gets tokens for Key Vault, SQL and Storage without storing any password or secret, and credentials are rotated automatically.', level: 'Medium' },
    { q: 'What does DefaultAzureCredential do?', a: 'It tries a chain of credential sources in order: environment variables, workload identity, Managed Identity, then developer tools (Visual Studio, Azure CLI, azd...). The same code uses the Managed Identity in Azure and your own login on your laptop.', level: 'Medium' },
    { q: 'Two ways to use Key Vault secrets in an ASP.NET Core app on App Service?', a: '1) Code: builder.Configuration.AddAzureKeyVault(vaultUri, credential), which loads all secrets into IConfiguration ("--" becomes ":"). 2) No code: Key Vault references in app settings, @Microsoft.KeyVault(SecretUri=...). Both need the app identity to have read access to the vault.', level: 'Medium' },
    { q: 'Why can\'t my App Service connect to Azure SQL?', a: 'Common causes: the server firewall does not allow Azure services or the outbound IPs (or a private endpoint/VNet is missing), the connection string is wrong, the Managed Identity user was not created in the database (CREATE USER ... FROM EXTERNAL PROVIDER), or the database is serverless and paused on the first call. Add retries.', level: 'Hard' },
    { q: 'What does Application Insights collect and how do you query it?', a: 'Requests, dependencies (SQL, HTTP, Redis), exceptions, traces (ILogger), page views, custom events and metrics. Query it with KQL in Logs (requests | where success == false | summarize count() by name). Use alerts and the Application Map for monitoring.', level: 'Medium' },
    { q: 'Why store uploaded files in Blob Storage instead of the web server disk?', a: 'App instances are temporary and scaled out, so local files would be lost or exist on only one instance. Blob Storage is durable, cheap, has redundancy and tiers, can be served with SAS links or a CDN, and does not grow your app\'s disk.', level: 'Easy' },
    { q: 'What is a SAS token?', a: 'A Shared Access Signature is a signed query string that gives limited access (permissions, expiry time, IP range) to a storage resource without sharing account keys. A user delegation SAS is signed with an Entra ID identity and is the most secure type.', level: 'Medium' },
    { q: 'What are deployment slots and why swap instead of deploying directly to production?', a: 'Slots are live copies of the app (staging, qa) with their own hostnames, available on Standard tier and above. You deploy and test in staging, then swap. Azure warms up the new version before switching routing, so there is no cold start or downtime, and swapping back is an instant rollback.', level: 'Medium' },
    { q: 'What is a slot setting (sticky setting)?', a: 'An app setting or connection string marked to stay with its slot during a swap. It is used for environment-specific values such as the staging database or ASPNETCORE_ENVIRONMENT=Staging, so they never move into production.', level: 'Medium' },
    { q: 'How does GitHub Actions log in to Azure without storing a secret?', a: 'OpenID Connect: a federated credential on an Entra app registration trusts tokens from token.actions.githubusercontent.com for a specific repo, branch or environment. The workflow (permissions: id-token: write) uses azure/login with client-id, tenant-id and subscription-id, and receives a short-lived token.', level: 'Hard' },
    { q: 'Explain the stages of your .NET CI/CD pipeline.', a: 'On a PR: restore, build, test (with coverage), plus quality checks. On main: also publish once and upload the artifact, build an EF migration bundle, deploy to staging, smoke test, wait for approval in the production environment, apply migrations, swap slots, and monitor App Insights, with swap-back as the rollback.', level: 'Medium' },
    { q: 'How do you keep Azure costs low for a student or dev project?', a: 'Use the free or student credits, choose small tiers (F1/B1, serverless SQL with auto-pause), share one plan between apps, stop or delete unused resources (az group delete), create budgets and alerts, use sampling for telemetry, tag resources by owner and environment, and check the Pricing Calculator before creating Premium resources.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Deploy the Angular placement-ui to Azure Static Web Apps with a GitHub Actions workflow, and add a staticwebapp.config.json so deep links like /students/2 work.',
      hint: 'az staticwebapp create --name placement-ui --resource-group ... --source ... --branch main --app-location "placement-ui" --output-location "dist/placement-ui/browser" --login-with-github',
      solution: `// placement-ui/staticwebapp.config.json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,png,svg,ico}"]
  }
}
// The generated workflow uses Azure/static-web-apps-deploy@v1 with
//   app_location: "placement-ui", output_location: "dist/placement-ui/browser"
// Add the SWA URL to the API's Cors__AllowedOrigins__1 app setting.`,
    },
    {
      task: 'Write an autoscale rule for the App Service plan: minimum 1, maximum 3 instances, add 1 instance when average CPU > 70% for 10 minutes, remove 1 when < 30%.',
      hint: 'az monitor autoscale create and az monitor autoscale rule create.',
      solution: `az monitor autoscale create -g rg-placement-dev --resource asp-placement-dev --resource-type Microsoft.Web/serverfarms --name placement-autoscale --min-count 1 --max-count 3 --count 1
az monitor autoscale rule create -g rg-placement-dev --autoscale-name placement-autoscale --condition "CpuPercentage > 70 avg 10m" --scale out 1
az monitor autoscale rule create -g rg-placement-dev --autoscale-name placement-autoscale --condition "CpuPercentage < 30 avg 10m" --scale in 1`,
    },
    {
      task: 'Write a KQL query that shows the number of failed requests per hour for the last 24 hours, and create an alert idea from it.',
      hint: 'requests | where success == false | summarize count() by bin(timestamp, 1h).',
      solution: `requests
| where timestamp > ago(24h) and success == false
| summarize failures = count() by bin(timestamp, 1h)
| order by timestamp asc
| render timechart
// Alert: Azure Monitor > Alerts > New alert rule > Custom log search with this query (5-minute bins), threshold failures > 20, action group = email the TPO dev team.`,
    },
    {
      task: 'Change the CI/CD workflow so that it deploys a Docker image instead of a zip: build and push to GitHub Container Registry (ghcr.io), then point the web app (Web App for Containers) to the new tag.',
      hint: 'docker/login-action, docker/build-push-action, then azure/webapps-deploy with images:.',
      solution: `      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: src/Placement.Api/Dockerfile
          push: true
          tags: ghcr.io/gcoe-tpo/placement-api:\${{ github.sha }}
      - uses: azure/webapps-deploy@v3
        with:
          app-name: placement-api-gcoe
          slot-name: staging
          images: ghcr.io/gcoe-tpo/placement-api:\${{ github.sha }}
# job permissions also need: packages: write`,
    },
    {
      task: 'List what you would check if the production API returns 500 errors right after a slot swap.',
      hint: 'Think about settings, identity, database, logs, and rollback.',
      solution: `1. Swap back immediately (instant rollback) to restore service.
2. Application Insights > Failures: exception type and message, operation_Id.
3. az webapp log tail / Log stream: startup errors (missing config key, Key Vault 403).
4. Slot settings: did a staging-only setting move, or was a needed sticky setting missing?
5. Managed Identity of the production slot: slots have their own identity, so it needs Key Vault and SQL access too.
6. Database: were migrations applied before the swap?
7. Fix, deploy to staging, smoke test, swap again.`,
    },
  ],
  quiz: [
    {
      question: 'Which Azure feature lets you deploy to a staging copy of your web app and switch it to production with near-zero downtime?',
      options: ['Resource groups', 'Deployment slots with swap', 'Blob lifecycle rules', 'Azure SQL elastic pools'],
      answer: 1,
      explanation: 'Slots plus a swap warm up the new version and then switch routing. Swapping again rolls back.',
    },
    {
      question: 'Your Key Vault secret is named "Jwt--Key". Which configuration key does AddAzureKeyVault give the .NET app?',
      options: ['Jwt--Key', 'Jwt__Key', 'Jwt:Key', 'JwtKey'],
      answer: 2,
      explanation: 'The Key Vault configuration provider replaces "--" with ":" because ":" is not allowed in secret names.',
    },
    {
      question: 'Which credential type lets the same code use your az login locally and the Managed Identity in Azure?',
      options: ['DefaultAzureCredential', 'StorageSharedKeyCredential', 'A hard-coded connection string', 'BasicAuthCredential'],
      answer: 0,
      explanation: 'DefaultAzureCredential tries several sources in order, including Managed Identity and developer tool logins.',
    },
    {
      question: 'In a GitHub Actions workflow that logs in to Azure with OIDC, which permission is required?',
      options: ['contents: write', 'packages: write', 'actions: write', 'id-token: write'],
      answer: 3,
      explanation: 'id-token: write allows the job to request the OIDC token that azure/login exchanges for an Azure access token.',
    },
    {
      question: 'What is the cleanest way to stop paying for a whole practice environment (web app, SQL, vault, storage)?',
      options: ['Stop the web app only', 'Delete the resource group that contains them', 'Remove the GitHub workflow', 'Lower the log level'],
      answer: 1,
      explanation: 'A stopped app still pays for its plan, and SQL and storage keep billing. Deleting the resource group removes every resource in it.',
    },
  ],
};
