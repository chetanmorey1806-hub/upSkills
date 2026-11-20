export default {
  lesson: 'day-29-azure-dotnet-github-actions',
  minutes: 25,
  intro: 'Practise Azure App Service, Key Vault with Managed Identity, Application Insights KQL, deployment slots and a GitHub Actions OIDC pipeline.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'On placement-result day the API needs to handle 3x traffic for a few hours. The code is stateless. What is the best quick action on App Service?',
      options: ['Scale up from S1 to P3v3 permanently', 'Scale out the plan from 1 to 3 instances (or add an autoscale rule)', 'Create a new resource group', 'Restart the web app every 10 minutes'],
      answer: 1,
      explain: 'Scale OUT adds instances behind the built-in load balancer and can be reversed or automated with autoscale rules. Scaling UP to a much bigger tier permanently costs more. Restarting does not add capacity.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The app reads `builder.Configuration["Jwt:Key"]`. What must the **Key Vault secret name** be so that `AddAzureKeyVault` maps to that key?',
      example: { title: 'Mapping rule', code: `Key Vault secret "Email--SmtpPassword"  ->  configuration "Email:SmtpPassword"` },
      accept: ['Jwt--Key'],
      explain: 'Key Vault secret names cannot contain ":" (or "__"), so the configuration provider turns "--" into ":". Naming the secret "Jwt:Key" is impossible, and "Jwt__Key" would not be mapped by the Key Vault provider.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the workflow permission needed for passwordless (OIDC) login with azure/login@v2:
\`\`\`
permissions:
  id-token: ______
  contents: read
\`\`\``,
      example: { title: 'Login step', code: `- uses: azure/login@v2
  with:
    client-id: \${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: \${{ secrets.AZURE_TENANT_ID }}
    subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}` },
      accept: ['write'],
      explain: 'The job must be allowed to request a GitHub OIDC token (`id-token: write`). Azure trusts that token through the federated credential, so no client secret is stored in GitHub. Without this permission, azure/login fails with "Unable to get ACTIONS_ID_TOKEN_REQUEST_URL".',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about Managed Identity and DefaultAzureCredential are TRUE? Select all that apply.',
      options: [
        'With a Managed Identity, the App Service gets Azure tokens without storing any password',
        'The identity still needs a role, such as "Key Vault Secrets User", to read secrets',
        'DefaultAzureCredential uses the Managed Identity in Azure and your az login / Visual Studio account locally',
        'Managed Identity works only for Key Vault, not for Azure SQL or Blob Storage',
        'You must copy the identity\'s client secret into appsettings.json',
      ],
      answers: [0, 1, 2],
      explain: 'Managed Identities have no secret to copy, because Azure handles the credentials. Access is still controlled by role assignments (or CREATE USER ... FROM EXTERNAL PROVIDER for Azure SQL). The same identity works for Key Vault, SQL, Storage, Service Bus and more. Forgetting the role assignment gives a 403 at startup.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The `requests` table contains the rows shown. What does the KQL query return? Write each result row as `name,failures`, one per line, in result order.',
      example: { title: 'KQL reading tip', text: 'Read top to bottom: filter rows (where), group and count (summarize ... by), then sort (order by).' },
      code: `// requests
// name           resultCode  success
// GET Students   200         true
// POST Apply     500         false
// GET Students   500         false
// POST Apply     500         false
// POST Login     401         false
// GET Drives     200         true

requests
| where success == false
| summarize failures = count() by name
| order by failures desc, name asc`,
      expected: `POST Apply,2
GET Students,1
POST Login,1`,
      explain: 'Four rows have success == false: POST Apply (twice), GET Students and POST Login. After grouping, POST Apply has 2 failures. The two rows with 1 failure are sorted by name ascending, so "GET Students" comes before "POST Login". GET Drives has no failures, so it is filtered out before summarize.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Before a swap: **production** runs v1 with `ConnectionStrings:PlacementDb = ProdDb` (slot setting) and `Feature = Old` (normal setting). **staging** runs v2 with `PlacementDb = StagingDb` (slot setting) and `Feature = New` (normal setting). After `az webapp deployment slot swap --slot staging --target-slot production`, write three lines for PRODUCTION: the code version, the database, the Feature value.',
      example: { title: 'Swap rule', text: 'Code and normal app settings move with the swap. Settings marked as slot settings (sticky) stay with their slot.' },
      code: `az webapp deployment slot swap --name placement-api-gcoe --resource-group rg-placement-dev --slot staging --target-slot production`,
      expected: `v2
ProdDb
New`,
      explain: 'The new code (v2) moves into production, and so does its normal setting Feature = New. The connection string is a sticky slot setting, so production keeps ProdDb, which is exactly why environment-specific values are marked sticky. Swapping again puts v1 back in production (rollback).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A resume upload feature saves PDFs to the `wwwroot/uploads` folder of the App Service. With 3 instances, students sometimes cannot download their resume. What is the right fix?',
      options: ['Use only 1 instance forever', 'Store the files in Azure Blob Storage and give short-lived SAS links', 'Save the files in appsettings.json', 'Increase the HTTP timeout'],
      answer: 1,
      explain: 'Each instance has its own local disk, and instances can be replaced at any time, so local files are inconsistent and can be lost. Blob Storage is shared, durable and cheap. A private container plus a time-limited SAS link keeps resumes secure.',
    },
  ],
};
