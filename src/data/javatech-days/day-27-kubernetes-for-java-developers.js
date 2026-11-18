export default {
  id: 'day-27-kubernetes-for-java-developers',
  title: 'Kubernetes for Java Developers: Deploying Spring Boot on Minikube',
  module: 'Module 7: DevOps, Cloud & Professional Tools',
  day: 27,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Learn the Kubernetes objects a Java developer touches every day — Pod, Deployment, ReplicaSet, Service, ConfigMap, Secret, Ingress — and deploy a Spring Boot + MySQL application on Minikube with kubectl, Actuator liveness/readiness probes, resource limits, rolling updates and scaling.',
  objectives: [
    'Explain Kubernetes architecture (control plane, nodes, kubelet) and why we need orchestration',
    'Write YAML manifests for Deployment, Service, ConfigMap, Secret and Ingress',
    'Use kubectl to apply, inspect, debug (logs, describe, exec, port-forward), scale and roll back',
    'Configure Spring Boot Actuator liveness and readiness probes and graceful shutdown',
    'Deploy a Spring Boot API with MySQL (StatefulSet + PVC) on Minikube and access it via Ingress',
  ],
  theory: [
    {
      heading: '1. Why Kubernetes?',
      content: 'Docker runs containers; Docker Compose runs a few containers on ONE machine. A company like Swiggy runs thousands of containers on hundreds of servers. Who decides which server runs which container? Who restarts a crashed container at 3 AM? Who adds 10 more copies during the IPL final? Kubernetes (K8s) is a container ORCHESTRATOR that does all this automatically. You describe the DESIRED STATE ("I want 3 copies of order-api version 1.4") in YAML, and Kubernetes continuously works to make the ACTUAL state match it. Analogy: Kubernetes is an airport control tower; containers are planes; servers are runways.',
      points: [
        'Self-healing: restarts failed containers, replaces pods on dead nodes',
        'Horizontal scaling: kubectl scale or automatic HPA based on CPU',
        'Rolling updates and rollbacks with zero downtime',
        'Service discovery and load balancing built in',
        'Config and secret management separate from images',
      ],
    },
    {
      heading: '2. Architecture in Simple Words',
      content: 'A Kubernetes CLUSTER has a CONTROL PLANE (the brain) and WORKER NODES (the muscles). Control plane components: kube-apiserver (front door; kubectl talks only to it), etcd (key-value database storing the cluster state), kube-scheduler (chooses a node for each new pod), controller-manager (control loops like "keep 3 replicas"). Each worker node runs kubelet (agent that starts containers via the container runtime such as containerd), kube-proxy (network rules for Services) and your pods.',
      syntax: `kubectl apply -f deploy.yaml
      │
      ▼
 kube-apiserver ──► etcd (stores desired state)
      │
 scheduler picks node-2 ──► kubelet on node-2 pulls image, starts container
      │
 controller watches: desired 3 replicas, actual 2 → creates 1 more pod`,
      points: [
        'Minikube / kind / Docker Desktop Kubernetes = single-node cluster on your laptop',
        'Managed cloud clusters: AWS EKS, Azure AKS, Google GKE (control plane managed by the provider)',
        'Namespaces split one cluster into virtual clusters (dev, qa, team-a)',
      ],
    },
    {
      heading: '3. Pod, ReplicaSet and Deployment',
      content: 'A POD is the smallest deployable unit: one (usually) or more containers sharing the same IP and volumes. Pods are mortal — when one dies, a new pod with a NEW IP replaces it. You almost never create pods directly. A REPLICASET keeps N identical pods running. A DEPLOYMENT manages ReplicaSets and gives rolling updates: when you change the image tag, it creates a new ReplicaSet and gradually moves pods from old to new (maxSurge/maxUnavailable), and it can roll back.',
      points: [
        'Labels (app: order-api) tie everything together; selectors find pods by labels',
        'For databases use a StatefulSet: stable pod names (mysql-0) and a dedicated PersistentVolumeClaim per pod',
        'Jobs/CronJobs run batch tasks (nightly report)',
        'Pod lifecycle: Pending -> ContainerCreating -> Running -> (Succeeded/Failed); CrashLoopBackOff = keeps crashing',
      ],
    },
    {
      heading: '4. Services and Ingress',
      content: 'Since pod IPs change, other apps need a stable address. A SERVICE gives a fixed virtual IP and DNS name (order-api.default.svc.cluster.local, or simply order-api inside the same namespace) and load-balances across all pods matching its selector. Types: ClusterIP (default, internal only), NodePort (opens a port 30000-32767 on every node), LoadBalancer (cloud provider creates an external load balancer). An INGRESS is an HTTP router (layer 7): one external entry point with rules like shop.local/api -> order-api service, shop.local/ -> frontend service. It needs an Ingress Controller such as ingress-nginx.',
      tip: 'Service "port" is what clients call; "targetPort" is the container port. Interviewers ask this often.',
    },
    {
      heading: '5. ConfigMap and Secret',
      content: 'Build ONE image and run it in dev, QA and prod with different settings. A CONFIGMAP stores non-sensitive configuration (SPRING_PROFILES_ACTIVE, DB URL, feature flags). A SECRET stores sensitive data (passwords, API keys) — values are base64 ENCODED (not encrypted!) in YAML; enable encryption at rest and RBAC, or use external managers (Vault, AWS Secrets Manager, Sealed Secrets). Inject both as environment variables (envFrom) or as mounted files. Spring Boot reads env variables by relaxed binding or mounted files with spring.config.import=configtree:/etc/secrets/.',
      syntax: `echo -n 'ShopPass@123' | base64     # U2hvcFBhc3NAMTIz
kubectl create secret generic db-secret --from-literal=password='ShopPass@123'
kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d`,
    },
    {
      heading: '6. Probes, Resources and Spring Boot Actuator',
      content: 'Kubernetes needs to know if your Java app is healthy. LIVENESS probe: "is the app alive?" — if it fails, the container is RESTARTED. READINESS probe: "can it accept traffic now?" — if it fails, the pod is REMOVED from Service endpoints (no restart). STARTUP probe: gives slow-starting JVM apps time before liveness checks begin. Spring Boot Actuator auto-detects Kubernetes and exposes /actuator/health/liveness and /actuator/health/readiness. Also set resource requests (guaranteed, used for scheduling) and limits (maximum; exceeding memory limit = OOMKilled).',
      points: [
        'Do NOT put database checks in liveness: a DB outage would restart all pods endlessly',
        'Use -XX:MaxRAMPercentage=75 so the JVM heap respects the container memory limit',
        'server.shutdown=graceful lets in-flight requests finish when a pod is terminated (SIGTERM)',
        'Requests example: cpu 250m (a quarter core), memory 512Mi',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Install Minikube and kubectl, First Commands',
      scenario: 'Start a local single-node Kubernetes cluster and explore it.',
      steps: [
        'Install Docker Desktop (or Docker Engine), then kubectl and minikube (Windows: winget install Kubernetes.kubectl and winget install Kubernetes.minikube; macOS: brew install kubectl minikube; Linux: download binaries from the official docs)',
        'Start the cluster: minikube start --cpus=2 --memory=4096 --driver=docker',
        'Enable add-ons: minikube addons enable ingress and minikube addons enable metrics-server',
        'Run the commands below and read each output',
        'Optional GUI: minikube dashboard; IntelliJ Ultimate has a Kubernetes plugin (Services tool window) to browse pods and logs',
      ],
      code: `minikube start --cpus=2 --memory=4096 --driver=docker
kubectl version --client
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -A                      # all namespaces
kubectl create namespace shop
kubectl config set-context --current --namespace=shop

# Quick imperative test (we will use YAML next)
kubectl create deployment hello --image=nginx:1.27-alpine
kubectl get deploy,rs,pods
kubectl expose deployment hello --port=80 --type=NodePort
minikube service hello -n shop --url
kubectl delete deployment hello && kubectl delete service hello`,
      result: `😄  minikube v1.34.0 on Ubuntu 24.04
✨  Using the docker driver based on user configuration
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default

kubectl get nodes -o wide
NAME       STATUS   ROLES           AGE   VERSION   INTERNAL-IP    ...
minikube   Ready    control-plane   1m    v1.31.0   192.168.49.2   ...

kubectl get deploy,rs,pods
NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/hello   1/1     1            1           12s
NAME                               DESIRED   CURRENT   READY   AGE
replicaset.apps/hello-6d5f7c9b8d   1         1         1       12s
NAME                         READY   STATUS    RESTARTS   AGE
pod/hello-6d5f7c9b8d-x7k2p   1/1     Running   0          12s

minikube service hello -n shop --url
http://192.168.49.2:31245
(versions, hashes and ports differ on your machine)`,
      explanation: 'You see the ownership chain: Deployment -> ReplicaSet (with a hash of the pod template) -> Pod. Setting the namespace in the current context means later kubectl commands default to "shop". minikube service prints a reachable URL for a NodePort service. Imperative commands are good for learning; real projects keep YAML in Git (declarative).',
    },
    {
      title: 'Example 2: Prepare the Spring Boot App for Kubernetes',
      scenario: 'Make order-api cloud-native: probes, graceful shutdown, environment-driven config, and build the image inside Minikube.',
      steps: [
        'Add spring-boot-starter-actuator to pom.xml',
        'Add the application.yml settings below (probes enabled, graceful shutdown)',
        'Use the multi-stage Dockerfile from Day 26 for the backend',
        'Point your shell to Minikube Docker: eval $(minikube docker-env) on Linux/macOS, or minikube -p minikube docker-env --shell powershell | Invoke-Expression on Windows PowerShell',
        'Build: docker build -t order-api:1.0 . (the image now exists inside Minikube, no registry needed)',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# src/main/resources/application.yml
server:
  port: 8080
  shutdown: graceful
spring:
  application:
    name: order-api
  lifecycle:
    timeout-per-shutdown-phase: 20s
  datasource:
    url: \${DB_URL:jdbc:mysql://localhost:3306/orderdb}
    username: \${DB_USER:root}
    password: \${DB_PASSWORD:root}
  jpa:
    hibernate:
      ddl-auto: update
management:
  endpoint:
    health:
      probes:
        enabled: true          # auto-enabled on Kubernetes; explicit for local testing
      group:
        readiness:
          include: readinessState,db
  endpoints:
    web:
      exposure:
        include: health,info,prometheus

// OrderController.java (simple endpoint to test)
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @GetMapping("/host")
    public Map<String, String> host() throws Exception {
        return Map.of("pod", java.net.InetAddress.getLocalHost().getHostName());
    }
}

# Build inside Minikube's Docker
eval $(minikube docker-env)
docker build -t order-api:1.0 .
minikube image ls | grep order-api`,
      result: `docker build -t order-api:1.0 .
 => naming to docker.io/library/order-api:1.0

minikube image ls | grep order-api
docker.io/library/order-api:1.0

Local check (without k8s): curl localhost:8080/actuator/health/liveness
{"status":"UP"}
curl localhost:8080/actuator/health/readiness
{"status":"UP"}   (DOWN if MySQL is not reachable, because db is in the readiness group)`,
      explanation: 'Liveness only reflects the internal application state, while readiness also includes the database, so a DB outage takes pods out of load balancing without restarting them. The ${DB_URL:...} placeholders mean "use env var DB_URL, else the default". Building inside Minikube Docker avoids pushing to Docker Hub; in real clusters images come from a registry (Docker Hub, ECR, GHCR).',
    },
    {
      title: 'Example 3: Full Manifests — MySQL StatefulSet, ConfigMap, Secret, Deployment, Service, Ingress',
      scenario: 'Deploy order-api (2 replicas) and MySQL into namespace shop, and expose the API at http://shop.local/api.',
      steps: [
        'Create a folder k8s/ with the files below (IntelliJ highlights Kubernetes YAML with the Kubernetes plugin)',
        'Apply in order: kubectl apply -f k8s/ (kubectl handles all files in the folder)',
        'Watch pods: kubectl get pods -w until mysql-0 and both order-api pods are 1/1 Running',
        'Add "<minikube ip> shop.local" to your hosts file (Linux/mac: /etc/hosts; Windows: C:\\Windows\\System32\\drivers\\etc\\hosts as Administrator). On Docker driver for Windows/macOS run minikube tunnel and use 127.0.0.1 instead',
        'curl http://shop.local/api/orders/host several times and see different pod names',
      ],
      code: `# ===== k8s/00-namespace.yaml =====
apiVersion: v1
kind: Namespace
metadata:
  name: shop

# ===== k8s/01-secret.yaml =====
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: shop
type: Opaque
stringData:                     # plain text here; k8s stores it base64-encoded
  MYSQL_ROOT_PASSWORD: RootPass@123
  DB_USER: root
  DB_PASSWORD: RootPass@123

# ===== k8s/02-configmap.yaml =====
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-api-config
  namespace: shop
data:
  SPRING_PROFILES_ACTIVE: k8s
  DB_URL: jdbc:mysql://mysql:3306/orderdb?createDatabaseIfNotExist=true
  JAVA_TOOL_OPTIONS: "-XX:MaxRAMPercentage=75"

# ===== k8s/10-mysql.yaml =====
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: shop
spec:
  clusterIP: None              # headless service for the StatefulSet
  selector:
    app: mysql
  ports:
    - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: shop
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.4
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: MYSQL_ROOT_PASSWORD
            - name: MYSQL_DATABASE
              value: orderdb
          volumeMounts:
            - name: data
              mountPath: /var/lib/mysql
          readinessProbe:
            exec:
              command: ["sh", "-c", "mysqladmin ping -uroot -p$MYSQL_ROOT_PASSWORD"]
            initialDelaySeconds: 20
            periodSeconds: 10
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi

# ===== k8s/20-order-api.yaml =====
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
  namespace: shop
  labels:
    app: order-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: order-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: order-api
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: order-api
          image: order-api:1.0
          imagePullPolicy: IfNotPresent     # use the image built inside minikube
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: order-api-config
            - secretRef:
                name: db-secret
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              memory: 768Mi
          startupProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            periodSeconds: 5
            failureThreshold: 24          # up to 120 s to start
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: order-api
  namespace: shop
spec:
  type: ClusterIP
  selector:
    app: order-api
  ports:
    - port: 80              # clients call order-api:80
      targetPort: 8080      # container port

# ===== k8s/30-ingress.yaml =====
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  namespace: shop
spec:
  ingressClassName: nginx
  rules:
    - host: shop.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: order-api
                port:
                  number: 80

# ===== Commands =====
kubectl apply -f k8s/
kubectl get pods -n shop -w
kubectl get svc,ingress -n shop
curl http://shop.local/api/orders/host
curl http://shop.local/api/orders/host`,
      result: `namespace/shop created
secret/db-secret created
configmap/order-api-config created
service/mysql created
statefulset.apps/mysql created
deployment.apps/order-api created
service/order-api created
ingress.networking.k8s.io/shop-ingress created

kubectl get pods -n shop
NAME                         READY   STATUS    RESTARTS   AGE
mysql-0                      1/1     Running   0          2m
order-api-7c9d8f6b5-4kq2m    1/1     Running   0          2m
order-api-7c9d8f6b5-p8xzt    1/1     Running   1 (90s ago) 2m

kubectl get ingress -n shop
NAME           CLASS   HOSTS        ADDRESS        PORTS   AGE
shop-ingress   nginx   shop.local   192.168.49.2   80      2m

curl http://shop.local/api/orders/host -> {"pod":"order-api-7c9d8f6b5-4kq2m"}
curl http://shop.local/api/orders/host -> {"pod":"order-api-7c9d8f6b5-p8xzt"}`,
      explanation: 'Files are applied in name order, so the namespace exists first (a re-run fixes any race). One order-api pod restarted once because it started before MySQL was ready — readiness and restarts handle this automatically, which is normal in Kubernetes. The Service load-balances between both pods (you see different hostnames). The StatefulSet creates PVC data-mysql-0 so data survives pod deletion. stringData lets you write plain values; Kubernetes stores them base64-encoded.',
    },
    {
      title: 'Example 4: Day-2 Operations — Debug, Scale, Rolling Update, Rollback, Autoscale',
      scenario: 'Practice what you will do in a real support/production shift.',
      steps: [
        'Debug: describe a pod, read logs, exec into a container, port-forward the service',
        'Scale manually to 4 replicas and back',
        'Release version 1.1: build order-api:1.1 and set the new image; watch the rollout',
        'Simulate a bad release (image tag that does not exist), see ImagePullBackOff and roll back',
        'Create a HorizontalPodAutoscaler based on CPU',
      ],
      code: `# --- Debugging ---
kubectl describe pod order-api-7c9d8f6b5-4kq2m -n shop      # events at the bottom!
kubectl logs deploy/order-api -n shop --tail=50 -f
kubectl logs order-api-7c9d8f6b5-p8xzt -n shop --previous   # logs of the crashed container
kubectl exec -it mysql-0 -n shop -- mysql -uroot -p orderdb
kubectl port-forward svc/order-api 9090:80 -n shop          # http://localhost:9090/actuator/health
kubectl get events -n shop --sort-by=.lastTimestamp

# --- Scaling ---
kubectl scale deployment order-api --replicas=4 -n shop
kubectl get pods -n shop -l app=order-api

# --- Rolling update ---
docker build -t order-api:1.1 .
kubectl set image deployment/order-api order-api=order-api:1.1 -n shop
kubectl rollout status deployment/order-api -n shop
kubectl rollout history deployment/order-api -n shop

# --- Bad release and rollback ---
kubectl set image deployment/order-api order-api=order-api:9.9 -n shop
kubectl get pods -n shop
kubectl rollout undo deployment/order-api -n shop

# --- Autoscaling (needs metrics-server addon) ---
kubectl autoscale deployment order-api --cpu-percent=70 --min=2 --max=6 -n shop
kubectl get hpa -n shop
kubectl top pods -n shop`,
      result: `kubectl rollout status deployment/order-api -n shop
Waiting for deployment "order-api" rollout to finish: 1 out of 4 new replicas have been updated...
Waiting for deployment "order-api" rollout to finish: 3 of 4 updated replicas are available...
deployment "order-api" successfully rolled out

Bad release:
NAME                         READY   STATUS             RESTARTS   AGE
order-api-5b8f7d9c6-zz91k    0/1     ImagePullBackOff   0          40s
order-api-6f7d8c9b4-abcde    1/1     Running            0          5m   (old pods keep serving)

kubectl rollout undo deployment/order-api -n shop
deployment.apps/order-api rolled back

kubectl get hpa -n shop
NAME        REFERENCE              TARGETS        MINPODS   MAXPODS   REPLICAS
order-api   Deployment/order-api   cpu: 8%/70%    2         6         4
(pod names and numbers vary)`,
      explanation: 'kubectl describe shows Events such as FailedScheduling, OOMKilled, probe failures and image pull errors — always check it first. Because maxUnavailable is 0, the broken 9.9 release never removed the working pods; users saw no downtime, and rollout undo restored the previous ReplicaSet. HPA compares CPU usage against the REQUESTS value (250m); it will scale down from 4 toward the minimum of 2 over several minutes when load is low.',
    },
  ],
  interview: [
    { q: 'What is Kubernetes?', a: 'An open-source container orchestration platform that automates deployment, scaling, self-healing, service discovery and rolling updates of containerized applications across a cluster of machines, based on declarative desired state.', level: 'Easy' },
    { q: 'What is a Pod?', a: 'The smallest deployable unit in Kubernetes: one or more tightly coupled containers sharing network namespace (same IP/ports) and volumes, scheduled together on one node.', level: 'Easy' },
    { q: 'Deployment vs StatefulSet?', a: 'Deployment is for stateless apps: pods are interchangeable with random names and shared or no storage. StatefulSet gives stable names (mysql-0), ordered start/stop and a dedicated PVC per pod — used for databases, Kafka, Zookeeper.', level: 'Medium' },
    { q: 'Explain Service types.', a: 'ClusterIP: internal virtual IP (default). NodePort: exposes a port on every node. LoadBalancer: provisions a cloud load balancer. ExternalName: DNS alias to an external host. Headless (clusterIP: None) returns pod IPs directly.', level: 'Medium' },
    { q: 'What is the difference between port, targetPort and containerPort?', a: 'containerPort is the port the app listens on inside the container (8080). targetPort is where the Service forwards traffic (usually equal to containerPort). port is the port clients use to call the Service (80).', level: 'Medium' },
    { q: 'Liveness vs readiness vs startup probe?', a: 'Liveness failure restarts the container. Readiness failure removes the pod from Service endpoints without restart. Startup probe delays liveness/readiness checks until a slow app has started. Spring Boot provides /actuator/health/liveness and /readiness.', level: 'Medium' },
    { q: 'ConfigMap vs Secret?', a: 'Both inject configuration as env vars or files. ConfigMap is for non-sensitive data; Secret is for sensitive data, stored base64-encoded, can be encrypted at rest and restricted by RBAC. Base64 is not encryption.', level: 'Easy' },
    { q: 'What is an Ingress?', a: 'An API object defining HTTP/HTTPS routing rules (host/path) from outside the cluster to Services, implemented by an Ingress Controller like ingress-nginx; it also handles TLS termination.', level: 'Medium' },
    { q: 'A pod is in CrashLoopBackOff. How do you debug?', a: 'kubectl describe pod (events, exit code, OOMKilled), kubectl logs --previous for the crashed container log, check env/config/secrets, probes too aggressive, memory limits, and dependency availability.', level: 'Hard' },
    { q: 'requests vs limits?', a: 'Requests are reserved resources used by the scheduler to place pods and by HPA as the base for percentages. Limits are maximums: CPU is throttled above the limit, memory above the limit gets the container OOMKilled.', level: 'Hard' },
    { q: 'How does a rolling update achieve zero downtime?', a: 'The Deployment creates new pods (maxSurge) and only removes old ones after new pods pass readiness (respecting maxUnavailable). Combined with graceful shutdown in Spring Boot, in-flight requests complete.', level: 'Hard' },
    { q: 'What is the role of etcd and kubelet?', a: 'etcd is the distributed key-value store holding all cluster state on the control plane. kubelet is the agent on each node that ensures containers described in pod specs are running and healthy and reports status.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a CronJob that calls the API cleanup endpoint every night at 2 AM.',
      hint: 'batch/v1 CronJob with curlimages/curl image; schedule "0 2 * * *".',
      solution: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: order-cleanup
  namespace: shop
spec:
  schedule: "0 2 * * *"
  timeZone: "Asia/Kolkata"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cleanup
              image: curlimages/curl:8.10.1
              args: ["-fsS", "-X", "POST", "http://order-api/api/admin/cleanup"]

# test now without waiting:
# kubectl create job manual-cleanup --from=cronjob/order-cleanup -n shop`,
    },
    {
      task: 'Mount the DB password Secret as a FILE instead of an env var and read it in Spring Boot.',
      hint: 'Volume of type secret mounted at /etc/secrets; spring.config.import=optional:configtree:/etc/secrets/',
      solution: `# Deployment pod spec excerpt
      containers:
        - name: order-api
          image: order-api:1.0
          env:
            - name: SPRING_CONFIG_IMPORT
              value: "optional:configtree:/etc/secrets/"
          volumeMounts:
            - name: db-creds
              mountPath: /etc/secrets
              readOnly: true
      volumes:
        - name: db-creds
          secret:
            secretName: db-secret
            items:
              - key: DB_PASSWORD
                path: spring.datasource.password    # file name = property name

# Inside the pod:
# /etc/secrets/spring.datasource.password  (contains RootPass@123)
# Spring Boot configtree turns each file into a property with the file name as key.`,
    },
    {
      task: 'Write a declarative HPA (autoscaling/v2) YAML for order-api: min 2, max 8, target CPU 60%, and memory 80%.',
      hint: 'metrics array with type Resource.',
      solution: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-api
  namespace: shop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-api
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

# kubectl apply -f hpa.yaml ; kubectl get hpa -n shop -w`,
    },
    {
      task: 'Add a React frontend (nginx image shop-web:1.0) to the cluster and route "/" to it and "/api" to order-api in the same Ingress.',
      hint: 'Deployment + ClusterIP Service for the web; two paths in Ingress.',
      solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-web
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: shop-web }
  template:
    metadata:
      labels: { app: shop-web }
    spec:
      containers:
        - name: web
          image: shop-web:1.0
          ports: [{ containerPort: 80 }]
---
apiVersion: v1
kind: Service
metadata:
  name: shop-web
  namespace: shop
spec:
  selector: { app: shop-web }
  ports: [{ port: 80, targetPort: 80 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  namespace: shop
spec:
  ingressClassName: nginx
  rules:
    - host: shop.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: order-api, port: { number: 80 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: shop-web, port: { number: 80 } } }
# The longest matching prefix wins, so /api/... goes to order-api and everything else to shop-web.`,
    },
    {
      task: 'List 8 kubectl commands you would use to investigate "API is returning 503" and say what each tells you.',
      hint: 'Think from Ingress -> Service -> Endpoints -> Pods -> logs.',
      solution: `1. kubectl get ingress -n shop                 -> ingress exists, correct host/address
2. kubectl describe ingress shop-ingress -n shop -> backend service name/port correct
3. kubectl get svc order-api -n shop            -> service ports and selector
4. kubectl get endpoints order-api -n shop      -> EMPTY endpoints = no ready pods match selector
5. kubectl get pods -n shop -l app=order-api    -> READY 0/1? restarts? status?
6. kubectl describe pod <pod> -n shop           -> readiness probe failures, OOMKilled, events
7. kubectl logs <pod> -n shop --previous        -> exception at startup (DB connection, bad config)
8. kubectl port-forward pod/<pod> 9090:8080     -> call /actuator/health directly, bypassing ingress
A 503 from ingress-nginx usually means the Service has no ready endpoints.`,
    },
  ],
  quiz: [
    {
      question: 'Which object keeps a fixed number of identical pods AND supports rolling updates and rollback?',
      options: ['Pod', 'ReplicaSet', 'Deployment', 'Service'],
      answer: 2,
      explanation: 'Deployment manages ReplicaSets and provides rollout/rollback.',
    },
    {
      question: 'If a readiness probe fails, Kubernetes will:',
      options: ['Remove the pod from Service endpoints until it is ready again', 'Restart the container', 'Delete the Deployment', 'Move the pod to another node'],
      answer: 0,
      explanation: 'Readiness affects traffic only; liveness failure causes restarts.',
    },
    {
      question: 'Which Service type is the default and reachable only inside the cluster?',
      options: ['NodePort', 'LoadBalancer', 'ExternalName', 'ClusterIP'],
      answer: 3,
      explanation: 'ClusterIP is the default internal service type.',
    },
    {
      question: 'Values inside a Kubernetes Secret YAML (data:) are:',
      options: ['AES encrypted', 'base64 encoded', 'SHA-256 hashed', 'Plain text always'],
      answer: 1,
      explanation: 'Base64 encoding only; protect with RBAC and encryption at rest.',
    },
    {
      question: 'Which command shows logs of the PREVIOUS crashed container of a pod?',
      options: ['kubectl logs pod --old', 'kubectl describe logs pod', 'kubectl logs <pod> --previous', 'kubectl get logs --crashed'],
      answer: 2,
      explanation: '--previous (-p) shows logs from the last terminated container instance.',
    },
  ],
};
