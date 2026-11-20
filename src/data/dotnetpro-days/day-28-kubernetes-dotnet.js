const clusterCode = `# ===== Install the tools (Windows: winget, macOS: brew, Linux: see docs) =====
winget install Kubernetes.kubectl
winget install Kubernetes.minikube          # OR: winget install Kubernetes.kind

# ===== Option A: minikube =====
minikube start --driver=docker --cpus=4 --memory=6g
minikube addons enable metrics-server        # needed for kubectl top and autoscaling
minikube addons enable ingress
kubectl get nodes

# ===== Option B: kind (Kubernetes IN Docker) =====
kind create cluster --name placement
kubectl cluster-info --context kind-placement

# ===== Get your local image INTO the cluster (no registry needed) =====
docker build -t placement-api:1.0 -f src/Placement.Api/Dockerfile .
minikube image load placement-api:1.0                 # minikube
kind load docker-image placement-api:1.0 --name placement   # kind

# ===== First look: a single Pod from the command line =====
kubectl run hello --image=nginx:1.27 --port=80
kubectl get pods -o wide
kubectl describe pod hello                  # events at the bottom: Scheduled, Pulling, Started
kubectl logs hello
kubectl delete pod hello                    # a bare pod is NOT recreated - that is why we use Deployments`;

const configCode = `# ===== k8s/00-namespace.yaml =====
apiVersion: v1
kind: Namespace
metadata:
  name: placement
---
# ===== k8s/01-configmap.yaml  (non-secret settings -> env variables) =====
apiVersion: v1
kind: ConfigMap
metadata:
  name: placement-api-config
  namespace: placement
data:
  ASPNETCORE_ENVIRONMENT: "Staging"
  ConnectionStrings__Redis: "redis:6379"
  Cors__AllowedOrigins__0: "http://placement.local"
  Logging__LogLevel__Default: "Information"
  Features__EnableResumeUpload: "true"
---
# ===== k8s/02-secret.yaml  (values are base64-ENCODED, not encrypted!) =====
apiVersion: v1
kind: Secret
metadata:
  name: placement-api-secrets
  namespace: placement
type: Opaque
data:
  SA_PASSWORD: UGxhY2VtZW50QDIwMjY=           # echo -n 'Placement@2026' | base64
stringData:                                   # plain text here, K8s encodes it for you
  ConnectionStrings__PlacementDb: "Server=sqlserver,1433;Database=PlacementDb;User Id=sa;Password=Placement@2026;TrustServerCertificate=True"
  Jwt__Key: "change-me-to-a-32-plus-character-random-secret"

# ===== Same objects from the command line (handy, and keeps secrets out of Git) =====
kubectl create namespace placement
kubectl create configmap placement-api-config -n placement \\
  --from-literal=ASPNETCORE_ENVIRONMENT=Staging \\
  --from-literal=ConnectionStrings__Redis=redis:6379
kubectl create secret generic placement-api-secrets -n placement \\
  --from-literal=Jwt__Key='change-me-to-a-32-plus-character-random-secret' \\
  --from-literal=SA_PASSWORD='Placement@2026'

kubectl get configmap placement-api-config -n placement -o yaml
kubectl get secret placement-api-secrets -n placement -o jsonpath="{.data.SA_PASSWORD}"   # UGxhY2VtZW50QDIwMjY=
# decode (bash): ... | base64 -d   -> Placement@2026   (anyone with read access can do this -> use RBAC)`;

