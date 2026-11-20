export default {
  lesson: 'day-16-rabbitmq-messaging-basics',
  minutes: 25,
  intro: 'Practise RabbitMQ concepts: exchanges and routing, acknowledgements, durability, prefetch and dead-letter queues with RabbitMQ.Client.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'When a student registers, the email, library and hostel services must ALL receive a copy of the event. The routing key does not matter. Which exchange type fits?',
      options: ['Direct', 'Fanout', 'Topic with binding key "student"', 'The default exchange'],
      answer: 1,
      explain: 'A fanout exchange copies every message to all bound queues and ignores the routing key - classic publish/subscribe. Direct needs an exact key per queue, and the default exchange delivers to exactly one queue (the one named like the routing key).',
    },
    {
      type: 'output',
      mins: 6,
      q: `A topic exchange has three bindings: \`q-pune\` = \`pune.#\`, \`q-cancel\` = \`*.*.cancelled\`, \`q-food\` = \`*.food.*\`. The program below prints which queues receive each routing key. Write the exact output.`,
      example: { title: 'wildcards', text: '* matches exactly ONE word. # matches ZERO or more words. Words are separated by dots.' },
      code: `using System;
using System.Linq;

var bindings = new[] { ("q-pune", "pune.#"), ("q-cancel", "*.*.cancelled"), ("q-food", "*.food.*") };
string[] keys = { "pune.food.delivered", "mumbai.grocery.cancelled", "pune.cancelled", "delhi.food.ordered.late" };

foreach (var key in keys)
{
    var queues = bindings.Where(b => TopicMatch(b.Item2.Split('.'), 0, key.Split('.'), 0))
                         .Select(b => b.Item1).ToList();
    Console.WriteLine($"{key} -> {(queues.Count == 0 ? "dropped" : string.Join(", ", queues))}");
}

bool TopicMatch(string[] p, int i, string[] w, int j)
{
    if (i == p.Length) return j == w.Length;
    if (p[i] == "#") return TopicMatch(p, i + 1, w, j) || (j < w.Length && TopicMatch(p, i, w, j + 1));
    if (j == w.Length) return false;
    return (p[i] == "*" || p[i] == w[j]) && TopicMatch(p, i + 1, w, j + 1);
}`,
      expected: `pune.food.delivered -> q-pune, q-food
mumbai.grocery.cancelled -> q-cancel
pune.cancelled -> q-pune
delhi.food.ordered.late -> dropped`,
      explain: 'pune.food.delivered starts with pune (pune.#) and has food as the middle of exactly three words (*.food.*). mumbai.grocery.cancelled has three words ending in cancelled. pune.cancelled has only two words, so *.*.cancelled does not match, but pune.# does. delhi.food.ordered.late has four words: *.food.* needs exactly three, so nothing matches and the message is dropped.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which settings are needed so that queued order messages **survive a RabbitMQ broker restart**? Select all that apply.',
      options: [
        'Declare the queue with durable: true',
        'Publish messages with BasicProperties { Persistent = true }',
        'Consume with autoAck: true',
        'Declare the queue with exclusive: true',
        'Declare the exchange (if you use your own) as durable'
      ],
      answers: [0, 1, 4],
      explain: 'Durable exchanges and queues keep their definitions after a restart, and persistent messages (delivery mode 2) are written to disk. autoAck affects consumer safety, not broker restarts, and exclusive queues are deleted when their connection closes.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The consumer finished creating the invoice. Tell RabbitMQ it can delete the message. Complete the call:
\`await channel.______(ea.DeliveryTag, multiple: false);\``,
      example: { title: 'when processing fails', code: 'await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);' },
      accept: ['BasicAckAsync'],
      caseSensitive: true,
      explain: 'With autoAck: false the message stays "unacked" until BasicAckAsync is called. Ack only AFTER the work is done: if the consumer crashes before that, RabbitMQ redelivers the message. In RabbitMQ.Client 7 all channel methods are async (BasicAckAsync); version 6 used BasicAck.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A message with invalid JSON keeps failing. The consumer calls `BasicNackAsync(tag, false, requeue: true)`. What happens?',
      options: [
        'RabbitMQ deletes it after 3 tries',
        'It loops forever: it is redelivered and fails again, wasting CPU and blocking other messages',
        'It is moved to a dead-letter queue automatically',
        'The producer receives an error'
      ],
      answer: 1,
      explain: 'RabbitMQ has no built-in retry limit for classic queues: requeue: true puts the poison message back and it is redelivered immediately, over and over. Nack with requeue: false and configure x-dead-letter-exchange so it lands in a dead-letter queue for inspection.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare the "orders" queue so that rejected messages go to the exchange "orders.dlx". Complete the queue argument name:
\`arguments: new Dictionary<string, object?> { ["______"] = "orders.dlx" }\``,
      example: { title: 'other queue arguments', code: '["x-message-ttl"] = 60000\n["x-max-length"] = 10000\n["x-queue-type"] = "quorum"' },
      accept: ['x-dead-letter-exchange'],
      explain: 'x-dead-letter-exchange tells RabbitMQ where to re-publish messages that are rejected with requeue: false, expire (TTL) or overflow the queue. Bind a dead-letter queue (e.g. orders.dead) to that exchange to keep them.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You start RabbitMQ with `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:4-management`. Which port does your .NET ConnectionFactory use by default?',
      options: ['15672', '5672', '6379', '8080'],
      answer: 1,
      explain: '5672 is the AMQP port used by client libraries such as RabbitMQ.Client and MassTransit. 15672 is the management web UI from the -management image, 6379 is Redis, and 8080 is the default ASP.NET Core container port.',
    },
  ],
};
