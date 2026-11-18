export default {
  id: 'day-19-caching-with-redis',
  title: 'Caching with Redis: Spring Cache Abstraction, TTL, Cache-Aside and RedisTemplate',
  module: 'Module 5: Spring Ecosystem Extras',
  day: 19,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Make slow APIs fast by caching results. Learn the Spring Cache abstraction (@EnableCaching, @Cacheable, @CachePut, @CacheEvict), run Redis in Docker, configure TTL and JSON serialization, understand the cache-aside pattern and use RedisTemplate directly for counters and OTPs.',
  objectives: [
    'Explain what a cache is, cache hit/miss and why caching improves performance',
    'Use @EnableCaching, @Cacheable, @CachePut, @CacheEvict and @Caching correctly',
    'Run Redis with Docker and connect Spring Boot 3 using spring.data.redis.* properties',
    'Configure TTL per cache and JSON serialization with RedisCacheConfiguration',
    'Implement the cache-aside pattern and use RedisTemplate / StringRedisTemplate for custom data',
  ],
  theory: [
    {
      heading: 'What is Caching?',
      content:
        'A cache is a fast, temporary storage that keeps a copy of data that is expensive to fetch or compute. Reading from RAM takes microseconds; a database query over the network may take 20-200 milliseconds.\n\nAnalogy: Your mother keeps sugar in a small jar in the kitchen (cache) instead of going to the store-room (database) every time she makes tea. The jar is small and must be refilled, but it saves many trips.\n\nTerms:\n- Cache HIT: the data was found in the cache.\n- Cache MISS: not found, so we go to the database and then store it in the cache.\n- Eviction: removing an entry (because data changed, or memory is full - LRU policy).\n- TTL (Time To Live): an entry expires automatically after some time.\n- Stale data: cache has an old value while the DB has a new one - the biggest risk of caching.',
      points: [
        'Cache data that is read often and changes rarely: product catalog, country list, user profile, config',
        'Do not cache data that changes every second or must always be 100% fresh (bank balance)',
        'Local cache (inside one JVM, e.g. ConcurrentHashMap/Caffeine) vs distributed cache (Redis, shared by all app instances)',
      ],
    },
    {
      heading: 'Spring Cache Abstraction',
      content:
        'Spring gives annotations that work with ANY cache provider (ConcurrentMap, Caffeine, Redis, Ehcache, Hazelcast). You change the provider by changing a dependency, not your code.\n\n1. @EnableCaching on a @Configuration or main class switches caching on (Spring creates a proxy around your beans).\n2. @Cacheable("products"): before running the method, look in the cache "products" with the key (by default the method parameters). If found, return it WITHOUT running the method. If not, run the method and store the result.\n3. @CachePut(value = "products", key = "#result.id"): ALWAYS run the method and put the result in the cache (use on update).\n4. @CacheEvict(value = "products", key = "#id"): remove the entry (use on delete). allEntries = true clears the whole cache.\n5. @Caching(...): combine several annotations on one method.\n6. @CacheConfig(cacheNames = "products") on the class: default cache name for all methods.\n\nKeys use SpEL: #id, #p0, #product.id, #result.id, #root.methodName. Conditions: condition = "#id > 0" (checked before), unless = "#result == null" (checked after).',
      syntax: '@Cacheable(value = "products", key = "#id", unless = "#result == null")\npublic Product getById(Long id) { ... }\n\n@CachePut(value = "products", key = "#result.id")\npublic Product update(Long id, ProductDto dto) { ... }\n\n@CacheEvict(value = "products", key = "#id")\npublic void delete(Long id) { ... }',
      tip: 'Self-invocation does not work: if a method in the same class calls this.getById(), the proxy is skipped and the cache is NOT used. Call it from another bean. Also, the method must be public.',
    },
    {
      heading: 'Redis Basics',
      content:
        'Redis (REmote DIctionary Server) is an in-memory key-value data store. It is extremely fast (around 100,000+ operations per second on a laptop), single-threaded for commands (so each command is atomic), and can save data to disk.\n\nData types: String, Hash, List, Set, Sorted Set, plus Streams, Bitmaps etc.\nCommon commands (redis-cli):\nSET name "Ravi"   GET name   DEL name\nSET otp:9876543210 482913 EX 300   (expires in 300 seconds)\nTTL otp:9876543210   (seconds left; -1 = no expiry, -2 = key does not exist)\nINCR page:views   KEYS products*   (KEYS only in development - it blocks Redis)\n\nRun with Docker:\ndocker run -d --name redis -p 6379:6379 redis:7\ndocker exec -it redis redis-cli\n\nGUI: RedisInsight (free) or the IntelliJ Ultimate database tool.',
      points: [
        'Uses: caching, sessions, OTP storage, rate limiting, leaderboards, pub/sub, distributed locks',
        'Default port 6379',
        'Redis is the most common distributed cache in Spring Boot projects',
      ],
    },
    {
      heading: 'Spring Boot + Redis Configuration',
      content:
        'Dependencies: spring-boot-starter-cache and spring-boot-starter-data-redis (which brings the Lettuce client).\n\nIn Spring Boot 3 the properties are spring.data.redis.* (in Boot 2 they were spring.redis.* - old tutorials use that).\n\nWhen Redis is on the classpath and caching is enabled, Boot creates a RedisCacheManager. By default values are stored with JDK serialization (classes must implement Serializable, and the data in Redis is unreadable binary). Most projects configure JSON serialization with GenericJackson2JsonRedisSerializer.\n\nIn Redis, Spring stores keys as cacheName::key, for example products::1.',
      syntax: 'spring.data.redis.host=localhost\nspring.data.redis.port=6379\n# spring.data.redis.password=secret\nspring.cache.type=redis\nspring.cache.redis.time-to-live=10m\nspring.cache.redis.cache-null-values=false',
      points: [
        'spring.cache.redis.time-to-live sets a default TTL for all caches',
        'Use a RedisCacheManagerBuilderCustomizer bean for different TTL per cache',
        'Without any provider, Spring uses a simple ConcurrentHashMap cache (no TTL) - fine for learning',
      ],
    },
    {
      heading: 'Cache-Aside Pattern and Cache Problems',
      content:
        'Cache-aside (lazy loading) is the most common pattern, and @Cacheable implements it for you:\nREAD: 1) look in cache 2) on miss read DB 3) store in cache 4) return.\nWRITE: 1) update DB 2) evict (or update) the cache entry.\n\nOther patterns: write-through (write to cache and DB together), write-behind (write to cache, DB later), read-through (cache loads from DB itself).\n\nProblems to know for interviews:\n- Stale data: forgot to evict on update -> users see old values. Fix: @CacheEvict/@CachePut + TTL as a safety net.\n- Cache stampede: a hot key expires and 1000 requests hit the DB together. Fix: @Cacheable(sync = true), random TTL, pre-warming.\n- Cache penetration: requests for ids that do not exist always miss. Fix: cache null/empty results for a short time or validate ids.\n- Memory: Redis is RAM - always set TTL and a maxmemory-policy like allkeys-lru.',
    },
    {
      heading: 'RedisTemplate and StringRedisTemplate',
      content:
        'Annotations cover method results. For custom use (OTP, counters, rate limits, sessions) inject a template:\n- StringRedisTemplate: keys and values are Strings (readable in redis-cli). Auto-configured.\n- RedisTemplate<String, Object>: any Java object; configure a JSON value serializer.\n\nOperations:\nopsForValue() -> String commands (set, get, increment, set with timeout)\nopsForHash() -> Hash (put, get, entries)\nopsForList() -> List (leftPush, rightPop, range)\nopsForSet(), opsForZSet() -> Sets and sorted sets (leaderboard)\nredisTemplate.expire(key, Duration), delete(key), hasKey(key)',
      syntax: 'stringRedisTemplate.opsForValue().set("otp:" + mobile, otp, Duration.ofMinutes(5));\nString saved = stringRedisTemplate.opsForValue().get("otp:" + mobile);\nLong views = stringRedisTemplate.opsForValue().increment("views:product:" + id);',
    },
  ],
  examples: [
    {
      title: 'Cache-Aside Logic in Plain Java (How @Cacheable Works Inside)',
      scenario: 'Simulate a cache in front of a database using maps, so you understand hit, miss and eviction before using Spring.',
      steps: [
        'IntelliJ: File > New > Project > Java (no build tool) > Create; right-click src > New > Java Class > Main',
        'Type the code below',
        'Click the green Run button next to main and compare the output',
      ],
      code: `import java.util.*;

public class Main {
    static Map<Integer, String> database = new HashMap<>();
    static Map<Integer, String> cache = new LinkedHashMap<>();
    static int dbCalls = 0;

    static String getProduct(int id) {
        if (cache.containsKey(id)) {
            System.out.println("Cache HIT  for id " + id);
            return cache.get(id);
        }
        System.out.println("Cache MISS for id " + id + " -> reading DB");
        dbCalls++;
        String value = database.get(id);
        if (value != null) cache.put(id, value);
        return value;
    }

    static void updateProduct(int id, String newName) {
        database.put(id, newName);   // 1. update DB
        cache.remove(id);            // 2. evict cache entry
        System.out.println("Updated id " + id + ", cache evicted");
    }

    public static void main(String[] args) {
        database.put(1, "Laptop");
        database.put(2, "Mouse");

        System.out.println(getProduct(1));
        System.out.println(getProduct(1));
        System.out.println(getProduct(2));
        updateProduct(1, "Gaming Laptop");
        System.out.println(getProduct(1));
        System.out.println(getProduct(1));

        System.out.println("Total DB calls: " + dbCalls);
        System.out.println("Cache now: " + cache);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

public class Main {
    static Map<Integer, String> database = new HashMap<>();
    static Map<Integer, String> cache = new LinkedHashMap<>();
    static int dbCalls = 0;

    static String getProduct(int id) {
        if (cache.containsKey(id)) {
            System.out.println("Cache HIT  for id " + id);
            return cache.get(id);
        }
        System.out.println("Cache MISS for id " + id + " -> reading DB");
        dbCalls++;
        String value = database.get(id);
        if (value != null) cache.put(id, value);
        return value;
    }

    static void updateProduct(int id, String newName) {
        database.put(id, newName);   // 1. update DB
        cache.remove(id);            // 2. evict cache entry
        System.out.println("Updated id " + id + ", cache evicted");
    }

    public static void main(String[] args) {
        database.put(1, "Laptop");
        database.put(2, "Mouse");

        System.out.println(getProduct(1));
        System.out.println(getProduct(1));
        System.out.println(getProduct(2));
        updateProduct(1, "Gaming Laptop");
        System.out.println(getProduct(1));
        System.out.println(getProduct(1));

        System.out.println("Total DB calls: " + dbCalls);
        System.out.println("Cache now: " + cache);
    }
}`,
        },
      },
      result: `Cache MISS for id 1 -> reading DB
Laptop
Cache HIT  for id 1
Laptop
Cache MISS for id 2 -> reading DB
Mouse
Updated id 1, cache evicted
Cache MISS for id 1 -> reading DB
Gaming Laptop
Cache HIT  for id 1
Gaming Laptop
Total DB calls: 3
Cache now: {2=Mouse, 1=Gaming Laptop}`,
      explanation: 'Six reads but only 3 DB calls. The update removes id 1 from the cache, so the next read is a miss and loads the NEW value - no stale data. LinkedHashMap keeps insertion order: id 1 was removed and inserted again after id 2, so it prints last. @Cacheable + @CacheEvict generate exactly this logic for you.',
    },
    {
      title: 'Spring Cache with @Cacheable, @CachePut, @CacheEvict (Product API)',
      scenario: 'Cache product lookups of a JPA-based Product API and see the SQL disappear on the second call.',
      steps: [
        'start.spring.io: Spring Boot 3.3.x, Java 17, Artifact product-cache. Dependencies: Spring Web, Spring Data JPA, H2 Database, Spring Cache Abstraction, Spring Data Redis (Access+Driver) > GENERATE',
        'For now comment out the spring-boot-starter-data-redis dependency to test with the simple in-memory cache first',
        'Add @EnableCaching to the main class and create Product, ProductRepository, ProductService, ProductController',
        'Run and call GET http://localhost:8080/api/products/1 twice in Postman; watch the console',
      ],
      code: `# application.properties
spring.datasource.url=jdbc:h2:mem:shopdb
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.org.springframework.cache=TRACE

// ProductCacheApplication.java
@SpringBootApplication
@EnableCaching
public class ProductCacheApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductCacheApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(ProductRepository repo) {
        return args -> {
            repo.save(new Product(null, "Laptop", 55000.0));
            repo.save(new Product(null, "Mouse", 499.0));
        };
    }
}

// Product.java
@Entity
public class Product implements Serializable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double price;

    public Product() { }
    public Product(Long id, String name, Double price) { this.id = id; this.name = name; this.price = price; }
    // getters and setters
}

// ProductRepository.java
public interface ProductRepository extends JpaRepository<Product, Long> { }

// ProductService.java
@Service
@CacheConfig(cacheNames = "products")
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository repo;
    public ProductService(ProductRepository repo) { this.repo = repo; }

    @Cacheable(key = "#id")
    public Product getById(Long id) {
        log.info("Fetching product {} from DATABASE", id);
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @CachePut(key = "#result.id")
    public Product update(Long id, Product data) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        p.setName(data.getName());
        p.setPrice(data.getPrice());
        return repo.save(p);
    }

    @CacheEvict(key = "#id")
    public void delete(Long id) { repo.deleteById(id); }

    @CacheEvict(allEntries = true)
    public void clearAll() { log.info("products cache cleared"); }
}

// ProductController.java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) { return service.getById(id); }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p) { return service.update(id, p); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `1st GET /api/products/1  (about 40 ms)
TRACE o.s.cache.interceptor.CacheInterceptor : No cache entry for key '1' in cache(s) [products]
INFO  c.e.productcache.ProductService       : Fetching product 1 from DATABASE
Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
Response: { "id": 1, "name": "Laptop", "price": 55000.0 }

2nd GET /api/products/1  (about 3 ms)
TRACE o.s.cache.interceptor.CacheInterceptor : Cache entry for key '1' found in cache(s) [products]
Response: { "id": 1, "name": "Laptop", "price": 55000.0 }
(no "Fetching..." log, no SQL)

PUT /api/products/1 {"name":"Laptop Pro","price":62000} -> cache updated by @CachePut
3rd GET /api/products/1 -> { "id": 1, "name": "Laptop Pro", "price": 62000.0 } with no SQL`,
      explanation: 'On the second call the proxy returns the cached object and the method body never runs. @CachePut always runs the method and refreshes the entry so the next GET gets new data without a DB hit. Without Redis on the classpath, Spring uses ConcurrentMapCacheManager (in-JVM map, no TTL).',
    },
    {
      title: 'Switch to Redis: Docker, Properties, TTL and JSON Serialization',
      scenario: 'Move the products cache to Redis so all app instances share it, with 10-minute TTL and readable JSON values.',
      steps: [
        'Start Redis: docker run -d --name redis -p 6379:6379 redis:7',
        'Un-comment spring-boot-starter-data-redis in pom.xml and reload Maven (IntelliJ: Maven tool window > Reload; STS: right-click project > Maven > Update Project)',
        'Add the properties and the RedisConfig class below',
        'Restart, call GET /api/products/1, then check Redis: docker exec -it redis redis-cli',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

# application.properties (Spring Boot 3)
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.type=redis
spring.cache.redis.time-to-live=10m

// config/RedisConfig.java
package com.example.productcache.config;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.*;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.*;
import java.time.Duration;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    // different TTL for different caches
    @Bean
    public RedisCacheManagerBuilderCustomizer customizer(RedisCacheConfiguration base) {
        return builder -> builder
                .withCacheConfiguration("products", base.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("countries", base.entryTtl(Duration.ofHours(24)));
    }
}

# redis-cli session
127.0.0.1:6379> KEYS *
1) "products::1"
127.0.0.1:6379> GET products::1
"{\\"@class\\":\\"com.example.productcache.entity.Product\\",\\"id\\":1,\\"name\\":\\"Laptop\\",\\"price\\":55000.0}"
127.0.0.1:6379> TTL products::1
(integer) 587`,
      result: `After the first GET, redis-cli shows the key products::1 with JSON value and TTL counting down from 600 seconds (e.g. 587).
Restarting the Spring Boot app does NOT clear the cache: the first GET after restart is already a cache HIT (no SQL), because the data lives in Redis, not in the JVM.
After 10 minutes: TTL products::1 -> (integer) -2 (key expired) and the next GET reads the database again.`,
      explanation: 'GenericJackson2JsonRedisSerializer stores JSON with an @class property so Spring can rebuild the right Java type. Keys use cacheName::key. Because Redis is outside the app, three instances behind a load balancer all share one cache and an eviction on one instance is seen by all. If Redis is down, cache calls throw RedisConnectionFailureException - add a CacheErrorHandler to fall back to the DB in production.',
    },
    {
      title: 'RedisTemplate: OTP with Expiry and Page View Counter',
      scenario: 'Store a 6-digit OTP for 5 minutes and count product page views with atomic INCR.',
      steps: [
        'Create OtpService and ViewCounterService that inject StringRedisTemplate (auto-configured)',
        'Create OtpController with /send and /verify endpoints',
        'Test: POST /api/otp/send?mobile=9876543210, read the OTP from the log, then POST /api/otp/verify',
      ],
      code: `// OtpService.java
@Service
public class OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final StringRedisTemplate redis;
    private final SecureRandom random = new SecureRandom();

    public OtpService(StringRedisTemplate redis) { this.redis = redis; }

    public void sendOtp(String mobile) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        redis.opsForValue().set("otp:" + mobile, otp, Duration.ofMinutes(5));
        log.info("OTP for {} is {} (send by SMS in real app)", mobile, otp);
    }

    public boolean verify(String mobile, String otp) {
        String key = "otp:" + mobile;
        String saved = redis.opsForValue().get(key);
        if (saved != null && saved.equals(otp)) {
            redis.delete(key);           // OTP can be used only once
            return true;
        }
        return false;
    }
}

// ViewCounterService.java
@Service
public class ViewCounterService {
    private final StringRedisTemplate redis;
    public ViewCounterService(StringRedisTemplate redis) { this.redis = redis; }

    public long hit(Long productId) {
        return redis.opsForValue().increment("views:product:" + productId);  // atomic INCR
    }
}

// OtpController.java
@RestController
@RequestMapping("/api/otp")
public class OtpController {
    private final OtpService otpService;
    public OtpController(OtpService otpService) { this.otpService = otpService; }

    @PostMapping("/send")
    public Map<String, String> send(@RequestParam String mobile) {
        otpService.sendOtp(mobile);
        return Map.of("message", "OTP sent");
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestParam String mobile, @RequestParam String otp) {
        boolean ok = otpService.verify(mobile, otp);
        return ok ? ResponseEntity.ok(Map.of("verified", true))
                  : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("verified", false));
    }
}`,
      result: `POST /api/otp/send?mobile=9876543210 -> { "message": "OTP sent" }
Console: INFO c.e.p.OtpService : OTP for 9876543210 is 482913 (send by SMS in real app)
(the OTP is random, yours will differ)

redis-cli> TTL otp:9876543210  -> (integer) 296

POST /api/otp/verify?mobile=9876543210&otp=482913 -> 200 { "verified": true }
Same request again -> 401 { "verified": false }   (key was deleted after first use)

ViewCounter: 1st hit -> 1, 2nd -> 2, 3rd -> 3 (even with many app instances)`,
      explanation: 'set(key, value, Duration) uses SET ... EX, so Redis deletes the OTP automatically after 5 minutes. INCR is atomic in Redis, so two servers increasing the counter at the same moment never lose a count - something a normal Java int field cannot guarantee across instances.',
    },
  ],
  interview: [
    { q: 'What is caching and why is it used?', a: 'Caching keeps a copy of frequently used data in fast storage (memory) so later requests are served without the slow source (DB, remote API). It reduces response time, database load and cost.', level: 'Easy' },
    { q: 'Difference between @Cacheable and @CachePut?', a: '@Cacheable checks the cache first and skips the method on a hit. @CachePut always executes the method and stores the result in the cache. Use @Cacheable for reads and @CachePut for updates. Do not put both on the same method.', level: 'Easy' },
    { q: 'What does @CacheEvict(allEntries = true) do?', a: 'It removes all entries of the given cache, not only one key. beforeInvocation = true evicts before the method runs (useful if the method may throw an exception).', level: 'Easy' },
    { q: 'What happens if you forget @EnableCaching?', a: 'The caching annotations are ignored silently. Methods run every time and nothing is cached. (Spring Boot auto-configures the CacheManager, but the annotation is still needed to enable the interceptor.)', level: 'Medium' },
    { q: 'Why does @Cacheable not work when a method calls another method of the same class?', a: 'Spring caching is proxy-based. An internal call this.getById() does not go through the proxy, so the cache interceptor is skipped. Move the cached method to another bean or inject the proxy.', level: 'Medium' },
    { q: 'What is Redis and why is it used as a cache?', a: 'Redis is an in-memory key-value store with rich data types, TTL support, persistence and replication. It is very fast and runs outside the application, so many instances share one cache and the cache survives app restarts.', level: 'Easy' },
    { q: 'Explain the cache-aside pattern.', a: 'The application manages the cache: on read, check cache; on miss load from DB and put in cache. On write, update the DB and evict/update the cache entry. It is simple and only caches data that is actually requested. @Cacheable + @CacheEvict implement it.', level: 'Medium' },
    { q: 'What is TTL and why should every cache have one?', a: 'Time To Live: after this time the entry expires automatically. It limits how long stale data can live if an eviction is missed, and stops memory from filling with unused keys. In Boot: spring.cache.redis.time-to-live or RedisCacheConfiguration.entryTtl().', level: 'Medium' },
    { q: 'What is a cache stampede and how do you prevent it?', a: 'When a popular key expires, many concurrent requests miss and all hit the database together. Prevent it with @Cacheable(sync = true) (only one thread loads per key in that instance), random/jittered TTLs, pre-warming hot keys, or a distributed lock.', level: 'Hard' },
    { q: 'Which serializer should you use for Redis cache values and why?', a: 'The default JdkSerializationRedisSerializer needs Serializable classes, produces unreadable binary and breaks when the class changes. GenericJackson2JsonRedisSerializer (or Jackson2JsonRedisSerializer for one type) stores readable JSON and is easier to debug. Keys usually use StringRedisSerializer.', level: 'Hard' },
    { q: 'RedisTemplate vs StringRedisTemplate?', a: 'StringRedisTemplate is a RedisTemplate<String, String> with String serializers for keys and values, so data is readable in redis-cli. RedisTemplate<K, V> can store objects but you should configure serializers. Both provide opsForValue/Hash/List/Set/ZSet.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Cache a slow method getCountryList() that takes 3 seconds (simulate with Thread.sleep). Show that the first call takes about 3 seconds and later calls are instant.',
      hint: 'Annotate with @Cacheable("countries") (no parameters means key = SimpleKey.EMPTY). Measure time with System.currentTimeMillis() in the controller.',
      solution: `@Service
public class CountryService {
    @Cacheable("countries")
    public List<String> getCountryList() {
        try { Thread.sleep(3000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        return List.of("India", "Japan", "Germany", "USA");
    }
}

@RestController
public class CountryController {
    private final CountryService service;
    public CountryController(CountryService service) { this.service = service; }

    @GetMapping("/api/countries")
    public Map<String, Object> countries() {
        long start = System.currentTimeMillis();
        List<String> list = service.getCountryList();
        return Map.of("countries", list, "timeMs", System.currentTimeMillis() - start);
    }
}
// 1st call: {"countries":[...],"timeMs":3004}
// 2nd call: {"countries":[...],"timeMs":0}
// (Map.of JSON key order may differ.) Remember @EnableCaching on the main class.`,
    },
    {
      task: 'Add a findAll() method cached in "productList" and make sure create/update/delete keep both caches ("products" and "productList") correct.',
      hint: 'Use @Caching(put = ..., evict = ...) to update one entry and clear the list cache.',
      solution: `@Cacheable(value = "productList")
public List<Product> findAll() { return repo.findAll(); }

@Caching(
    put   = { @CachePut(value = "products", key = "#result.id") },
    evict = { @CacheEvict(value = "productList", allEntries = true) })
public Product create(Product p) { return repo.save(p); }

@Caching(
    put   = { @CachePut(value = "products", key = "#result.id") },
    evict = { @CacheEvict(value = "productList", allEntries = true) })
public Product update(Long id, Product data) {
    Product p = repo.findById(id).orElseThrow();
    p.setName(data.getName());
    p.setPrice(data.getPrice());
    return repo.save(p);
}

@Caching(evict = {
    @CacheEvict(value = "products", key = "#id"),
    @CacheEvict(value = "productList", allEntries = true) })
public void delete(Long id) { repo.deleteById(id); }`,
    },
    {
      task: 'Build a simple rate limiter with StringRedisTemplate: allow at most 5 requests per minute per IP on GET /api/limited, otherwise return 429 Too Many Requests.',
      hint: 'Key "rate:" + ip; increment(); if the result is 1, set expire 60 seconds.',
      solution: `@RestController
public class LimitedController {
    private final StringRedisTemplate redis;
    public LimitedController(StringRedisTemplate redis) { this.redis = redis; }

    @GetMapping("/api/limited")
    public ResponseEntity<String> limited(HttpServletRequest request) {
        String key = "rate:" + request.getRemoteAddr();
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, Duration.ofSeconds(60));   // window starts on first request
        }
        if (count != null && count > 5) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Too many requests, try after a minute");
        }
        return ResponseEntity.ok("Request " + count + " of 5 allowed");
    }
}
// Requests 1-5: 200 "Request N of 5 allowed"; request 6: 429`,
    },
    {
      task: 'Write a plain Java program that simulates TTL: put "otp" with TTL 5 at time 0, and print the value when reading at times 3 and 6 (use a fake clock variable instead of real time).',
      hint: 'Store expiry time = now + ttl in a second map; when reading, if now >= expiry remove the key and return null.',
      solution: `import java.util.*;

public class Main {
    static Map<String, String> data = new HashMap<>();
    static Map<String, Integer> expiry = new HashMap<>();
    static int now = 0;   // fake clock in seconds

    static void set(String key, String value, int ttl) {
        data.put(key, value);
        expiry.put(key, now + ttl);
    }

    static String get(String key) {
        Integer exp = expiry.get(key);
        if (exp != null && now >= exp) {
            data.remove(key);
            expiry.remove(key);
            return null;
        }
        return data.get(key);
    }

    public static void main(String[] args) {
        set("otp", "482913", 5);
        now = 3;
        System.out.println("t=3 -> " + get("otp"));
        now = 6;
        System.out.println("t=6 -> " + get("otp"));
    }
}
/* Output:
t=3 -> 482913
t=6 -> null
*/`,
    },
  ],
  quiz: [
    { question: 'Which annotation enables Spring\'s caching annotations?', options: ['@EnableCache', '@EnableCaching', '@CacheEnabled', '@Caching'], answer: 1, explanation: '@EnableCaching switches on the cache interceptor. @Caching is for grouping several cache annotations.' },
    { question: 'Which annotation ALWAYS executes the method and then stores the result?', options: ['@Cacheable', '@CacheEvict', '@CacheConfig', '@CachePut'], answer: 3, explanation: '@CachePut never skips the method; it is used to refresh the cache after updates.' },
    { question: 'In Spring Boot 3, which property sets the Redis host?', options: ['spring.data.redis.host', 'spring.redis.host', 'redis.server.host', 'spring.cache.redis.host'], answer: 0, explanation: 'Boot 3 moved Redis properties to spring.data.redis.*. spring.redis.* was Boot 2.' },
    { question: 'With the default RedisCacheManager, how does the key look for cache "products" and id 7?', options: ['products:7', 'products-7', 'products::7', '7::products'], answer: 2, explanation: 'Spring uses the prefix cacheName:: by default, so the key is products::7.' },
    { question: 'A user updates a product but still sees the old price for a long time. What is the most likely cause?', options: ['Redis is too slow', 'The update method has no @CacheEvict/@CachePut and the cache has no TTL', '@EnableCaching is on the main class', 'StringRedisSerializer is used for keys'], answer: 1, explanation: 'Stale data happens when writes do not evict/refresh the cache; a TTL limits how long it lasts.' },
  ],
};
