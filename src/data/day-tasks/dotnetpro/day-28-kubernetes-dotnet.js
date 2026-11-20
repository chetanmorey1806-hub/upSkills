export default {
  lesson: 'day-28-kubernetes-dotnet',
  minutes: 25,
  intro: 'Practise Kubernetes objects, Services, Secrets, probes, rolling updates, autoscaling maths and kubectl commands for an ASP.NET Core API.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want 3 self-healing copies of the Placement API that can be updated with zero downtime and rolled back. Which object do you write?',
      options: ['Pod', 'Deployment', 'Service', 'ConfigMap'],
      answer: 1,
      explain: 'A Deployment manages ReplicaSets, which keep the pods alive, and adds rolling updates with history for rollback. A bare Pod is not recreated if deleted. A Service only routes traffic, and a ConfigMap only holds settings.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Expose the .NET 8 API container through a Service. Complete the container port:
\`\`\`
spec:
  selector: { app: placement-api }
  ports:
    - port: 80
      targetPort: ______
\`\`\``,
      example: { title: 'port vs targetPort', text: '`port` is what clients inside the cluster call (http://placement-api). `targetPort` is where the app listens inside the container.' },
      accept: ['8080', '"8080"'],
      explain: 'ASP.NET Core 8+ container images listen on port 8080 by default (ASPNETCORE_HTTP_PORTS=8080) because they run as the non-root `app` user. Using 80 here (the old default) gives "connection refused" and empty responses.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'You run this command on the Secret from the lesson. What is printed?',
      example: { title: 'Encoding a value', code: `echo -n 'sa' | base64      # c2E=` },
      code: `kubectl get secret placement-api-secrets -n placement -o jsonpath="{.data.SA_PASSWORD}" | base64 -d
# the jsonpath part returns: UGxhY2VtZW50QDIwMjY=`,
      expected: 'Placement@2026',
      explain: 'Secret values under `data:` are only base64-ENCODED, so anyone with read access can decode them instantly. That is why secret YAML must not be committed to Git, and why access is limited with RBAC, encryption at rest or an external vault.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Calculate the rolling update limits. Write 4 numbers, one per line:\n1. replicas 10, default strategy (maxSurge 25%, maxUnavailable 25%): MAX total pods\n2. same: MIN available pods\n3. replicas 4, maxSurge 1, maxUnavailable 0: MAX total pods\n4. same: MIN available pods',
      example: { title: 'Rounding rule', text: 'Percentages: maxSurge is rounded UP, maxUnavailable is rounded DOWN. Example: replicas 3 with 25% -> surge ceil(0.75)=1, unavailable floor(0.75)=0.' },
      code: `strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%`,
      expected: `13
8
5
4`,
      explain: '10 x 25% = 2.5. Surge rounds up to 3, so there can be up to 13 pods. Unavailable rounds down to 2, so at least 8 must be available. With maxSurge 1 and maxUnavailable 0 there are at most 4 + 1 = 5 pods and always 4 available, which is slower but never loses capacity.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'An HPA has target CPU 70%, minReplicas 2, maxReplicas 6. Using desired = ceil(current x currentCPU / target), limited to min..max, write the desired replica count for each case, one per line:\n1. 3 pods at 140%\n2. 4 pods at 35%\n3. 5 pods at 90%',
      example: { title: 'Worked example', text: '2 pods at 105% with target 70%: ceil(2 x 105 / 70) = ceil(3) = 3 pods.' },
      code: `kubectl autoscale deployment placement-api --cpu-percent=70 --min=2 --max=6 -n placement`,
      expected: `6
2
6`,
      explain: 'ceil(3 x 140 / 70) = 6. ceil(4 x 35 / 70) = 2, which is also the minimum. ceil(5 x 90 / 70) = ceil(6.43) = 7, but maxReplicas is 6, so the result is capped at 6. CPU % is measured against each pod\'s CPU REQUEST, so requests must be set.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about probes for the ASP.NET Core API are TRUE? Select all that apply.',
      options: [
        'If the liveness probe fails, the kubelet restarts the container',
        'If the readiness probe fails, the pod is removed from the Service endpoints but NOT restarted',
        'The liveness probe should check SQL Server and Redis so the pod restarts when they are down',
        'A startupProbe gives slow-starting apps time before liveness checks begin',
        'Probes are optional decoration and do not affect rolling updates',
      ],
      answers: [0, 1, 3],
      explain: 'Liveness = restart, readiness = traffic on/off, startup = grace period at boot. Do not check external dependencies in liveness: restarting every API pod will not fix a down database. Readiness probes are what make rolling updates safe, because a new pod receives traffic only after it reports ready.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Version 1.1 has a bug. Complete the command that returns the Deployment to the previous version:\n`kubectl ______ deployment/placement-api -n placement`',
      example: { title: 'Related commands', code: `kubectl rollout status deployment/placement-api
kubectl rollout history deployment/placement-api` },
      accept: ['rollout undo'],
      explain: '`kubectl rollout undo` scales the previous ReplicaSet (kept because of revisionHistoryLimit) back up and the current one down, using the same rolling strategy. Add `--to-revision=N` to pick an older revision. Deleting the Deployment would cause downtime.',
    },
  ],
};