const deployCode = `# ===== k8s/10-api-deployment.yaml =====
apiVersion: apps/v1
kind: Deployment
metadata:
  name: placement-api
  namespace: placement
  labels:
    app: placement-api
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: placement-api               # must match the pod template labels
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                      # at most 3 + 1 = 4 pods during an update
      maxUnavailable: 0                # never go below 3 ready pods
  template:
    metadata:
      labels:
        app: placement-api
        version: "1.0"
    spec:
      containers:
        - name: api
          image: placement-api:1.0
          imagePullPolicy: IfNotPresent      # use the image loaded into minikube/kind
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: placement-api-config   # every key becomes an env variable
            - secretRef:
                name: placement-api-secrets
          env:
            - name: POD_NAME                 # downward API: show which pod answered
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          resources:
            requests:                        # used by the scheduler (guaranteed)
              cpu: "100m"
              memory: "128Mi"
            limits:                          # hard cap: above memory limit -> OOMKilled
              cpu: "500m"
              memory: "256Mi"
          startupProbe:                      # gives slow starts (EF migrations, warm-up) time
            httpGet: { path: /health/live, port: 8080 }
            periodSeconds: 5
            failureThreshold: 24             # up to 2 minutes
          livenessProbe:                     # fails -> kubelet RESTARTS the container
            httpGet: { path: /health/live, port: 8080 }
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
          readinessProbe:                    # fails -> pod removed from Service endpoints (no traffic)
            httpGet: { path: /health/ready, port: 8080 }
            periodSeconds: 5
            failureThreshold: 2
---
# ===== k8s/11-api-service.yaml =====
apiVersion: v1
kind: Service
metadata:
  name: placement-api
  namespace: placement
spec:
  type: NodePort                       # ClusterIP (default, internal only) | NodePort | LoadBalancer
  selector:
    app: placement-api                 # sends traffic to READY pods with this label
  ports:
    - name: http
      port: 80                         # service port (inside the cluster: http://placement-api)
      targetPort: 8080                 # container port
      nodePort: 30080                  # node port range 30000-32767
---
# ===== k8s/20-redis.yaml =====
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: placement
spec:
  replicas: 1
  selector:
    matchLabels: { app: redis }
  template:
    metadata:
      labels: { app: redis }
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports: [ { containerPort: 6379 } ]
          readinessProbe:
            exec: { command: ["redis-cli", "ping"] }
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: redis                          # DNS name used in ConnectionStrings__Redis=redis:6379
  namespace: placement
spec:
  selector: { app: redis }
  ports: [ { port: 6379, targetPort: 6379 } ]
---
# ===== k8s/30-sqlserver.yaml (StatefulSet + persistent volume) =====
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sqlserver
  namespace: placement
spec:
  serviceName: sqlserver
  replicas: 1
  selector:
    matchLabels: { app: sqlserver }
  template:
    metadata:
      labels: { app: sqlserver }
    spec:
      securityContext:
        fsGroup: 10001                 # mssql user can write to the volume
      containers:
        - name: mssql
          image: mcr.microsoft.com/mssql/server:2022-latest
          ports: [ { containerPort: 1433 } ]
          env:
            - name: ACCEPT_EULA
              value: "Y"
            - name: MSSQL_SA_PASSWORD
              valueFrom:
                secretKeyRef: { name: placement-api-secrets, key: SA_PASSWORD }
          resources:
            requests: { memory: "2Gi", cpu: "500m" }
          volumeMounts:
            - name: mssqldata
              mountPath: /var/opt/mssql
  volumeClaimTemplates:                # one PersistentVolumeClaim per replica, survives pod restarts
    - metadata:
        name: mssqldata
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: sqlserver
  namespace: placement
spec:
  selector: { app: sqlserver }
  ports: [ { port: 1433, targetPort: 1433 } ]

# ===== Apply everything (the folder, in file-name order) =====
kubectl apply -f k8s/
kubectl get all -n placement
kubectl get endpoints placement-api -n placement     # IPs of READY pods behind the service
minikube service placement-api -n placement --url     # minikube: prints a reachable URL
kubectl port-forward svc/placement-api 5080:80 -n placement   # works on kind, minikube, AKS`;

const scaleCode = `# ===== Scaling =====
kubectl scale deployment placement-api --replicas=5 -n placement
kubectl get pods -n placement -l app=placement-api

# Horizontal Pod Autoscaler: keep average CPU near 70% of the request, 2..10 pods
kubectl autoscale deployment placement-api --cpu-percent=70 --min=2 --max=10 -n placement
kubectl get hpa -n placement
kubectl top pods -n placement                          # needs metrics-server

# ===== k8s/12-api-hpa.yaml (same thing, declarative) =====
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: placement-api
  namespace: placement
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: placement-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

# ===== Rolling update to version 1.1 =====
docker build -t placement-api:1.1 -f src/Placement.Api/Dockerfile .
minikube image load placement-api:1.1          # or: kind load docker-image placement-api:1.1 --name placement

kubectl set image deployment/placement-api api=placement-api:1.1 -n placement
kubectl annotate deployment/placement-api kubernetes.io/change-cause="v1.1 resume upload" -n placement
kubectl rollout status deployment/placement-api -n placement
kubectl rollout history deployment/placement-api -n placement
kubectl get rs -n placement                    # old ReplicaSet scaled to 0, new one to 3

# ===== Something is wrong in 1.1 -> roll back =====
kubectl rollout undo deployment/placement-api -n placement
kubectl rollout undo deployment/placement-api --to-revision=1 -n placement
kubectl rollout pause deployment/placement-api -n placement     # pause / resume a rollout
kubectl rollout restart deployment/placement-api -n placement   # re-create pods (e.g. after a ConfigMap change)`;

