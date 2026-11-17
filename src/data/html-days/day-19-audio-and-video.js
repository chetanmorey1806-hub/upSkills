export default {
  id: 'day-19-audio-and-video',
  title: 'Audio and Video Tags: <audio>, <video>, <source>, controls, autoplay, loop, muted',
  module: 'Module 4: Semantic HTML & Advanced Elements',
  day: 19,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "HTML5 made sound and video first-class citizens of the web: no Flash plugin needed. Today you learn the <audio> and <video> elements, multiple <source> formats, and the attributes that control playback, plus the browser autoplay rules that surprise most beginners.",
  objectives: [
    'Add audio and video to a page with <audio> and <video>',
    'Provide multiple formats with <source> and a fallback message',
    'Use controls, autoplay, loop, muted, poster, preload, width and height',
    'Explain browser autoplay policies and add captions with <track>',
  ],
  theory: [
    {
      heading: 'Media before and after HTML5',
      content: "Before HTML5, playing a video needed a plugin like **Adobe Flash** (now dead). HTML5 introduced native `<audio>` and `<video>` elements, so the browser itself plays media, works on phones, and can be controlled with JavaScript.\n\nAnalogy: earlier you needed to carry your own TV into every house; now every house (browser) has a built-in TV.",
    },
    {
      heading: 'The <audio> element',
      content: "`<audio>` embeds sound: music, podcasts, sound effects. Without the `controls` attribute it is **invisible** and you can only play it via JavaScript.",
      syntax: `<audio controls>
  <source src="song.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>`,
      points: [
        'Common formats: MP3 (audio/mpeg) – universal; OGG (audio/ogg); WAV (audio/wav); AAC/M4A',
        'The text inside is fallback content shown only by browsers that do not support <audio>',
      ],
    },
    {
      heading: 'The <video> element',
      content: "`<video>` embeds a video player. Extra attributes compared to audio:\n- `width` / `height`: player size (keep the aspect ratio).\n- `poster`: an image shown before the video plays (like a thumbnail).\n- `playsinline`: on iPhones, play inside the page instead of going full screen.\n\nCommon formats: **MP4 (H.264)** – best support; **WebM** – open, smaller files.",
      syntax: `<video controls width="640" poster="thumb.jpg">
  <source src="movie.webm" type="video/webm">
  <source src="movie.mp4" type="video/mp4">
  <track src="captions-en.vtt" kind="captions" srclang="en" label="English">
  Sorry, your browser does not support video.
</video>`,
    },
    {
      heading: '<source>: multiple formats',
      content: "Not every browser supports every codec. You can list several `<source>` children; the browser picks the **first one it can play**, top to bottom. Always include the `type` attribute so the browser can skip unsupported formats without downloading them.\n\nPut the more efficient format (e.g. WebM) first and the most compatible (MP4) as a backup.",
      tip: 'If you only have one file, you can use src directly on <audio>/<video> instead of <source>.',
    },
    {
      heading: 'Playback attributes (boolean)',
      content: "- `controls`: shows the browser's play/pause, volume, seek bar.\n- `autoplay`: starts playing as soon as possible.\n- `loop`: restarts automatically at the end.\n- `muted`: starts with sound off.\n- `preload`: hint for loading: `none` (nothing), `metadata` (duration, size only), `auto` (whole file).\n\nThese are **boolean attributes**: just writing `loop` turns it on. `loop=\"false\"` still turns it ON!",
      tip: 'Autoplay policy: Chrome, Safari and Firefox block autoplay WITH sound. Autoplay works only together with muted (e.g. background hero videos: autoplay muted loop playsinline).',
    },
    {
      heading: 'Captions with <track> and accessibility',
      content: "`<track>` adds timed text in **WebVTT** (`.vtt`) format. `kind` can be `subtitles` (translation), `captions` (dialogue + sounds for deaf users), `descriptions` or `chapters`. Add `default` to turn one on automatically.\n\nAccessibility checklist: provide captions, never autoplay sound, always give controls, and offer a transcript for audio.",
      syntax: `WEBVTT

00:00:00.000 --> 00:00:03.000
Hello and welcome to the course!`,
    },
  ],
  examples: [
    {
      title: 'Basic audio player with fallback',
      scenario: 'Add a sound clip to a dinosaur facts page.',
      steps: [
        'Create index.html',
        'Add <audio controls> with a <source> of type audio/mpeg',
        'Add a fallback sentence and a download link',
        'Click Run and press play',
      ],
      code: `<audio controls preload="metadata">
  <source src="t-rex-roar.mp3" type="audio/mpeg">
  Your browser does not support audio. <a href="t-rex-roar.mp3">Download it</a>.
</audio>`,
      playground: {
        html: `<h2>T-Rex Roar &#129430;</h2>
<audio id="a" controls preload="metadata">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" type="audio/mpeg">
  Your browser does not support audio.
  <a href="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3">Download the roar</a>.
</audio>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `const a = document.getElementById('a');
a.addEventListener('loadedmetadata', () => console.log('Duration:', a.duration.toFixed(2), 'seconds'));
a.addEventListener('play', () => console.log('Playing...'));`,
      },
      result: 'An audio player with play button, timeline and volume. Console shows the duration once metadata loads, and "Playing..." when you press play.',
      explanation: 'controls makes the player visible. preload="metadata" fetches only the duration, saving bandwidth. The fallback text and link appear only in very old browsers.',
    },
    {
      title: 'Video with poster and multiple sources',
      scenario: 'A product page shows a demo video with a thumbnail.',
      steps: [
        'Add <video controls width="..." poster="...">',
        'Add a WebM <source> first and an MP4 <source> second',
        'Add a fallback message',
        'Click Run; the poster shows until you press play',
      ],
      code: `<video controls width="400" poster="https://picsum.photos/400/225">
  <source src="flower.webm" type="video/webm">
  <source src="flower.mp4" type="video/mp4">
  Your browser does not support HTML video.
</video>`,
      playground: {
        html: `<video id="v" controls width="400" poster="https://picsum.photos/id/1060/400/225" preload="none">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Your browser does not support HTML video.
</video>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
video { max-width: 100%; height: auto; border-radius: 8px; }`,
        js: `const v = document.getElementById('v');
v.addEventListener('loadstart', () => console.log('Chosen source:', v.currentSrc));`,
      },
      result: 'A poster image appears first. When you click play, the flower video plays. The console prints which source the browser chose (usually the .webm).',
      explanation: 'The browser checks the sources top-down and picks the first supported type. poster gives a nice thumbnail; preload="none" avoids downloading until the user plays.',
    },
    {
      title: 'Background-style video: autoplay muted loop',
      scenario: 'A landing page hero section needs a silent looping video that starts automatically.',
      steps: [
        'Add <video autoplay muted loop playsinline>',
        'Do NOT add controls (decorative video)',
        'Overlay a heading with CSS',
        'Click Run',
      ],
      code: `<video autoplay muted loop playsinline>
  <source src="flower.mp4" type="video/mp4">
</video>`,
      playground: {
        html: `<div class="hero">
  <video autoplay muted loop playsinline aria-hidden="true">
    <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
    <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  </video>
  <h1>Spring Collection</h1>
</div>
<button id="toggle">Pause background</button>`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
.hero { position: relative; height: 220px; overflow: hidden; }
.hero video { width: 100%; height: 100%; object-fit: cover; }
.hero h1 { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; color: white; text-shadow: 0 2px 8px #000; }
button { margin: 10px; }`,
        js: `const vid = document.querySelector('.hero video');
document.getElementById('toggle').onclick = () => {
  vid.paused ? vid.play() : vid.pause();
  console.log(vid.paused ? 'Paused' : 'Playing');
};`,
      },
      result: 'A silent, looping flower video fills the hero area behind the white "Spring Collection" heading, starting automatically. The button pauses/resumes it.',
      explanation: 'Browsers allow autoplay only when muted. loop repeats forever; playsinline stops iOS from opening full screen. A pause button is good accessibility practice for moving content.',
    },
    {
      title: 'Captions with <track> using a data URL',
      scenario: 'Add English captions to a video without a separate file.',
      steps: [
        'Write a WebVTT text and encode it as a data URL',
        'Add <track kind="captions" srclang="en" label="English" default>',
        'Click Run, then play the video',
      ],
      code: `<video controls>
  <source src="flower.mp4" type="video/mp4">
  <track kind="captions" srclang="en" label="English" src="captions.vtt" default>
</video>`,
      playground: {
        html: `<video id="cv" controls width="400" crossorigin="anonymous">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
</video>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
video { max-width: 100%; }`,
        js: `const vtt = 'WEBVTT\\n\\n00:00:00.000 --> 00:00:02.500\\nA bee lands on a flower\\n\\n00:00:02.500 --> 00:00:05.000\\nIt collects nectar';
const track = document.createElement('track');
track.kind = 'captions';
track.srclang = 'en';
track.label = 'English';
track.default = true;
track.src = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(vtt);
document.getElementById('cv').appendChild(track);
console.log('Caption track added');`,
      },
      result: 'When the video plays, captions "A bee lands on a flower" then "It collects nectar" appear at the bottom.',
      explanation: 'In a real project you write <track src="captions.vtt"> in HTML. Here JavaScript creates the same <track> with a data: URL because the playground has no files. default makes the captions show automatically.',
    },
  ],
  interview: [
    { q: 'How do you embed audio and video in HTML5?', a: 'With the <audio> and <video> elements, using src or child <source> elements, typically with the controls attribute.', level: 'Easy' },
    { q: 'Why use multiple <source> elements?', a: 'Different browsers support different codecs. The browser plays the first source whose type it supports, so listing WebM and MP4 maximises compatibility.', level: 'Easy' },
    { q: 'Why does autoplay not work on my video?', a: 'Modern browsers block autoplay with sound. Add muted (and playsinline for iOS) to allow autoplay.', level: 'Medium' },
    { q: 'What does the poster attribute do?', a: 'Shows an image before the video starts playing (or while it loads).', level: 'Easy' },
    { q: 'What are the values of preload?', a: 'none (load nothing), metadata (only duration/dimensions), auto (browser may download the whole file). It is only a hint.', level: 'Medium' },
    { q: 'What is the <track> element?', a: 'A child of audio/video that provides timed text tracks (subtitles, captions, chapters, descriptions) in WebVTT format.', level: 'Medium' },
    { q: 'Difference between subtitles and captions?', a: 'Subtitles translate dialogue for viewers who can hear but do not understand the language. Captions transcribe dialogue and important sounds for deaf/hard-of-hearing viewers.', level: 'Hard' },
    { q: 'What happens if you write loop="false"?', a: 'Looping is still ON, because loop is a boolean attribute: presence means true. Remove the attribute to disable it.', level: 'Medium' },
    { q: 'What is the fallback content inside <video>?', a: 'Content between the tags (excluding source/track) that only browsers not supporting <video> display, e.g. a download link.', level: 'Easy' },
    { q: 'How can JavaScript control a video?', a: 'Via the HTMLMediaElement API: play(), pause(), currentTime, volume, muted, paused, duration, and events like play, pause, ended, timeupdate.', level: 'Medium' },
  ],
  practice: [
    { task: 'Add an audio player for a podcast (podcast.mp3 and podcast.ogg) with a fallback download link.', hint: 'Two sources with type attributes.', solution: `<audio controls preload="metadata">
  <source src="podcast.mp3" type="audio/mpeg">
  <source src="podcast.ogg" type="audio/ogg">
  <a href="podcast.mp3">Download the podcast</a>
</audio>` },
    { task: 'Embed a 640px wide video with a poster image, controls and both WebM and MP4 sources.', hint: 'poster on <video>.', solution: `<video controls width="640" poster="https://picsum.photos/640/360">
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  Your browser does not support video.
</video>` },
    { task: 'Create a looping muted autoplaying GIF-style video clip.', hint: 'autoplay muted loop playsinline.', solution: `<video autoplay muted loop playsinline width="300">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
</video>` },
    { task: 'Build custom Play and Pause buttons for an audio element (no controls attribute).', hint: 'Use audio.play() and audio.pause().', solution: `<audio id="s" src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"></audio>
<button onclick="document.getElementById('s').play()">Play</button>
<button onclick="document.getElementById('s').pause()">Pause</button>` },
  ],
  quiz: [
    { question: 'Which attribute shows the play/pause UI?', options: ['play', 'controls', 'show', 'player'], answer: 1, explanation: 'controls displays the browser default media controls.' },
    { question: 'Autoplay is generally allowed when the video is also:', options: ['looped', 'muted', 'preloaded', 'hidden'], answer: 1, explanation: 'Browsers allow muted autoplay only.' },
    { question: 'Which element provides captions?', options: ['<caption>', '<subtitle>', '<track>', '<text>'], answer: 2, explanation: '<track> loads WebVTT text tracks.' },
    { question: 'With several <source> elements the browser plays:', options: ['The first one it supports', 'The last one', 'All of them in order', 'A random one'], answer: 0, explanation: 'Sources are tried top to bottom.' },
    { question: 'The image shown before a video plays is set with:', options: ['thumbnail', 'cover', 'img', 'poster'], answer: 3, explanation: 'poster="image.jpg".' },
  ],
};
