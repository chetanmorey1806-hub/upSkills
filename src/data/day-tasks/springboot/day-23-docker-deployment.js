export default {
  lesson: 'day-23-docker-deployment',
  minutes: 22,
  intro: 'Build an executable JAR, containerize it with a multi-stage Dockerfile, run it with MySQL in Compose and prepare for deployment.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'After `./mvnw clean package`, the JAR is `target/student-api-0.0.1-SNAPSHOT.jar`. Write the command that runs it.',
      example: { title: 'overriding a property at start', code: 'java -jar app.jar --server.port=9000' },
      accept: ['java -jar target/student-api-0.0.1-SNAPSHOT.jar', 'java -jar ./target/student-api-0.0.1-SNAPSHOT.jar'],
      explain: 'A Spring Boot "fat JAR" contains your code, all dependencies and embedded Tomcat, so `java -jar` is enough - no external server needed.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why use a **multi-stage** Dockerfile (a Maven/JDK build stage, then a JRE runtime stage)?',
      options: [
        'It is required by Docker',
        'The final image contains only the JRE and the JAR - no Maven, source code or build cache - so it is much smaller and safer',
        'It makes the Java code run twice as fast',
        'It removes the need for a JAR',
      ],
      answer: 1,
      explain: 'Stage 1 compiles with the full JDK + Maven; stage 2 copies only the JAR (`COPY --from=build ...`) onto a small JRE image (e.g. `eclipse-temurin:21-jre`). Smaller images download faster and have fewer vulnerabilities.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the last line of the Dockerfile in **exec form** so the container starts the app:\n```\nFROM eclipse-temurin:21-jre\nWORKDIR /app\nCOPY --from=build /app/target/*.jar app.jar\nEXPOSE 8080\n???\n```',
      example: { title: 'exec form vs shell form', code: 'CMD ["npm", "start"]      # exec form (JSON array)\nCMD npm start            # shell form' },
      accept: ['ENTRYPOINT ["java", "-jar", "app.jar"]', 'ENTRYPOINT ["java","-jar","/app/app.jar"]', 'CMD ["java", "-jar", "app.jar"]', 'CMD ["java","-jar","/app/app.jar"]'],
      explain: '`ENTRYPOINT ["java", "-jar", "app.jar"]` - exec form runs java as PID 1 so it receives stop signals and shuts down gracefully. `EXPOSE` only documents the port; publishing is done with `-p` when running.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the command that builds an image named `student-api` with tag `1.0` from the Dockerfile in the current folder.',
      example: { title: 'listing images', code: 'docker images' },
      accept: ['docker build -t student-api:1.0 .', 'docker build --tag student-api:1.0 .', 'docker image build -t student-api:1.0 .'],
      explain: '`-t name:tag` names the image and the final `.` is the **build context** (the folder sent to Docker). Forgetting the dot is the most common error ("requires 1 argument").',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The container is started like this. Type two lines: (1) the URL you open **on your laptop** to list students, (2) the host name the app uses to reach MySQL.',
      example: { title: 'port mapping', text: '-p HOST:CONTAINER → -p 3000:80 means laptop port 3000 goes to container port 80.' },
      code: `# docker-compose.yml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: college
      MYSQL_ROOT_PASSWORD: root
  api:
    image: student-api:1.0
    ports:
      - "9090:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/college
    depends_on:
      - mysql
# the app serves GET /api/students`,
      expected: 'http://localhost:9090/api/students\nmysql',
      explain: '`"9090:8080"` maps laptop port **9090** to container port 8080. Inside the Compose network containers reach each other by **service name**, so the app connects to host `mysql` - `localhost` inside the api container would be the container itself. `SPRING_DATASOURCE_URL` overrides `spring.datasource.url`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which items belong on a production deployment checklist? (choose all that apply)',
      options: [
        'Secrets (DB password, JWT secret) come from environment variables, not from Git',
        'A health check on /actuator/health',
        'spring.jpa.hibernate.ddl-auto=create in production',
        'Activate the prod profile (SPRING_PROFILES_ACTIVE=prod)',
        'Store MySQL data in a volume so it survives container restarts',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Use env-based config, health checks, a prod profile and persistent **volumes**. `ddl-auto=create` drops all tables on every restart - a disaster in production; use Flyway + `validate`.',
    },
  ],
};