const debugCode = `# ===== kubectl cheat sheet for .NET developers =====
kubectl config get-contexts                     # which cluster am I talking to?
kubectl config set-context --current --namespace=placement   # stop typing -n placement

kubectl get pods -o wide                        # node + pod IP
kubectl get pods -w                             # watch changes live
kubectl describe pod <pod>                      # Events: probe failures, OOMKilled, image pull errors
kubectl logs <pod>                              # stdout of the .NET app
kubectl logs <pod> --previous                   # logs of the CRASHED container (before restart)
kubectl logs -l app=placement-api --tail=50     # logs from all API pods
kubectl exec -it <pod> -- bash                  # shell inside the container
kubectl exec <pod> -- printenv | grep ConnectionStrings
kubectl port-forward pod/<pod> 5080:8080
kubectl get events --sort-by=.lastTimestamp
kubectl delete pod <pod>                        # the Deployment creates a new one at once
kubectl diff -f k8s/                            # what would change if I apply?

# ===== Common pod states and what they mean =====
# Pending            -> no node has enough CPU/memory for the requests, or the PVC is not bound
# ImagePullBackOff   -> wrong image name/tag, private registry without imagePullSecrets,
#                       or (minikube/kind) the image was not loaded and pull policy is Always
# CrashLoopBackOff   -> the app starts and exits: bad connection string, missing env var, exception in Program.cs
# Running 0/1 READY  -> readiness probe failing (e.g. /health/ready returns 503 because SQL is down)
# OOMKilled          -> memory limit too small (raise it or fix the leak)`;

