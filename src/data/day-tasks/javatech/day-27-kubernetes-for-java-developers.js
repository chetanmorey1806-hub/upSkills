export default {
  lesson: 'day-27-kubernetes-for-java-developers',
  minutes: 24,
  intro: 'Use Kubernetes objects and kubectl to deploy, expose, configure, probe and scale a Spring Boot app on Minikube.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'You want 3 copies of the Spring Boot app, automatic replacement of crashed copies and rolling updates. Which object do you create?',
      options: ['A single Pod', 'A Deployment (which manages a ReplicaSet, which manages Pods)', 'A ConfigMap', 'A Service'],
      answer: 1,
      explain: 'A **Deployment** declares the desired state (image, replicas). It creates a ReplicaSet that keeps exactly 3 Pods running, and creates a new ReplicaSet during rolling updates. Pods alone are not recreated when they die.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the kubectl command that creates/updates the objects defined in `k8s/deployment.yaml`.',
      example: { title: 'checking the result', code: 'kubectl get pods\nkubectl describe pod <name>\nkubectl logs <pod-name>' },
      accept: ['kubectl apply -f k8s/deployment.yaml', 'kubectl apply -f ./k8s/deployment.yaml'],
      explain: '`kubectl apply -f file.yaml` is declarative: run it again after editing and Kubernetes applies only the differences. `kubectl apply -f k8s/` applies every file in the folder.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the command that scales the deployment `student-api` to **5** replicas.',
      example: { title: 'watching a rollout', code: 'kubectl rollout status deployment/student-api' },
      accept: ['kubectl scale deployment student-api --replicas=5', 'kubectl scale deployment/student-api --replicas=5', 'kubectl scale deploy student-api --replicas=5', 'kubectl scale --replicas=5 deployment/student-api', 'kubectl scale --replicas=5 deployment student-api'],
      explain: '`kubectl scale deployment student-api --replicas=5`. In real projects you usually change `replicas` in the YAML (GitOps) or use a HorizontalPodAutoscaler.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`minikube ip` prints `192.168.49.2`. With this Service, what URL do you open on your laptop to call `GET /api/students`?',
      example: { title: 'the three ports', text: 'nodePort = on every node (from outside), port = the Service port inside the cluster, targetPort = the container port.' },
      code: `apiVersion: v1
kind: Service
metadata:
  name: student-api
spec:
  type: NodePort
  selector:
    app: student-api
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080`,
      expected: 'http://192.168.49.2:30080/api/students',
      explain: 'From outside the cluster you use **node IP + nodePort** (30080). Inside the cluster other Pods call `http://student-api:80` (the Service name and port), and the Service forwards to container port 8080 on Pods labelled `app: student-api`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **probes** for a Spring Boot app with Actuator are TRUE? (choose all that apply)',
      options: [
        'livenessProbe can call /actuator/health/liveness',
        'readinessProbe can call /actuator/health/readiness',
        'If the readiness probe fails, the Pod is taken out of the Service (gets no traffic) but is not restarted',
        'If the liveness probe keeps failing, Kubernetes restarts the container',
        'Probes are only for databases',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Readiness = "can I receive traffic now?" (e.g. still starting or DB down). Liveness = "am I stuck?" → restart. Spring Boot exposes both groups automatically on Kubernetes. Give slow-starting Java apps a `startupProbe` or an initial delay.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The container has `resources.limits.memory: 512Mi`, but the JVM heap grows to 700 MB. What happens?',
      options: [
        'Kubernetes gives it more memory automatically',
        'The container is killed (OOMKilled) and restarted',
        'Nothing, limits are only advisory',
        'The Service is deleted',
      ],
      answer: 1,
      explain: 'Memory limits are hard: exceeding them gets the container **OOMKilled**. Size the JVM inside the limit, e.g. `-XX:MaxRAMPercentage=75`, and set `requests` so the scheduler places the Pod on a node with enough room. Passwords go in a **Secret**, other settings in a **ConfigMap**.',
    },
  ],
};
