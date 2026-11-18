export default {
  id: 'day-29-deploying-java-apps-on-aws',
  title: 'Deploying Java Apps on AWS: EC2, RDS MySQL, S3, Elastic Beanstalk and IAM',
  module: 'Module 7: DevOps, Cloud & Professional Tools',
  day: 29,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Deploy a Spring Boot + MySQL + React application on Amazon Web Services. Learn regions, IAM users/roles and least privilege, security groups, launching an EC2 Linux server and running the JAR as a service, creating an RDS MySQL database, storing files and hosting React on S3, one-click deployment with Elastic Beanstalk, and the cost-safety habits every fresher must follow.',
  objectives: [
    'Explain core AWS concepts: regions, availability zones, IAM, VPC and security groups',
    'Create an IAM user/role with least privilege and enable MFA and billing alerts',
    'Launch an EC2 instance, install Java, run a Spring Boot JAR with systemd and nginx',
    'Create an RDS MySQL database and connect securely from EC2 using environment variables',
    'Upload files to S3 from Spring Boot, host a React build on S3, and deploy with Elastic Beanstalk',
  ],
  theory: [
    {
      heading: '1. Cloud and AWS Basics',
      content: 'Earlier, companies bought physical servers, kept them in a server room and waited weeks for new hardware. Cloud computing means renting computing resources (servers, databases, storage) over the internet, paying only for what you use, and creating them in minutes. AWS (Amazon Web Services) is the largest cloud provider; Azure and Google Cloud are the other big ones. Analogy: owning a car vs using Ola/Uber — you pay per ride and do not worry about maintenance.',
      points: [
        'Region: a geographic area with data centres, e.g., ap-south-1 (Mumbai), ap-south-2 (Hyderabad), us-east-1 (N. Virginia). Choose the one nearest your users; resources are region-specific',
        'Availability Zone (AZ): one or more isolated data centres inside a region (ap-south-1a, 1b, 1c). Use multiple AZs for high availability',
        'IaaS (EC2: you manage OS and app), PaaS (Elastic Beanstalk: you upload the JAR), SaaS (Gmail)',
        'Shared responsibility: AWS secures the cloud hardware; YOU secure what you put in it (OS patches, passwords, open ports, data)',
        'Main services for a Java developer: EC2 (servers), RDS (managed DB), S3 (file storage), Elastic Beanstalk, ECS/EKS (containers), CloudWatch (logs/metrics), IAM, Route 53 (DNS), ACM (SSL certificates)',
      ],
    },
    {
      heading: '2. IAM: Identity and Access Management',
      content: 'IAM controls WHO can do WHAT on WHICH resources. The ROOT user (email used to sign up) has unlimited power — use it only for billing/account tasks, enable MFA on it and never create access keys for it. Create IAM users (or better, IAM Identity Center users) for daily work. Permissions are given by POLICIES (JSON documents with Effect, Action, Resource). Group users (Developers group) and attach policies to groups. A ROLE is an identity WITHOUT a password that a service (EC2, Lambda) or a user can temporarily assume — the right way to give an EC2 app access to S3 without storing keys in code.',
      syntax: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::shopkart-product-images/*"
    }
  ]
}`,
      points: [
        'Principle of least privilege: give only the permissions needed, nothing more',
        'Never commit access keys to GitHub — bots scan public repos within minutes and launch costly servers',
        'Spring Boot / AWS SDK finds credentials automatically (env vars, ~/.aws/credentials, EC2 instance role) — the default credentials provider chain',
      ],
    },
    {
      heading: '3. Networking: VPC and Security Groups',
      content: 'A VPC (Virtual Private Cloud) is your private network inside AWS; every account has a default VPC in each region. It contains SUBNETS: public subnets (route to the internet gateway, for web servers/load balancers) and private subnets (no direct internet access, for databases). A SECURITY GROUP is a virtual firewall attached to an instance or database. It is STATEFUL (reply traffic is automatically allowed) and has only ALLOW rules. By default all inbound traffic is blocked and all outbound is allowed.',
      syntax: `sg-web (attached to EC2)
  Inbound: 22   TCP  from  My IP (103.21.x.x/32)   SSH only from your office/home
           80   TCP  from  0.0.0.0/0              HTTP
           443  TCP  from  0.0.0.0/0              HTTPS
sg-db (attached to RDS)
  Inbound: 3306 TCP  from  sg-web                 only the app servers can reach MySQL`,
      tip: 'Never open 3306 or 22 to 0.0.0.0/0. Referencing another security group (sg-web) as the source is the professional way.',
    },
    {
      heading: '4. EC2, RDS and S3 in Simple Words',
      content: 'EC2 (Elastic Compute Cloud) gives virtual servers called instances. You choose an AMI (OS image like Amazon Linux 2023 or Ubuntu 24.04), an instance type (t3.micro = 2 vCPU, 1 GB RAM; t3.small = 2 GB), storage (EBS volume) and a key pair (.pem file for SSH). RDS (Relational Database Service) gives a managed MySQL/PostgreSQL: AWS handles installation, backups, patching, Multi-AZ failover — you just get an endpoint like shopdb.xxxx.ap-south-1.rds.amazonaws.com. S3 (Simple Storage Service) stores files (objects) in BUCKETS with globally unique names; used for images, invoices, backups, logs and static websites. It is practically unlimited and highly durable.',
      points: [
        'Stopped EC2 instances do not charge compute, but their EBS storage and Elastic IPs can still cost money',
        'Elastic IP: a fixed public IP; otherwise the public IP changes after stop/start',
        'RDS: keep "Public access: No"; connect from EC2 in the same VPC',
        'S3 Block Public Access is ON by default — keep it ON for private files and use pre-signed URLs to share them temporarily',
      ],
    },
    {
      heading: '5. Elastic Beanstalk and Other Deployment Options',
      content: 'Elastic Beanstalk (EB) is a Platform-as-a-Service: you upload the Spring Boot JAR (or a Docker image) and EB creates the EC2 instances, security groups, load balancer, auto scaling group and CloudWatch monitoring for you, while you can still see and tune everything. The Java SE platform runs your JAR with nginx in front and expects the app on port 5000 by default (set SERVER_PORT=5000 or change the PORT environment property). Configuration is given through Environment properties, which become OS environment variables.',
      points: [
        'Options from most control to least: EC2 (manual) -> ECS/EKS (containers) -> Elastic Beanstalk / App Runner (PaaS) -> Lambda (serverless functions)',
        'React frontend: S3 static hosting + CloudFront CDN (with HTTPS via ACM), or AWS Amplify Hosting',
        'Logs: CloudWatch Logs; EB console > Logs > Request logs for quick download',
        'Do not create RDS inside the EB environment for real projects — it is deleted when the environment is terminated; create RDS separately',
      ],
    },
    {
      heading: '6. Cost Safety for Students and Freshers',
      content: 'Many students get a shock bill after a weekend of practice. AWS gives a Free Tier for new accounts (with limits and conditions that change over time — always read the current Free Tier page), but some services are never free and running resources keep charging per hour. Follow these rules from day one.',
      points: [
        'Create a Budget alert on day 1: Billing and Cost Management > Budgets > Create budget > a small monthly amount with email alerts at 50%, 80% and 100%',
        'Enable MFA on the root user and use an IAM user for daily work',
        'Use the smallest instance types and a single AZ for practice; stop or terminate resources the same day',
        'Watch out for: NAT Gateways, load balancers, Elastic IPs not attached, RDS left running, EBS snapshots, data transfer out',
        'Delete in this order when done: EB environment, EC2 instances, RDS (skip final snapshot for practice), unattached EBS volumes, Elastic IPs, S3 buckets you no longer need',
        'Check the Billing dashboard and Cost Explorer every few days; use the AWS Pricing Calculator before trying a new service',
      ],
      tip: 'Never paste access keys into code, screenshots, YouTube videos or WhatsApp groups. If a key leaks, deactivate it immediately in IAM.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Secure Account Setup — MFA, IAM Admin User, Budget and AWS CLI',
      scenario: 'Prepare a new AWS account safely before creating any resource.',
      steps: [
        'Sign up at aws.amazon.com (needs a card; a small verification charge may be reversed). Choose the Basic (free) support plan',
        'Root user > top-right account name > Security credentials > Assign MFA device > Authenticator app (Google/Microsoft Authenticator)',
        'IAM > User groups > Create group "Developers" > attach policy AdministratorAccess (for your personal practice account only; companies give limited policies)',
        'IAM > Users > Create user "ravi-dev" > Provide console access > add to Developers > enable MFA for this user too',
        'Billing and Cost Management > Budgets > Create budget > Use a template: Monthly cost budget > enter amount and your email',
        'For CLI: IAM user > Security credentials > Create access key > Command Line Interface; install AWS CLI v2 and run aws configure',
        'Switch region (top-right) to Asia Pacific (Mumbai) ap-south-1 for all following examples',
      ],
      code: `# Install AWS CLI v2
# Windows: msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
# macOS:   brew install awscli
# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip && sudo ./aws/install

aws --version
aws configure
# AWS Access Key ID [None]: AKIA****************
# AWS Secret Access Key [None]: ****************************************
# Default region name [None]: ap-south-1
# Default output format [None]: json

aws sts get-caller-identity
aws ec2 describe-regions --query "Regions[].RegionName" --output table`,
      result: `aws --version
aws-cli/2.x.x Python/3.x Linux/... (version differs)

aws sts get-caller-identity
{
    "UserId": "AIDA4EXAMPLEUSERID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/ravi-dev"
}

aws ec2 describe-regions ... --output table
-------------------
| DescribeRegions |
+-----------------+
|  ap-south-1     |
|  eu-north-1     |
|  ...            |
+-----------------+`,
      explanation: 'get-caller-identity proves the CLI is using the IAM user, not root. Credentials are stored in ~/.aws/credentials (C:\\Users\\<you>\\.aws\\credentials on Windows) — never inside your project folder. The budget does not stop spending; it only alerts you, so you still must delete resources yourself.',
    },
    {
      title: 'Example 2: Create RDS MySQL and Security Groups',
      scenario: 'Create a private MySQL database that only the application server can reach.',
      steps: [
        'EC2 > Security Groups > Create "sg-web": inbound SSH 22 from My IP, HTTP 80 from Anywhere-IPv4, HTTPS 443 from Anywhere-IPv4',
        'Create "sg-db": inbound type MYSQL/Aurora (3306), source = custom > select sg-web',
        'RDS > Create database > Standard create > Engine MySQL 8.x > Templates: Free tier (if shown) or Dev/Test',
        'DB instance identifier: shopdb; Master username: admin; set a strong password (or "Manage in AWS Secrets Manager")',
        'Instance class: smallest burstable (db.t3.micro / db.t4g.micro); Storage 20 GiB gp3; disable storage autoscaling for practice',
        'Connectivity: default VPC, Public access: No, VPC security group: choose sg-db (remove default)',
        'Additional configuration: Initial database name: shopdb; backups 1 day; disable Performance Insights/Enhanced monitoring for practice > Create (takes ~5-10 minutes)',
        'Copy the Endpoint from Connectivity & security tab',
      ],
      code: `# Same thing with AWS CLI (optional)
aws ec2 create-security-group --group-name sg-web --description "web servers"
aws ec2 create-security-group --group-name sg-db  --description "mysql"

aws ec2 authorize-security-group-ingress --group-name sg-web --protocol tcp --port 22  --cidr 103.21.45.67/32
aws ec2 authorize-security-group-ingress --group-name sg-web --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name sg-db  --protocol tcp --port 3306 --source-group sg-web

aws rds create-db-instance \\
  --db-instance-identifier shopdb \\
  --engine mysql \\
  --db-instance-class db.t3.micro \\
  --allocated-storage 20 \\
  --master-username admin \\
  --master-user-password 'Str0ng#Pass2026' \\
  --db-name shopdb \\
  --no-publicly-accessible \\
  --vpc-security-group-ids sg-0abc123def4567890 \\
  --backup-retention-period 1

aws rds wait db-instance-available --db-instance-identifier shopdb
aws rds describe-db-instances --db-instance-identifier shopdb \\
  --query "DBInstances[0].Endpoint.Address" --output text`,
      result: `aws rds describe-db-instances ... --output text
shopdb.c9xk2example.ap-south-1.rds.amazonaws.com

RDS console: shopdb | MySQL Community | Available | ap-south-1a | db.t3.micro
Connectivity: Publicly accessible: No | Security groups: sg-db (active)`,
      explanation: 'The database has no public IP and accepts port 3306 only from instances that carry sg-web, so even if the password leaks, nobody on the internet can connect. In the default VPC with default settings, use the security group ID (sg-...) in commands that need one. Replace 103.21.45.67 with your own public IP (search "what is my IP").',
    },
    {
      title: 'Example 3: Launch EC2, Install Java 21, Run Spring Boot with systemd and nginx',
      scenario: 'Deploy the order-api JAR to an Ubuntu EC2 server connected to RDS, running as a service that restarts automatically.',
      steps: [
        'EC2 > Launch instance > Name order-api-server > AMI Ubuntu Server 24.04 LTS > Instance type t3.micro (or t2.micro if that is your Free Tier type)',
        'Key pair > Create new key pair > shopkart-key > RSA > .pem (Windows PuTTY users: .ppk) > download and keep it safe',
        'Network settings > Select existing security group > sg-web; Storage 8-20 GiB gp3 > Launch',
        'Build the JAR locally: ./mvnw -B clean package -DskipTests (IntelliJ: Maven tool window > Lifecycle > package; Eclipse: Run As > Maven build... > goals "clean package")',
        'Copy JAR with scp and SSH into the server (commands below). Windows: use PowerShell (OpenSSH is built-in) or MobaXterm/WinSCP',
        'Install Java, create the env file and systemd service, install nginx as reverse proxy, then open http://<public-ip>/api/orders in the browser',
      ],
      code: `# ---- On your laptop ----
chmod 400 shopkart-key.pem
scp -i shopkart-key.pem target/order-api-0.0.1-SNAPSHOT.jar ubuntu@13.233.45.67:/home/ubuntu/app.jar
ssh -i shopkart-key.pem ubuntu@13.233.45.67

# ---- On the EC2 server ----
sudo apt update && sudo apt install -y openjdk-21-jre-headless nginx mysql-client
java -version

# Test DB connectivity from EC2 (works because of sg-web -> sg-db rule)
mysql -h shopdb.c9xk2example.ap-south-1.rds.amazonaws.com -u admin -p -e "SHOW DATABASES;"

sudo mkdir -p /opt/order-api
sudo mv /home/ubuntu/app.jar /opt/order-api/app.jar
sudo useradd --system --no-create-home --shell /usr/sbin/nologin orderapi
sudo chown -R orderapi:orderapi /opt/order-api

# Environment file (readable only by root and the service)
sudo tee /etc/order-api.env > /dev/null <<'EOF'
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://shopdb.c9xk2example.ap-south-1.rds.amazonaws.com:3306/shopdb
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=Str0ng#Pass2026
JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=70
EOF
sudo chmod 600 /etc/order-api.env

# systemd service
sudo tee /etc/systemd/system/order-api.service > /dev/null <<'EOF'
[Unit]
Description=ShopKart Order API
After=network.target

[Service]
User=orderapi
EnvironmentFile=/etc/order-api.env
ExecStart=/usr/bin/java -jar /opt/order-api/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now order-api
sudo systemctl status order-api --no-pager
journalctl -u order-api -f            # live logs (Ctrl+C to exit)

# nginx reverse proxy: port 80 -> 8080
sudo tee /etc/nginx/sites-available/order-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/order-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

curl http://localhost/actuator/health`,
      result: `java -version
openjdk version "21.0.x" ... (exact build differs)

mysql ... -e "SHOW DATABASES;"
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| shopdb             |
| sys                |
+--------------------+

sudo systemctl status order-api
● order-api.service - ShopKart Order API
     Loaded: loaded (/etc/systemd/system/order-api.service; enabled)
     Active: active (running) since Wed 2026-11-18 10:12:03 UTC; 25s ago

nginx -t -> syntax is ok / test is successful
curl http://localhost/actuator/health -> {"status":"UP"}
Browser: http://13.233.45.67/api/orders -> JSON list (IP is an example)`,
      explanation: 'systemd starts the app at boot, restarts it if it crashes, and collects logs in journald. SuccessExitStatus=143 tells systemd that exit code 143 (SIGTERM during stop) is normal for Java. The password lives in a root-only env file, not in the JAR or Git. nginx listens on 80 so the Java process does not need root to bind a low port; later you can add HTTPS with Certbot (Let\'s Encrypt) on a domain. The quoted heredoc (<<\'EOF\') stops the shell from expanding $host inside the nginx config.',
    },
    {
      title: 'Example 4: Upload Product Images to S3 from Spring Boot Using an IAM Role',
      scenario: 'Store product images in a private S3 bucket and return a temporary (pre-signed) URL, without any access key in the code.',
      steps: [
        'S3 > Create bucket > name shopkart-product-images-<yourname> (globally unique) > Region ap-south-1 > keep Block all public access ON > Create',
        'IAM > Policies > Create policy (JSON from theory section 2 with your bucket name) > name ShopkartS3Images',
        'IAM > Roles > Create role > Trusted entity: AWS service > EC2 > attach ShopkartS3Images > name order-api-ec2-role',
        'EC2 > select instance > Actions > Security > Modify IAM role > order-api-ec2-role > Update',
        'Add AWS SDK v2 dependencies and the code below; add APP_S3_BUCKET to /etc/order-api.env; redeploy and restart the service',
        'Test with Postman: POST form-data key "file" (type File) to http://<ip>/api/products/1/image',
      ],
      code: `<!-- pom.xml -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>bom</artifactId>
      <version>2.28.16</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
<dependencies>
  <dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
  </dependency>
</dependencies>

# application.yml
app:
  s3:
    bucket: \${APP_S3_BUCKET}
    region: ap-south-1
spring:
  servlet:
    multipart:
      max-file-size: 5MB

// S3Config.java
@Configuration
public class S3Config {
    @Bean
    S3Client s3Client(@Value("\${app.s3.region}") String region) {
        // No keys here: DefaultCredentialsProvider uses env vars, ~/.aws, or the EC2 instance role
        return S3Client.builder().region(Region.of(region)).build();
    }

    @Bean
    S3Presigner s3Presigner(@Value("\${app.s3.region}") String region) {
        return S3Presigner.builder().region(Region.of(region)).build();
    }
}

// ImageService.java
@Service
public class ImageService {
    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;

    public ImageService(S3Client s3, S3Presigner presigner, @Value("\${app.s3.bucket}") String bucket) {
        this.s3 = s3; this.presigner = presigner; this.bucket = bucket;
    }

    public String upload(Long productId, MultipartFile file) throws IOException {
        String key = "products/" + productId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        s3.putObject(PutObjectRequest.builder()
                        .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return key;
    }

    public String temporaryUrl(String key) {
        GetObjectPresignRequest req = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(b -> b.bucket(bucket).key(key))
                .build();
        return presigner.presignGetObject(req).url().toString();
    }
}

// ProductImageController.java
@RestController
@RequestMapping("/api/products")
public class ProductImageController {
    private final ImageService images;
    public ProductImageController(ImageService images) { this.images = images; }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@PathVariable Long id, @RequestParam("file") MultipartFile file)
            throws IOException {
        String key = images.upload(id, file);
        return Map.of("key", key, "url", images.temporaryUrl(key));
    }
}`,
      result: `POST /api/products/1/image (form-data file=laptop.jpg)
200 OK
{
  "key": "products/1/7d2f4c1e-9b8a-4e2f-a1c3-5f6e7d8c9b0a-laptop.jpg",
  "url": "https://shopkart-product-images-ravi.s3.ap-south-1.amazonaws.com/products/1/7d2f...-laptop.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=900&X-Amz-Signature=..."
}
Opening the url in a browser shows the image; after 15 minutes it returns AccessDenied / Request has expired.
S3 console: bucket > products/ > 1/ > the uploaded object.`,
      explanation: 'The EC2 instance role provides temporary, auto-rotated credentials through the instance metadata service; the SDK finds them automatically, so no keys exist in code or config. The bucket stays private; a pre-signed URL grants time-limited access to one object. On your laptop, the same code works with credentials from aws configure. X-Amz-Expires=900 equals 15 minutes.',
    },
    {
      title: 'Example 5: Deploy with Elastic Beanstalk and Host React on S3',
      scenario: 'Deploy the same JAR with Elastic Beanstalk (managed EC2 + monitoring) and publish the React build as a static website.',
      steps: [
        'Elastic Beanstalk > Create application > name shopkart > Environment tier: Web server > Platform: Java, branch Corretto 21 running on 64bit Amazon Linux 2023',
        'Application code: Upload your code > choose order-api.jar > version label v1',
        'Presets: Single instance (cheapest, no load balancer) > Next > Service role: create/choose; EC2 instance profile: aws-elasticbeanstalk-ec2-role (attach your S3 policy to it if needed); EC2 key pair: shopkart-key',
        'Configure updates, monitoring, and logging > Environment properties: SERVER_PORT=5000, SPRING_PROFILES_ACTIVE=prod, SPRING_DATASOURCE_URL/USERNAME/PASSWORD (RDS created separately), then Submit',
        'Add the EB instance security group as a source in sg-db (port 3306) so the app can reach RDS',
        'For React: npm run build; S3 > Create bucket shopkart-web-<yourname> > uncheck Block all public access (acknowledge) > Properties > Static website hosting: Enable, index document index.html, error document index.html > Permissions > Bucket policy (below)',
        'Upload with aws s3 sync and open the bucket website endpoint. For production use CloudFront with HTTPS instead of a public bucket',
      ],
      code: `# React .env.production (Vite) -> API URL of the EB environment
VITE_API_URL=http://shopkart-env.eba-abc123.ap-south-1.elasticbeanstalk.com

# Build and upload
npm run build
aws s3 sync dist/ s3://shopkart-web-ravi --delete

# Bucket policy for static website (public read of objects only)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shopkart-web-ravi/*"
    }
  ]
}

# Spring Boot CORS for the S3 website origin (or put both behind CloudFront to avoid CORS)
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://shopkart-web-ravi.s3-website.ap-south-1.amazonaws.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}

# Optional: EB CLI for repeat deployments
pip install awsebcli
eb init shopkart -p corretto-21 --region ap-south-1
eb deploy                      # uploads the artifact configured in .elasticbeanstalk/config.yml
eb logs
eb terminate shopkart-env      # delete when done practising!`,
      result: `Elastic Beanstalk console:
Environment shopkart-env | Health: Ok (green) | Running version: v1
Domain: shopkart-env.eba-abc123.ap-south-1.elasticbeanstalk.com

curl http://shopkart-env.eba-abc123.ap-south-1.elasticbeanstalk.com/actuator/health
{"status":"UP"}

aws s3 sync dist/ s3://shopkart-web-ravi --delete
upload: dist/index.html to s3://shopkart-web-ravi/index.html
upload: dist/assets/index-B1x2y3z4.js to s3://shopkart-web-ravi/assets/index-B1x2y3z4.js
upload: dist/assets/index-C5d6e7f8.css to s3://shopkart-web-ravi/assets/index-C5d6e7f8.css

Browser: http://shopkart-web-ravi.s3-website.ap-south-1.amazonaws.com -> React app loads data from the EB API
(domains and file hashes are examples)`,
      explanation: 'EB created the EC2 instance, security group, CloudWatch alarms and an nginx proxy that forwards port 80 to 5000 — that is why SERVER_PORT=5000. Environment properties become environment variables, read by Spring relaxed binding. Setting the S3 error document to index.html makes React Router routes work on refresh. The S3 website endpoint is HTTP only; real projects use CloudFront + ACM certificate + a Route 53 domain. Always run eb terminate (or delete in the console) after practice to stop charges.',
    },
  ],
  interview: [
    { q: 'What is the difference between a region and an availability zone?', a: 'A region is a geographic area (ap-south-1 Mumbai) containing multiple isolated availability zones; an AZ is one or more data centres with independent power and networking. Deploying across AZs gives high availability; across regions gives disaster recovery and lower latency for distant users.', level: 'Easy' },
    { q: 'IAM user vs IAM role?', a: 'An IAM user is a permanent identity with long-term credentials (password/access keys) for a person or app. A role has no long-term credentials; it is assumed by a trusted entity (EC2, Lambda, another account, SSO user) and provides temporary credentials. Apps on AWS should use roles.', level: 'Medium' },
    { q: 'What is a security group and how is it different from a NACL?', a: 'A security group is a stateful, instance-level virtual firewall with allow rules only. A Network ACL is stateless, works at the subnet level, and supports both allow and deny rules evaluated in number order.', level: 'Medium' },
    { q: 'Why use RDS instead of installing MySQL on EC2?', a: 'RDS is managed: automated backups and point-in-time restore, patching, monitoring, Multi-AZ failover, read replicas and easy scaling. On EC2 you must do all that yourself. EC2 gives more control (custom plugins, OS access).', level: 'Easy' },
    { q: 'How should a Spring Boot app on EC2 access S3 securely?', a: 'Attach an IAM role with a least-privilege policy to the EC2 instance; the AWS SDK default credentials provider obtains temporary credentials automatically. Never hard-code access keys in code or properties.', level: 'Medium' },
    { q: 'What is a pre-signed URL?', a: 'A URL signed with the credentials of someone who has access, granting time-limited permission to GET or PUT a specific S3 object without making the bucket public.', level: 'Medium' },
    { q: 'What is Elastic Beanstalk and what does it manage?', a: 'A PaaS service that deploys applications (Java SE JAR, Tomcat WAR, Docker) and automatically provisions EC2, auto scaling, load balancer, security groups, health monitoring and logs. You keep control over the underlying resources and pay only for them.', level: 'Easy' },
    { q: 'How do you pass DB credentials to a Java app on AWS without hard-coding them?', a: 'Environment variables (EB environment properties, systemd EnvironmentFile), AWS Systems Manager Parameter Store or AWS Secrets Manager (with Spring Cloud AWS), and IAM roles to read them. Rotate secrets regularly.', level: 'Medium' },
    { q: 'How would you make the application highly available on AWS?', a: 'Run at least two instances in different AZs behind an Application Load Balancer with an Auto Scaling group and health checks, use RDS Multi-AZ, store files in S3, keep apps stateless (sessions in Redis/JWT), and use CloudFront for static content.', level: 'Hard' },
    { q: 'Your EC2 app is not reachable in the browser. What do you check?', a: 'Instance state and status checks; app running (systemctl status, journalctl); listening port (ss -tlnp); security group inbound rule for the port from 0.0.0.0/0; nginx config; using the correct public IP/DNS (changes after restart without Elastic IP); subnet route to internet gateway; OS firewall (ufw).', level: 'Hard' },
    { q: 'How do you avoid unexpected AWS bills?', a: 'Budgets and billing alerts, MFA on root, least privilege, smallest instance sizes, deleting/stopping unused resources (EC2, RDS, load balancers, NAT gateways, Elastic IPs, snapshots), tagging resources, and reviewing Cost Explorer regularly; never leak access keys.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write an EC2 User Data script (runs at first boot on Amazon Linux 2023) that installs Java 21, downloads the JAR from S3 and starts it as a systemd service.',
      hint: 'dnf install java-21-amazon-corretto-headless; the instance role must allow s3:GetObject on the artifacts bucket.',
      solution: `#!/bin/bash
set -e
dnf install -y java-21-amazon-corretto-headless
mkdir -p /opt/order-api
aws s3 cp s3://shopkart-artifacts-ravi/order-api/app.jar /opt/order-api/app.jar
useradd --system --no-create-home orderapi || true
chown -R orderapi:orderapi /opt/order-api

cat > /etc/systemd/system/order-api.service <<'EOF'
[Unit]
Description=Order API
After=network.target

[Service]
User=orderapi
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=SERVER_PORT=8080
ExecStart=/usr/bin/java -jar /opt/order-api/app.jar
SuccessExitStatus=143
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now order-api
# Logs of this script: /var/log/cloud-init-output.log`,
    },
    {
      task: 'Write a least-privilege IAM policy for a CI pipeline that may only upload files to the "releases/" folder of bucket shopkart-artifacts-ravi and list that folder.',
      hint: 's3:PutObject on bucket/releases/*; s3:ListBucket on the bucket ARN with a prefix condition.',
      solution: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadReleases",
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::shopkart-artifacts-ravi/releases/*"
    },
    {
      "Sid": "ListReleases",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::shopkart-artifacts-ravi",
      "Condition": {
        "StringLike": { "s3:prefix": ["releases/*"] }
      }
    }
  ]
}`,
    },
    {
      task: 'Read the DB password from AWS Secrets Manager in Spring Boot instead of an environment variable.',
      hint: 'Spring Cloud AWS: spring.config.import=aws-secretsmanager:<secret-name>; secret stored as JSON keys matching property names.',
      solution: `<!-- pom.xml -->
<dependency>
  <groupId>io.awspring.cloud</groupId>
  <artifactId>spring-cloud-aws-starter-secrets-manager</artifactId>
  <version>3.2.1</version>
</dependency>

# Secret "prod/order-api/db" in Secrets Manager (Other type of secret, key/value):
# {"spring.datasource.username":"admin","spring.datasource.password":"Str0ng#Pass2026"}

# application.yml
spring:
  config:
    import: "aws-secretsmanager:prod/order-api/db"
  cloud:
    aws:
      region:
        static: ap-south-1
  datasource:
    url: jdbc:mysql://shopdb.c9xk2example.ap-south-1.rds.amazonaws.com:3306/shopdb

# IAM role of EC2/EB needs:
# "Action": "secretsmanager:GetSecretValue",
# "Resource": "arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/order-api/db-*"`,
    },
    {
      task: 'Write a cleanup checklist with AWS CLI commands to delete everything created today.',
      hint: 'EB environment, EC2 instances, RDS, S3 buckets, security groups, Elastic IPs.',
      solution: `# 1. Elastic Beanstalk
eb terminate shopkart-env --force

# 2. EC2 instances
aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,State.Name]" --output table
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0

# 3. RDS (practice only: no final snapshot)
aws rds delete-db-instance --db-instance-identifier shopdb --skip-final-snapshot --delete-automated-backups

# 4. S3 buckets (empties and removes)
aws s3 rb s3://shopkart-web-ravi --force
aws s3 rb s3://shopkart-product-images-ravi --force

# 5. Unattached Elastic IPs and EBS volumes
aws ec2 describe-addresses --query "Addresses[?AssociationId==null].AllocationId"
aws ec2 release-address --allocation-id eipalloc-0abc...
aws ec2 describe-volumes --filters Name=status,Values=available --query "Volumes[].VolumeId"
aws ec2 delete-volume --volume-id vol-0abc...

# 6. Security groups (after instances/DB are gone)
aws ec2 delete-security-group --group-name sg-db
aws ec2 delete-security-group --group-name sg-web

# 7. Next day: check Billing > Bills and Cost Explorer for any remaining charges`,
    },
  ],
  quiz: [
    {
      question: 'What is the recommended way for a Spring Boot app on EC2 to get permission to write to S3?',
      options: ['Hard-code access keys in application.properties', 'Attach an IAM role to the EC2 instance', 'Make the bucket public', 'Use the root user keys'],
      answer: 1,
      explanation: 'An instance role provides temporary credentials found automatically by the SDK.',
    },
    {
      question: 'Which inbound rule is correct for an RDS MySQL database used by app servers in sg-web?',
      options: ['3306 from 0.0.0.0/0', '22 from sg-web', '80 from anywhere', '3306 from sg-web'],
      answer: 3,
      explanation: 'Allow MySQL port only from the application security group.',
    },
    {
      question: 'On the Elastic Beanstalk Java SE platform, nginx forwards traffic by default to which application port?',
      options: ['5000', '8080', '80', '3306'],
      answer: 0,
      explanation: 'Set SERVER_PORT=5000 or change the PORT environment property.',
    },
    {
      question: 'Which statement about AWS Budgets is TRUE?',
      options: ['It automatically deletes resources when the limit is reached', 'It is only available to enterprise accounts', 'It sends alerts but you must still stop or delete resources yourself', 'It makes all services free'],
      answer: 2,
      explanation: 'Budgets alert you; stopping spending is your responsibility.',
    },
    {
      question: 'A security group in AWS is:',
      options: ['Stateless with allow and deny rules', 'Stateful with allow rules only', 'Applied to the whole region', 'Only used for S3'],
      answer: 1,
      explanation: 'Security groups are stateful instance-level firewalls with allow rules only.',
    },
  ],
};