export default {
  id: 'day-28-kubernetes-dotnet',
  title: 'Kubernetes Basics for .NET: Pods, Deployments, Services, ConfigMaps, Secrets, Scaling and Probes',
  module: 'Module 7: DevOps & Cloud for .NET',
  day: 28,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Run the Placement API on Kubernetes. You will learn the core objects (Pod, ReplicaSet, Deployment, Service, ConfigMap, Secret), write real YAML manifests, and deploy an ASP.NET Core API with Redis and SQL Server to a local minikube or kind cluster. Then you will scale it manually and automatically, do zero-downtime rolling updates and rollbacks, and use startup, liveness and readiness probes.',
  objectives: [
    'Explain the Kubernetes architecture (control plane, nodes, kubelet) and the core objects',
    'Write Deployment, Service, ConfigMap and Secret manifests for an ASP.NET Core API',
    'Deploy to minikube or kind, expose the API and debug pods with kubectl',
    'Scale with kubectl scale and an HPA, perform rolling updates and roll back',
    'Configure startup, liveness and readiness probes plus resource requests/limits correctly',
  ],
  theory: [
    {
      heading: 'Why Kubernetes and how it is built',
      content:
        'Docker compose runs containers on ONE machine. Real systems need many machines, automatic restarts, zero-downtime releases and scaling when 5,000 students log in on result day. Kubernetes (K8s) is a container orchestrator. You describe the desired state in YAML ("3 copies of placement-api:1.1, each with 256 MB"), and Kubernetes keeps working to make the actual state match it. If a pod or node dies, it creates a replacement. Azure Kubernetes Service (AKS), Amazon EKS and Google GKE are managed versions. minikube and kind give you a cluster on your laptop.',
      points: [
        'Control plane: API server (kubectl talks to it), etcd (stores all state), scheduler (picks a node for each pod), controller manager (reconcile loops)',
        'Worker node: kubelet (starts containers and runs probes), container runtime (containerd), kube-proxy (Service networking)',
        'Declarative: kubectl apply -f file.yaml. Store the YAML in Git and apply it from CI/CD (GitOps tools: Argo CD, Flux)',
        'Every object has apiVersion, kind, metadata (name, namespace, labels) and spec (desired state)',
        'Namespaces split one cluster into logical areas: placement-dev, placement-qa, kube-system',
      ],
    },
    {
      heading: 'Pods, ReplicaSets and Deployments',
      content:
        'A Pod is the smallest unit Kubernetes runs. It holds one or more containers that share an IP address and volumes. Usually it is one .NET app container, sometimes with a sidecar such as a log shipper. Pods are temporary: when one dies it is not repaired but replaced by a new pod with a new IP. A ReplicaSet keeps N identical pods running. A Deployment manages ReplicaSets and adds rolling updates and rollback history. In practice you write Deployments, never bare pods or ReplicaSets. When you change the image, the Deployment creates a NEW ReplicaSet and slowly moves pods from the old one to the new one.',
      points: [
        'Labels (app: placement-api) are key/value tags. Selectors find objects by label. This is how Deployments and Services find their pods',
        'spec.selector.matchLabels must match spec.template.metadata.labels',
        'Deleting a pod managed by a Deployment simply gives you a fresh pod, which is "self-healing"',
        'Use a StatefulSet for databases (stable names sqlserver-0 and their own persistent volumes). Use a DaemonSet for one pod per node (log agents). Use a Job or CronJob for batch work such as a nightly report',
        'In production, managed databases (Azure SQL, Azure Cache for Redis) are often preferred over running them inside the cluster',
      ],
    },
    {
      heading: 'Services: stable networking for changing pods',
      content:
        'Pod IPs change every time a pod is recreated, so clients cannot use them. A Service gives a stable virtual IP and DNS name (placement-api, or placement-api.placement.svc.cluster.local). It load-balances across all READY pods whose labels match its selector. port is what clients call, and targetPort is the container port (8080 for .NET 8+). Inside the cluster the API reaches Redis at redis:6379 through the redis Service, just like service names in compose.',
      points: [
        'ClusterIP (default): reachable only inside the cluster. Used for databases, Redis and internal APIs',
        'NodePort: opens a port 30000-32767 on every node. Good for local testing',
        'LoadBalancer: the cloud creates a public load balancer (AKS gives a public IP)',
        'Ingress: one entry point that routes by host and path (/api -> api service, / -> angular service) with TLS. It needs an ingress controller (NGINX, Application Gateway)',
        'kubectl get endpoints <svc> lists the pod IPs currently receiving traffic. An empty list means no READY pods or wrong labels',
      ],
    },
    {
      heading: 'ConfigMaps and Secrets for ASP.NET Core configuration',
      content:
        'Do not build one image per environment. Build once, and inject configuration at deploy time. A ConfigMap holds non-secret key/value settings. A Secret holds sensitive values. Both can become environment variables (envFrom or env with valueFrom) or files mounted into the container. ASP.NET Core reads environment variables automatically, so the same double underscore convention from Day 27 works: ConnectionStrings__PlacementDb. Secrets are only base64-ENCODED, not encrypted. Anyone with read access can decode them, so protect them with RBAC and encryption at rest, or use an external store (Azure Key Vault with the CSI Secrets Store driver).',
      points: [
        'kubectl create configmap / create secret generic --from-literal=KEY=value --from-file=appsettings.json',
        'data: needs base64 values. stringData: accepts plain text and K8s encodes it',
        'Env variables from a ConfigMap are read only at container start, so run kubectl rollout restart after changing it. Mounted files update automatically',
        'Never commit real Secret YAML to Git. Use sealed-secrets, SOPS, Key Vault, or create them in the pipeline',
      ],
      syntax: `envFrom:
  - configMapRef: { name: placement-api-config }
  - secretRef:    { name: placement-api-secrets }`,
    },
    {
      heading: 'Probes, resources and rolling updates',
      content:
        'The kubelet checks every container with probes. A startupProbe gives slow-starting apps (EF migrations, cache warm-up) time before the other probes begin. A livenessProbe checks if the app is stuck: on failure, the container is RESTARTED. A readinessProbe checks if the app can serve traffic: on failure, the pod is removed from the Service but not restarted. Never put database checks in the liveness probe. If SQL is down, restarting every API pod makes things worse. Resource requests tell the scheduler how much CPU/memory to reserve. Limits are hard caps: going over the CPU limit slows the container down (throttling), and going over the memory limit kills it (OOMKilled). Rolling updates replace pods gradually: maxSurge is how many EXTRA pods may exist, and maxUnavailable is how many may be missing. Readiness probes make sure a new pod gets traffic only when it is really ready, which is what gives zero downtime.',
      points: [
        'CPU is measured in millicores: 500m = half a core. Memory uses Mi/Gi',
        'Default strategy is RollingUpdate with maxSurge 25% (rounded up) and maxUnavailable 25% (rounded down)',
        'kubectl rollout status / history / undo / pause / resume / restart',
        'The other strategy, Recreate, kills all old pods first (causes downtime). It is used when two versions cannot run together',
        'ASP.NET Core handles SIGTERM gracefully and finishes in-flight requests. terminationGracePeriodSeconds defaults to 30',
      ],
    },
    {
      heading: 'Scaling: manual and automatic',
      content:
        'kubectl scale deployment placement-api --replicas=5 changes the replica count at once. The Horizontal Pod Autoscaler (HPA) does it automatically from metrics. With averageUtilization: 70, it adds pods when average CPU goes above 70% of the CPU REQUEST and removes them when load drops, within minReplicas..maxReplicas. HPA needs metrics-server and resource requests on the pods. Because .NET APIs should be stateless (sessions in Redis, files in Blob Storage, no in-memory state that matters), any pod can serve any request and scaling out just works. The Cluster Autoscaler (on AKS) adds nodes when pods stay Pending.',
      points: [
        'HPA formula: desired = ceil(current x currentMetric / target). For example 3 pods at 140% CPU with a 70% target gives ceil(3 x 140 / 70) = 6',
        'If you use an HPA, do not also hard-code replicas in later kubectl apply runs, or the two will fight',
        'KEDA scales on queue length (RabbitMQ, Azure Service Bus), which is great for the email worker',
      ],
    },
  ],
  examples: [
    {
      title: 'Create a local cluster and load the .NET image',
      scenario:
        'Before touching AKS, the team practises on a laptop. Start minikube (or kind), load the placement-api image built on Day 27 and see why a bare pod is not enough.',
      steps: [
        'Install kubectl and minikube (or kind) and make sure Docker Desktop is running',
        'minikube start --driver=docker --cpus=4 --memory=6g',
        'Build the image and load it into the cluster with minikube image load (or kind load docker-image)',
        'Run a test nginx pod, describe it, delete it and notice that it is gone for good',
      ],
      code: clusterCode,
      result: `PS> minikube start --driver=docker --cpus=4 --memory=6g
* minikube v1.34.0 on Microsoft Windows 11
* Using the docker driver based on user configuration
* Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default

PS> kubectl get nodes
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   52s   v1.31.0

PS> kubectl get pods -o wide
NAME    READY   STATUS    RESTARTS   AGE   IP           NODE
hello   1/1     Running   0          12s   10.244.0.5   minikube

PS> kubectl delete pod hello
pod "hello" deleted
PS> kubectl get pods
No resources found in default namespace.`,
      explanation:
        'minikube runs a one-node cluster inside Docker. Images built with your local Docker are not automatically visible to the cluster, so minikube image load or kind load docker-image copies them in. A pod created with kubectl run has no controller watching it, so after deletion nothing brings it back. Deployments fix that. Your versions, ages and IPs will differ.',
    },
    {
      title: 'ConfigMap and Secret for the API settings',
      scenario:
        'The API needs the environment name, Redis address and CORS origin (not secret), plus the SQL connection string and JWT key (secret). Store them in the cluster, not in the image.',
      steps: [
        'Create the k8s folder and the files 00-namespace.yaml, 01-configmap.yaml and 02-secret.yaml',
        'kubectl apply -f k8s/00-namespace.yaml -f k8s/01-configmap.yaml -f k8s/02-secret.yaml',
        'Or create them with the kubectl create commands shown (better for secrets)',
        'Read the secret back and decode it to see that base64 is not encryption',
      ],
      code: configCode,
      result: `PS> kubectl apply -f k8s/00-namespace.yaml -f k8s/01-configmap.yaml -f k8s/02-secret.yaml
namespace/placement created
configmap/placement-api-config created
secret/placement-api-secrets created

PS> kubectl get configmap,secret -n placement
NAME                             DATA   AGE
configmap/kube-root-ca.crt       1      9s
configmap/placement-api-config   5      9s

NAME                           TYPE     DATA   AGE
secret/placement-api-secrets   Opaque   3      9s

PS> kubectl get secret placement-api-secrets -n placement -o jsonpath="{.data.SA_PASSWORD}"
UGxhY2VtZW50QDIwMjY=`,
      explanation:
        'The ConfigMap has 5 keys and the Secret has 3: SA_PASSWORD from data plus 2 from stringData, merged. Each key name is already in ASP.NET Core\'s environment variable format, so envFrom turns them straight into configuration. UGxhY2VtZW50QDIwMjY= decodes to Placement@2026, which shows why secret YAML must not go into Git and why access must be limited with RBAC.',
    },
    {
      title: 'Deploy the API, Redis and SQL Server with probes and Services',
      scenario:
        'Deploy 3 replicas of the Placement API with health probes and resource limits, Redis as an internal service and SQL Server as a StatefulSet with a persistent volume. Then call the API from your browser.',
      steps: [
        'Make sure the API has /health/live and /health/ready (Day 27) and the image is loaded',
        'Save the manifests into k8s/10-api-deployment.yaml, 11-api-service.yaml, 20-redis.yaml and 30-sqlserver.yaml',
        'kubectl apply -f k8s/ and then kubectl get all -n placement',
        'Wait until all pods are READY 1/1 (SQL Server takes the longest, and the API readiness waits for it)',
        'Open the URL from minikube service ... --url, or use kubectl port-forward and open http://localhost:5080/swagger',
      ],
      code: deployCode,
      result: `PS> kubectl apply -f k8s/
namespace/placement unchanged
configmap/placement-api-config unchanged
secret/placement-api-secrets configured
deployment.apps/placement-api created
service/placement-api created
deployment.apps/redis created
service/redis created
statefulset.apps/sqlserver created
service/sqlserver created

PS> kubectl get pods -n placement
NAME                             READY   STATUS    RESTARTS   AGE
placement-api-7c9d5b8f6d-4kq2x   1/1     Running   0          70s
placement-api-7c9d5b8f6d-9tz7m   1/1     Running   0          70s
placement-api-7c9d5b8f6d-wx5pl   1/1     Running   0          70s
redis-6b7f9c7d5-jq8rv            1/1     Running   0          70s
sqlserver-0                      1/1     Running   0          70s

PS> kubectl get endpoints placement-api -n placement
NAME            ENDPOINTS                                            AGE
placement-api   10.244.0.12:8080,10.244.0.13:8080,10.244.0.14:8080   70s

PS> kubectl port-forward svc/placement-api 5080:80 -n placement
Forwarding from 127.0.0.1:5080 -> 8080`,
      explanation:
        'Pod names are <deployment>-<replicaset hash>-<random>. The StatefulSet pod has the stable name sqlserver-0 and its own PersistentVolumeClaim. Until SQL Server is up, the API pods are Running but 0/1 READY, because /health/ready fails, so the Service has no endpoints and sends no traffic. Once ready, all three pod IPs appear behind the Service. Inside the cluster the API reaches its dependencies through the redis and sqlserver Services by DNS name. Your hashes and IPs will differ.',
    },
    {
      title: 'Scale, autoscale, rolling update and rollback',
      scenario:
        'It is placement-result day: traffic triples. Scale the API, add an autoscaler, then ship version 1.1 with zero downtime. When the officer reports a bug, roll back in seconds.',
      steps: [
        'kubectl scale to 5 replicas and watch the new pods appear',
        'Create the HPA (minikube addons enable metrics-server first)',
        'Build and load placement-api:1.1, then run kubectl set image',
        'Watch kubectl rollout status, then kubectl get rs to see the two ReplicaSets',
        'kubectl rollout undo and check the image again with kubectl describe deployment',
      ],
      code: scaleCode,
      result: `PS> kubectl scale deployment placement-api --replicas=5 -n placement
deployment.apps/placement-api scaled

PS> kubectl get hpa -n placement
NAME            REFERENCE                  TARGETS        MINPODS   MAXPODS   REPLICAS
placement-api   Deployment/placement-api   cpu: 12%/70%   2         10        5

PS> kubectl set image deployment/placement-api api=placement-api:1.1 -n placement
deployment.apps/placement-api image updated
PS> kubectl rollout status deployment/placement-api -n placement
Waiting for deployment "placement-api" rollout to finish: 1 out of 5 new replicas have been updated...
Waiting for deployment "placement-api" rollout to finish: 3 out of 5 new replicas have been updated...
deployment "placement-api" successfully rolled out

PS> kubectl get rs -n placement -l app=placement-api
NAME                       DESIRED   CURRENT   READY
placement-api-7c9d5b8f6d   0         0         0       (v1.0)
placement-api-5f6b8d9c47   5         5         5       (v1.1)

PS> kubectl rollout undo deployment/placement-api -n placement
deployment.apps/placement-api rolled back`,
      explanation:
        'The Deployment kept the old ReplicaSet (scaled to 0), which is why a rollback is instant: it just scales the old ReplicaSet up again. With maxSurge 1 and maxUnavailable 0, Kubernetes adds one new pod, waits until its readiness probe passes, removes one old pod, and repeats, so capacity never drops. Because the HPA has a minimum of 2, it will scale down from 5 if CPU stays low.',
    },
    {
      title: 'Debugging a broken deployment with kubectl',
      scenario:
        'A teammate deployed version 1.2 and the pods show CrashLoopBackOff. Find the cause using only kubectl.',
      steps: [
        'kubectl get pods to see the STATUS and RESTARTS columns',
        'kubectl describe pod <pod> and read the Events and Last State',
        'kubectl logs <pod> --previous to read the .NET exception from the crashed container',
        'Fix the ConfigMap/Secret, then kubectl rollout restart deployment/placement-api',
      ],
      code: debugCode,
      result: `PS> kubectl get pods -n placement
NAME                             READY   STATUS             RESTARTS      AGE
placement-api-6d8c7f9b5c-r2m4n   0/1     CrashLoopBackOff   4 (21s ago)   2m

PS> kubectl logs placement-api-6d8c7f9b5c-r2m4n --previous -n placement
Unhandled exception. System.ArgumentNullException: Value cannot be null. (Parameter 'connectionString')
   at Program.<Main>$(String[] args) in /src/src/Placement.Api/Program.cs:line 14

Cause: the new Secret used the key ConnectionStrings_PlacementDb (single underscore)
Fix:   kubectl edit secret placement-api-secrets -n placement   (or re-create it)
       kubectl rollout restart deployment/placement-api -n placement`,
      explanation:
        'CrashLoopBackOff means the container keeps exiting and Kubernetes waits longer and longer before each restart. The current container has no useful logs yet, so --previous shows the output of the one that crashed. A single underscore does not map to the ":" separator, so GetConnectionString("PlacementDb") returned null. Env variables are read only at start, so a restart is needed after fixing the Secret.',
    },
  ],
  interview: [
    { q: 'What is a Pod?', a: 'The smallest deployable unit in Kubernetes. It holds one or more containers that share a network namespace (one IP) and volumes, and is scheduled together on one node. Pods are temporary and are replaced, not repaired.', level: 'Easy' },
    { q: 'Deployment vs ReplicaSet vs Pod?', a: 'A Pod runs containers. A ReplicaSet keeps N identical pods alive. A Deployment manages ReplicaSets and adds declarative rolling updates, history and rollback. You normally create only Deployments.', level: 'Easy' },
    { q: 'Why do we need a Service if pods already have IPs?', a: 'Pod IPs change whenever pods are recreated or scaled. A Service provides a stable IP and DNS name and load-balances across the current ready pods selected by labels.', level: 'Easy' },
    { q: 'ClusterIP vs NodePort vs LoadBalancer vs Ingress?', a: 'ClusterIP is internal-only (the default). NodePort opens a port (30000-32767) on every node. LoadBalancer asks the cloud for an external load balancer and IP. Ingress is an HTTP(S) router that sends several hosts and paths to different Services through one entry point, with TLS. It needs an ingress controller.', level: 'Medium' },
    { q: 'ConfigMap vs Secret?', a: 'Both store key/value config that can be injected as env variables or files. ConfigMaps are for non-sensitive data. Secrets are for sensitive data and are base64-encoded, can be encrypted at rest, and get stricter RBAC. Base64 is not encryption.', level: 'Easy' },
    { q: 'How does an ASP.NET Core app read a ConfigMap?', a: 'Map keys to environment variables with envFrom/env, using double underscores for nesting (ConnectionStrings__Redis). The default host builder reads env variables. Or mount the ConfigMap as a file such as appsettings.Production.json, or a folder read with AddKeyPerFile.', level: 'Medium' },
    { q: 'Liveness vs readiness vs startup probe?', a: 'Startup: protects slow-starting apps, and the other probes wait until it passes. Liveness: if it fails, the kubelet restarts the container. Readiness: if it fails, the pod is removed from Service endpoints but not restarted. Do not check external dependencies in liveness.', level: 'Medium' },
    { q: 'What happens if the API exceeds its memory limit? Its CPU limit?', a: 'Memory: the container is killed (OOMKilled) and restarted. CPU: it is throttled (slowed down) but not killed.', level: 'Medium' },
    { q: 'Explain a rolling update with maxSurge and maxUnavailable.', a: 'Kubernetes creates a new ReplicaSet and gradually moves pods to it. maxSurge is how many extra pods above the desired count may exist. maxUnavailable is how many may be unavailable. With replicas 3, maxSurge 1 and maxUnavailable 0, there are at most 4 pods and always 3 ready. Readiness probes make sure new pods get traffic only when they are ready.', level: 'Medium' },
    { q: 'How do you roll back a bad release?', a: 'kubectl rollout undo deployment/<name> (optionally --to-revision=N). The old ReplicaSet is kept (revisionHistoryLimit), so it is scaled up again. Check with kubectl rollout history and rollout status.', level: 'Easy' },
    { q: 'How does the Horizontal Pod Autoscaler decide the number of pods?', a: 'desiredReplicas = ceil(currentReplicas x currentMetric / targetMetric), limited to min/max. CPU utilisation is measured against the pod\'s CPU request, so requests must be set and metrics-server must be installed.', level: 'Hard' },
    { q: 'A pod is stuck in ImagePullBackOff on minikube with a local image. Why?', a: 'The cluster cannot pull the image. It was not loaded into minikube/kind (minikube image load), the tag is wrong, the pull policy is Always (or the tag is :latest, which defaults to Always), or a private registry needs imagePullSecrets.', level: 'Medium' },
    { q: 'How do you debug CrashLoopBackOff?', a: 'kubectl describe pod (events, exit code, OOMKilled), kubectl logs <pod> --previous for the crashed container\'s output, and check env vars and secrets (kubectl exec ... printenv). Common .NET causes are a missing connection string, a bad config key, a failed migration or a port mismatch.', level: 'Medium' },
    { q: 'Why should an API that runs in Kubernetes be stateless?', a: 'Any replica can receive any request, and pods can be killed or rescheduled at any time. State must live outside the pod: sessions and cache in Redis, files in Blob Storage, data in a database. Then scaling and rolling updates work safely.', level: 'Medium' },
    { q: 'Deployment vs StatefulSet?', a: 'A Deployment gives interchangeable pods with random names and shared or no storage, which suits stateless APIs. A StatefulSet gives stable names (sqlserver-0), ordered start and stop, and a PersistentVolumeClaim per replica, which suits databases and brokers.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a Deployment and a ClusterIP Service for the Angular UI image placement-ui:1.0 (nginx on port 80) with 2 replicas and a readiness probe on "/".',
      hint: 'Same shape as the API Deployment. Service port 80 -> targetPort 80, no nodePort.',
      solution: `apiVersion: apps/v1
kind: Deployment
metadata: { name: placement-ui, namespace: placement }
spec:
  replicas: 2
  selector: { matchLabels: { app: placement-ui } }
  template:
    metadata: { labels: { app: placement-ui } }
    spec:
      containers:
        - name: ui
          image: placement-ui:1.0
          ports: [ { containerPort: 80 } ]
          readinessProbe: { httpGet: { path: /, port: 80 }, periodSeconds: 5 }
          resources: { requests: { cpu: 50m, memory: 32Mi }, limits: { memory: 64Mi } }
---
apiVersion: v1
kind: Service
metadata: { name: placement-ui, namespace: placement }
spec:
  selector: { app: placement-ui }
  ports: [ { port: 80, targetPort: 80 } ]`,
    },
    {
      task: 'Create an Ingress so that http://placement.local/ goes to placement-ui and http://placement.local/api goes to placement-api.',
      hint: 'minikube addons enable ingress. Add "127.0.0.1 placement.local" to the hosts file and run minikube tunnel.',
      solution: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: placement
  namespace: placement
spec:
  ingressClassName: nginx
  rules:
    - host: placement.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: placement-api, port: { number: 80 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: placement-ui, port: { number: 80 } } }`,
    },
    {
      task: 'Set replicas to 10 with the default rolling update strategy (25% / 25%). Calculate the maximum total pods and the minimum available pods during an update. Then do the same for maxSurge 2, maxUnavailable 0.',
      hint: 'maxSurge percentage is rounded UP, maxUnavailable is rounded DOWN.',
      solution: `Default: maxSurge = ceil(10 x 0.25) = ceil(2.5) = 3  -> max 13 pods
         maxUnavailable = floor(2.5) = 2           -> min 8 available
maxSurge 2, maxUnavailable 0 -> max 12 pods, min 10 available (slower but no capacity loss)`,
    },
    {
      task: 'Add a CronJob that runs the image placement-jobs:1.0 every day at 06:00 to send "today\'s drives" emails, reusing the same ConfigMap and Secret.',
      hint: 'apiVersion batch/v1, kind CronJob, schedule "0 6 * * *", restartPolicy OnFailure.',
      solution: `apiVersion: batch/v1
kind: CronJob
metadata: { name: drive-reminder, namespace: placement }
spec:
  schedule: "0 6 * * *"
  timeZone: "Asia/Kolkata"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: job
              image: placement-jobs:1.0
              args: ["send-drive-reminders"]
              envFrom:
                - configMapRef: { name: placement-api-config }
                - secretRef: { name: placement-api-secrets }`,
    },
    {
      task: 'Change Logging__LogLevel__Default to Debug in the ConfigMap and make the running API pods pick it up without downtime.',
      hint: 'Env variables are read at container start.',
      solution: `kubectl edit configmap placement-api-config -n placement      # set Debug
kubectl rollout restart deployment/placement-api -n placement   # rolling restart, respects maxUnavailable 0
kubectl rollout status deployment/placement-api -n placement`,
    },
  ],
  quiz: [
    {
      question: 'Which object should you create to run 3 self-healing copies of the ASP.NET Core API with rolling updates?',
      options: ['Pod', 'Service', 'Deployment', 'ConfigMap'],
      answer: 2,
      explanation: 'A Deployment manages ReplicaSets that keep the pods running and supports rolling updates and rollback.',
    },
    {
      question: 'The readiness probe of one API pod fails. What does Kubernetes do?',
      options: ['Restarts the container', 'Deletes the Deployment', 'Removes the pod from the Service endpoints until it is ready again', 'Scales the Deployment to 0'],
      answer: 2,
      explanation: 'Readiness controls traffic. Liveness failures cause restarts.',
    },
    {
      question: 'Which command rolls a Deployment back to the previous version?',
      options: ['kubectl rollout undo deployment/placement-api', 'kubectl delete deployment placement-api', 'kubectl scale deployment placement-api --replicas=0', 'kubectl apply --previous'],
      answer: 0,
      explanation: 'rollout undo scales the previous ReplicaSet up again and the current one down.',
    },
    {
      question: 'How are values under "data:" in a Kubernetes Secret stored?',
      options: ['AES encrypted by kubectl', 'base64-encoded (anyone with read access can decode them)', 'Hashed with SHA-256', 'Plain text'],
      answer: 1,
      explanation: 'Base64 is an encoding, not encryption. Protect secrets with RBAC, encryption at rest or an external vault.',
    },
    {
      question: 'replicas: 4, maxSurge: 1, maxUnavailable: 0. What is the maximum number of pods during a rolling update?',
      options: ['4', '3', '8', '5'],
      answer: 3,
      explanation: 'Up to 1 extra pod above the 4 desired is allowed, so 5. With maxUnavailable 0 there are always 4 ready.',
    },
  ],
};
