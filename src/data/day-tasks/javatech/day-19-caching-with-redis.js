export default {
  lesson: 'day-19-caching-with-redis',
  minutes: 22,
  intro: 'Use the Spring Cache abstraction with Redis: predict cache hits and misses, set TTLs and use RedisTemplate for counters and OTPs.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: '`@Cacheable` methods are still hitting the database every time. Which annotation is missing on a configuration class?',
      example: { title: 'the starter for Redis', code: '<artifactId>spring-boot-starter-data-redis</artifactId>' },
      accept: ['@EnableCaching'],
      explain: 'Caching annotations do nothing until `@EnableCaching` switches on the cache proxy. Also remember: calls from inside the same class (self-invocation) bypass the proxy, so they are not cached.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The cache starts empty. What does this sequence print? (only the println lines, in order)',
      example: { title: 'cache hit vs miss', text: 'On a hit Spring returns the cached value and the method body does NOT run.' },
      code: `@Cacheable(value = "products", key = "#id")
public Product get(Long id) {
    System.out.println("DB call " + id);
    return repo.findById(id).orElseThrow();
}

@CacheEvict(value = "products", key = "#id")
public void update(Long id, Product p) { repo.save(p); }

// called from a controller (through the proxy):
service.get(1L);
service.get(1L);
service.get(2L);
service.update(1L, changed);
service.get(1L);
service.get(2L);`,
      expected: 'DB call 1\nDB call 2\nDB call 1',
      explain: 'First get(1) is a miss (prints), the second is a hit. get(2) is a miss. `update` **evicts** key 1, so the next get(1) misses again and reloads fresh data. get(2) is still cached.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between `@Cacheable` and `@CachePut`?',
      options: [
        'They are the same',
        '@Cacheable skips the method on a cache hit; @CachePut always runs the method and stores the result in the cache',
        '@CachePut deletes the cache entry',
        '@Cacheable only works with Redis',
      ],
      answer: 1,
      explain: 'Use `@Cacheable` on reads, `@CachePut` on updates that return the new value (keeps the cache fresh), and `@CacheEvict` on deletes (or `allEntries = true` to clear a whole cache).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Which property (key only) sets a default **time-to-live** for all Redis cache entries, e.g. `10m`?',
      example: { title: 'Redis connection', code: 'spring.data.redis.host=localhost\nspring.data.redis.port=6379' },
      accept: ['spring.cache.redis.time-to-live'],
      explain: '`spring.cache.redis.time-to-live=10m` makes entries expire after 10 minutes, so stale data cannot stay forever. Without a TTL, data changed outside your app would be served from the cache indefinitely.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Store an OTP for 5 minutes with `StringRedisTemplate`. Complete the method name:\n```\nredis.???().set("otp:" + phone, otp, Duration.ofMinutes(5));\n```',
      example: { title: 'a counter', code: 'Long views = redis.opsForValue().increment("views:product:7");' },
      accept: ['opsForValue'],
      caseSensitive: true,
      explain: '`opsForValue()` works with simple string keys/values (Redis SET/GET/INCR). The `Duration` argument sets the key\'s expiry (like `SET key value EX 300`), so the OTP disappears automatically. Other ops: `opsForHash`, `opsForList`, `opsForSet`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about caching are TRUE? (choose all that apply)',
      options: [
        'Cache-aside: read from cache, on a miss load from the DB and put the result in the cache',
        'Good cache candidates are read-often, change-rarely data like product catalogues',
        'Cached objects stored in Redis must be serialisable (e.g. JSON via GenericJackson2JsonRedisSerializer)',
        'Caching bank balances forever with no eviction is a good idea',
        'Redis is an in-memory key-value store and can be shared by many app instances',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Cache-aside is what `@Cacheable` does. Redis is shared by all instances (unlike a local HashMap). Fast-changing, critical data needs eviction/TTL or should not be cached at all - stale balances are dangerous.',
    },
  ],
};
