// Сборка salmark.kz: статические страницы в public/. Запуск: node tools/build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SITE = 'https://salmark.kz';
const TODAY = new Date().toISOString().slice(0, 10);
const LEGAL = 'ТОО «HOSHIN KANRI», БИН\u00a0201140020804, г.\u00a0Астана';

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nb = s => String(s).replace(/(^|[\s«(>])([а-яёА-ЯЁA-Za-z]{1,2}|г\.)\s/g, '$1$2\u00a0').replace(/\s—/g, '\u00a0—');
const nbH = html => html.replace(/<(h2|h3)>(.*?)<\/\1>/g, (m, t, x) => `<${t}>${nb(x)}</${t}>`);
const strip = s => String(s).replace(/<[^>]+>/g, '');

const SERVICES = [
  { slug: 'razrabotka-mobilnyh-prilozhenij', nav: 'Приложения', short: 'Мобильные приложения' },
  { slug: 'razrabotka-ii-botov', nav: 'ИИ-боты', short: 'ИИ-боты и ассистенты' },
  { slug: 'avtomatizaciya-biznesa', nav: 'Автоматизация', short: 'Автоматизация бизнеса' },
  { slug: 'razrabotka-crm', nav: 'CRM', short: 'Разработка CRM' },
];
const CASES = [
  { slug: 'kanri', name: 'Kanri' },
  { slug: 'zor-qadam', name: 'ZOR QADAM' },
  { slug: 'repstone', name: 'Repstone' },
];

const ORG = {
  '@type': 'ProfessionalService',
  '@id': SITE + '/#org',
  name: 'Salmark',
  legalName: 'ТОО «HOSHIN KANRI»',
  url: SITE + '/',
  logo: SITE + '/assets/salmark-512.png',
  image: SITE + '/assets/og-salmark.jpg',
  description: 'IT-студия в Астане: разработка мобильных приложений для iOS и Android, ИИ-ботов, автоматизация бизнеса и CRM.',
  address: { '@type': 'PostalAddress', addressLocality: 'Астана', addressCountry: 'KZ' },
  areaServed: { '@type': 'Country', name: 'Казахстан' },
  knowsAbout: ['Разработка мобильных приложений', 'iOS', 'Android', 'ИИ-боты', 'Чат-боты для WhatsApp', 'CRM', 'Автоматизация бизнес-процессов'],
  taxID: '201140020804',
};

const crumbsLd = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: SITE + it[1] })),
});
const faqLd = faq => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
});

// ---------- общие куски ----------
function head({ path, title, description, ld = [], og = '/assets/og-salmark.jpg', noindex = false }) {
  const graph = { '@context': 'https://schema.org', '@graph': [ORG, { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'Salmark', inLanguage: 'ru' }, ...ld] };
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE}${path}">`}
<meta name="theme-color" content="#0c0c0d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Salmark">
<meta property="og:locale" content="ru_RU">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/salmark-64.png" sizes="64x64" type="image/png">
<link rel="apple-touch-icon" href="/assets/salmark-180.png">
<link rel="preload" href="/assets/fonts/geologica-800-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/golostext-400-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<script>(function(r){if('IntersectionObserver'in window){r.classList.add('js');setTimeout(function(){if(!window.SM)r.classList.remove('js')},3500)}})(document.documentElement)</script>
<link rel="stylesheet" href="/assets/site.css?v=${TODAY}">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
<a class="skip" href="#main">К содержанию</a>`;
}

function header(active = '') {
  const link = (href, label) => `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="bar">
  <div class="wrap">
    <a class="logo" href="/" aria-label="Salmark — на главную"><i>S</i>Salmark</a>
    <nav class="nav" aria-label="Основное меню">
      ${SERVICES.map(s => link(`/${s.slug}/`, s.nav)).join('\n      ')}
      ${link('/proekty/', 'Проекты')}
      ${link('/kontakty/', 'Контакты')}
    </nav>
    <a class="btn" href="#form">Обсудить проект</a>
    <button class="burger" aria-label="Меню" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>`;
}

function contact(title = 'Обсудить проект', text = 'Опишите задачу в двух словах — ответим и предложим, с чего начать. Есть ТЗ, пример или ссылка — тоже пишите.') {
  const opts = ['Приложение', 'ИИ-бот', 'CRM', 'Автоматизация', 'Другое'];
  return `<section class="contact" id="form" aria-labelledby="form-h">
  <div class="wrap">
    <div class="rv">
      <h2 class="d h2" id="form-h">${title}</h2>
      <p>${text}</p>
      <p>Мы в Астане и работаем со всем Казахстаном — созвоны и показы онлайн.</p>
    </div>
    <form id="lead" class="rv" novalidate>
      <input type="hidden" name="_subject" value="Salmark — заявка с сайта">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label>Имя <small>(необязательно)</small> <input name="name" autocomplete="name" maxlength="80"></label>
      <label>Телефон или почта <small>— обязательно</small> <input name="contact" required autocomplete="tel" maxlength="120" inputmode="text"></label>
      <fieldset class="chk"><legend>Что нужно</legend>
        ${opts.map(o => `<label><input type="checkbox" name="what" value="${o}"><span>${o}</span></label>`).join('\n        ')}
      </fieldset>
      <label>Задача <textarea name="message" maxlength="4000" placeholder="Например: приложение для записи клиентов, iPhone и Android"></textarea></label>
      <button class="btn" type="submit">Отправить заявку ${ARROW}</button>
      <p class="status" id="leadStatus" role="status" aria-live="polite"></p>
      <p class="note">Отправляя заявку, вы соглашаетесь с <a href="/privacy/">политикой конфиденциальности</a>.</p>
    </form>
  </div>
</section>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="logo" href="/"><i>S</i>Salmark</a>
        <p class="muted" style="max-width:34ch;margin:16px 0 0">IT-студия в Астане: мобильные приложения, ИИ-боты, автоматизация и CRM.</p>
        <p class="legal">${LEGAL}</p>
      </div>
      <div><h4>Услуги</h4><ul>${SERVICES.map(s => `<li><a href="/${s.slug}/">${s.short}</a></li>`).join('')}</ul></div>
      <div><h4>Проекты</h4><ul>${CASES.map(c => `<li><a href="/proekty/${c.slug}/">${c.name}</a></li>`).join('')}</ul></div>
      <div><h4>Компания</h4><ul><li><a href="/kontakty/">Контакты</a></li><li><a href="/privacy/">Политика конфиденциальности</a></li></ul></div>
    </div>
    <div class="word" aria-hidden="true">Salmark</div>
  </div>
</footer>
<a class="btn fab" href="#form">Обсудить проект</a>
<script src="/assets/site.js?v=${TODAY}" defer></script>
</body>
</html>
`;
}

const page = (meta, body, active) => head(meta) + '\n' + header(active) + '\n<main id="main">\n' + body + '\n</main>\n' + contact(meta.formTitle, meta.formText) + '\n' + footer();

function write(path, html) {
  const file = join(OUT, path, path.endsWith('.html') ? '' : 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const faqBlock = (faq, title = 'Частые вопросы') => `<section aria-labelledby="faq-h"><div class="wrap">
  <h2 class="d h2 rv" id="faq-h">${nb(title)}</h2>
  <div class="faq rv">
    ${faq.map(([q, a]) => `<details><summary>${nb(q)}</summary><p>${a}</p></details>`).join('\n    ')}
  </div>
</div></section>`;

const crumbs = items => `<ol class="crumbs mono">${items.map(([n, h], i) => i === items.length - 1 ? `<li aria-current="page">${n}</li>` : `<li><a href="${h}">${n}</a></li>`).join('')}</ol>`;

// ---------- проекты (общие для главной и страниц) ----------
const CASE_CARDS = {
  kanri: `<a class="case kanri rv" href="/proekty/kanri/">
    <div>
      <span class="mono">CRM · веб и iPhone · ИИ</span>
      <h3>Kanri</h3>
      <p>Программа для салонов, студий и клиник: расписание, клиенты, касса, зарплата, склад и медкарта. Работает в браузере и на iPhone, переписка с клиентами — прямо в карточке.</p>
      <ul>
        <li>WhatsApp-напоминания о записи — ответ клиента сам меняет статус</li>
        <li>Айя — ИИ-администратор: записывает только на свободное время</li>
        <li>Бланки анализов на казахском и русском с QR-проверкой</li>
      </ul>
      <span class="more">Как устроен проект ${ARROW}</span>
    </div>
    <div class="pics mix">
      <img class="wide" src="/assets/work/kanri-schedule.webp" width="1600" height="608" loading="lazy" alt="Расписание Kanri: записи по специалистам на день, статусы и оплаты">
      <img src="/assets/work/kanri-chat.webp" width="620" height="1342" loading="lazy" alt="Переписка с клиентом в WhatsApp внутри Kanri">
    </div>
  </a>`,
  'zor-qadam': `<a class="case zq rv" href="/proekty/zor-qadam/">
    <div>
      <span class="mono">Приложение · iPhone и Android</span>
      <h3>ZOR QADAM</h3>
      <p>Приложение лечебной физкультуры для центра реабилитации в Астане: короткие занятия при болях в спине и суставах, уроки и дневник боли.</p>
      <ul>
        <li>Нативно: SwiftUI на iPhone, Kotlin и Compose на Android</li>
        <li>Казахский и русский языки</li>
        <li>При тревожных симптомах приложение направляет к специалисту</li>
      </ul>
      <span class="more">Как устроен проект ${ARROW}</span>
    </div>
    <div class="pics">
      <img src="/assets/work/zq-01.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран «Сегодня» с прогрессом занятий">
      <img src="/assets/work/zq-02.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран приложения">
    </div>
  </a>`,
  repstone: `<a class="case rs rv" href="/proekty/repstone/">
    <div>
      <span class="mono">Приложение · iPhone и Android</span>
      <h3>Repstone</h3>
      <p>Бесплатный журнал тренировок: подход записывается одним касанием, программа собирается по пяти вопросам.</p>
      <ul>
        <li>Работает без интернета, регистрации и рекламы</li>
        <li>Свой каталог упражнений с рисунками</li>
        <li>Русский, казахский и английский</li>
      </ul>
      <span class="more">Как устроен проект ${ARROW}</span>
    </div>
    <div class="pics">
      <img src="/assets/work/rs-01.webp" width="660" height="1434" loading="lazy" alt="Repstone: первый экран приложения">
      <img src="/assets/work/rs-02.webp" width="660" height="1434" loading="lazy" alt="Repstone: экран тренировки">
    </div>
  </a>`,
};

// ---------- главная ----------
const homeFaq = [
  ['Сколько стоит разработка приложения?', 'Зависит от объёма: сколько экранов и платформ, нужен ли сервер, какие интеграции. После разговора и прототипа называем цену и сроки по этапам — видно, за что вы платите.'],
  ['Сколько времени занимает разработка?', 'Сроки называем вместе с ценой, после прототипа. Работаем этапами: каждый заканчивается версией, которую можно открыть на своём телефоне.'],
  ['Вы работаете только в Астане?', 'Нет. Мы в Астане, но работаем со всем Казахстаном: созвоны, показы и тестовые сборки — онлайн.'],
  ['Можно начать с небольшого?', 'Да, и часто так разумнее: прототип, один ИИ-бот или одна автоматизация. Дальше развиваем то, что сработало.'],
  ['Поможете опубликовать приложение в App Store и Google Play?', 'Да, публикацию берём на себя: карточки, скриншоты, прохождение проверки, ответы на замечания Apple и Google. Аккаунт разработчика лучше оформить на вашу компанию — подскажем как.'],
  ['CRM: делать свою или взять готовую?', 'Если у вас запись клиентов — салон, клиника, студия, — быстрее и дешевле начать с нашей <a href="https://kanri.kz" rel="noopener">Kanri</a>. Своя CRM нужна, когда процессы нестандартные. Скажем честно, что выгоднее.'],
];

write('', page({
  path: '/',
  title: 'Разработка приложений, ИИ-ботов и CRM в Казахстане — Salmark',
  description: 'Студия Salmark в Астане: приложения для iPhone и Android, чат-боты с ИИ для WhatsApp и Telegram, CRM и автоматизация. Работаем по всему Казахстану.',
  ld: [faqLd(homeFaq)],
}, `<section class="hero" aria-labelledby="h1">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <div>
      <p class="mono">IT-студия · Астана · весь Казахстан</p>
      <h1 class="d" id="h1"><span class="ln"><span>Приложения,</span></span><span class="ln"><span>ИИ-боты и CRM</span></span><span class="ln"><span class="ac">для бизнеса</span></span></h1>
      <p class="lead">Сами сделали и ведём CRM Kanri и приложения ZOR QADAM и Repstone. Ваш проект начнём с прототипа, который можно открыть на телефоне.</p>
      <div class="acts"><a class="btn" href="#form">Обсудить проект ${ARROW}</a><a class="btn ghost" href="#work">Наши проекты</a></div>
    </div>
    <div class="stack" aria-hidden="true">
      <div class="card k kanri-frame"><b>Kanri</b><img src="/assets/work/kanri-ios.webp" width="620" height="1342" alt=""></div>
      <div class="card z"><img src="/assets/work/zq-01.webp" width="660" height="1434" alt="" fetchpriority="high"></div>
      <div class="card s"><img src="/assets/work/rs-01.webp" width="660" height="1434" alt="" fetchpriority="high"></div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="tr">${(() => { const w = ['Kanri', 'ZOR QADAM', 'Repstone', 'iPhone', 'Android', 'WhatsApp', 'Telegram', 'Казахский и русский']; const s = w.map(x => `<span>${x}</span>`).join(''); return s + s; })()}</div></div>

<section aria-labelledby="svc-h">
  <div class="wrap">
    <h2 class="d h2 rv" id="svc-h">Что делаем</h2>
    <div class="svc">
      <a class="rv" href="/razrabotka-mobilnyh-prilozhenij/"><span class="go">${ARROW}</span><div><h3>Мобильные приложения</h3><p>Для iPhone и Android. Сами проходим проверку App Store и Google Play. Обновления после запуска — по отдельному договору.</p></div><div class="tags"><b>iPhone</b><b>Android</b><b>Публикация</b><b>Обновления</b></div></a>
      <a class="rv" href="/razrabotka-ii-botov/"><span class="go">${ARROW}</span><div><h3>ИИ-боты</h3><p>Отвечают клиентам в WhatsApp и Telegram и записывают на свободное время. Цены берут из вашего прайса, а чего не знают, передают администратору.</p></div><div class="tags"><b>WhatsApp</b><b>Telegram</b><b>Запись</b><b>Ответы 24/7</b></div></a>
      <a class="rv" href="/avtomatizaciya-biznesa/"><span class="go">${ARROW}</span><div><h3>Автоматизация</h3><p>Клиенту уходит напоминание о записи. Если он не пришёл, администратор получает задачу перезвонить. Данные между программами переносятся сами.</p></div><div class="tags"><b>Напоминания</b><b>Задачи</b><b>Связь программ</b></div></a>
      <a class="rv" href="/razrabotka-crm/"><span class="go">${ARROW}</span><div><h3>CRM</h3><p>Салону или клинике подойдёт наша Kanri. Если процессы у вас свои, сделаем CRM под них. Базу перенесём, сотрудников научим.</p></div><div class="tags"><b>Воронки</b><b>Расписание</b><b>Касса</b><b>Аналитика</b></div></a>
    </div>
  </div>
</section>

<section id="work" aria-labelledby="work-h">
  <div class="wrap">
    <h2 class="d h2 rv" id="work-h">Что мы уже сделали</h2>
    <p class="sub rv">Kanri, ZOR QADAM и Repstone мы написали сами и ведём до сих пор. По ним видно, как мы работаем: от прототипа до публикации.</p>
    <div class="cases">
      ${CASE_CARDS.kanri}
      ${CASE_CARDS['zor-qadam']}
      ${CASE_CARDS.repstone}
    </div>
  </div>
</section>

<section class="light" aria-labelledby="how-h">
  <div class="wrap">
    <h2 class="d h2 rv" id="how-h">Как работаем</h2>
    <ol class="steps rv">
      <li><h3>Разговор</h3><p>Разбираемся в задаче: кто пользователь, что он должен сделать, как это принесёт деньги.</p></li>
      <li><h3>Прототип</h3><p>Показываем экраны до кода. Кликаете, правите — меняем, пока всё не станет ясно.</p></li>
      <li><h3>Разработка</h3><p>Работаем этапами. В конце каждого ставите свежую версию на свой телефон и проверяете её сами.</p></li>
      <li><h3>Запуск</h3><p>Публикуем в App Store и Google Play, подключаем домен, аналитику и WhatsApp.</p></li>
      <li><h3>Поддержка</h3><p>По отдельному договору: следим за ошибками, обновляем под новые iOS и Android, развиваем дальше.</p></li>
    </ol>
  </div>
</section>

<section aria-labelledby="rules-h">
  <div class="wrap">
    <h2 class="d h2 rv" id="rules-h">Как мы думаем</h2>
    <div class="rules rv">
      <div><h3>Сначала — зачем</h3><p>Не начинаем код, пока не ясно, какую цифру в бизнесе он должен сдвинуть: заявки, записи, время сотрудников.</p></div>
      <div><h3>ИИ без фантазий</h3><p>Бот берёт цены и свободное время из ваших данных. Чего не знает — не придумывает, а передаёт человеку.</p></div>
      <div><h3>Сбои не молчат</h3><p>Каждая автоматизация ведёт журнал. Если сообщение не ушло или связь с WhatsApp оборвалась, система сразу сообщит об этом владельцу.</p></div>
      <div><h3>Данные под контролем</h3><p>Чувствительные данные можно обрабатывать локальными ИИ-моделями — без отправки в облако.</p></div>
    </div>
  </div>
</section>

<section aria-labelledby="tech-h" style="padding-top:0">
  <div class="wrap tech">
    <div class="rv"><h2 class="d h2" id="tech-h">На чём делаем</h2><p class="muted" style="max-width:40ch">На этих инструментах написаны Kanri, ZOR QADAM и Repstone.</p></div>
    <div class="rv">
      <div class="group"><span class="mono">Мобильные</span><div class="chips"><b>Swift</b><b>SwiftUI</b><b>Kotlin</b><b>Jetpack Compose</b><b>Capacitor</b></div></div>
      <div class="group"><span class="mono">Веб и сервер</span><div class="chips"><b>TypeScript</b><b>Next.js</b><b>React</b><b>Node.js</b><b>PostgreSQL</b></div></div>
      <div class="group"><span class="mono">ИИ</span><div class="chips"><b>Claude</b><b>OpenAI</b><b>Локальные модели</b><b>Whisper — речь в текст</b></div></div>
      <div class="group"><span class="mono">Интеграции</span><div class="chips"><b>WhatsApp Cloud API</b><b>Telegram</b><b>Sipuni</b><b>REST API</b><b>Веб-хуки</b></div></div>
    </div>
  </div>
</section>

${faqBlock(homeFaq)}`));

// ---------- услуги ----------
const SVC_PAGES = [
  {
    slug: 'razrabotka-mobilnyh-prilozhenij',
    title: 'Разработка мобильных приложений в Астане — Salmark',
    description: 'Приложения для iPhone и Android: прототип, разработка, публикация в App Store и Google Play, обновления. Астана, работаем по всему Казахстану.',
    h1: 'Разработка мобильных приложений для iPhone и Android',
    lead: 'Приложения для iPhone и Android — нативно или одним кодом на обе платформы. Ведём от прототипа до публикации в App Store и Google Play. Обновления после выхода — по отдельному договору.',
    serviceType: 'Разработка мобильных приложений',
    what: [
      ['От прототипа до магазинов', 'Прототип, дизайн, приложение, сервер, публикация и поддержка. Не нужно отдельно искать дизайнера, программиста и того, кто выложит приложение в App Store.'],
      ['Нативные iOS и Android', 'SwiftUI на iPhone, Kotlin и Jetpack Compose на Android. Когда важны скорость, плавность и возможности системы: виджеты, уведомления, Face ID.'],
      ['Приложение к вашему сервису', 'Если у вас уже есть сайт или личный кабинет, собираем приложение на том же коде. Так быстрее, а поддерживать одну систему дешевле, чем две.'],
      ['Публикация', 'Карточки, скриншоты на трёх языках, прохождение проверки Apple и Google, ответы на отказы.'],
      ['Поддержка после выхода', 'По отдельному договору: обновления под новые версии iOS и Android, разбор падений, новые функции.'],
    ],
    body: `<h2>Нативно или кроссплатформенно</h2>
<p>Нативное приложение пишется отдельно под каждую систему: SwiftUI для iPhone и Kotlin для Android. Оно быстрее, лучше использует возможности телефона и выглядит «своим» на каждой платформе. Так мы сделали <a href="/proekty/zor-qadam/">ZOR QADAM</a> и <a href="/proekty/repstone/">Repstone</a>.</p>
<p>Если у бизнеса уже есть веб-кабинет, разумнее собрать приложение на общем коде. Так устроено приложение <a href="/proekty/kanri/">Kanri</a> для iPhone: те же экраны, что в браузере, плюс пуш-уведомления и замок по Face ID.</p>
<p>Что выбрать — решаем на первом разговоре: зависит от бюджета, сроков и того, насколько приложение должно уметь работать с телефоном.</p>
<h2>Что обычно нужно в приложении</h2>
<ul>
<li>Пуш-уведомления: напоминания, статусы заказов, новые сообщения</li>
<li>Работа без интернета — данные сохраняются на телефоне и синхронизируются позже</li>
<li>Вход по номеру телефона, почте или через Apple и Google</li>
<li>Казахский, русский и английский языки</li>
<li>Оплата внутри приложения и подписки</li>
<li>Связь с вашей CRM, сайтом и WhatsApp</li>
</ul>
<h2>Публикация в App Store и Google Play</h2>
<p>Apple и Google проверяют каждое приложение и могут отклонить его за недочёт в описании, политике конфиденциальности или правах доступа. Мы готовим карточку, скриншоты, тексты и политику заранее и отвечаем на замечания проверки сами.</p>
<p>Аккаунт разработчика лучше оформить на вашу компанию — тогда приложение в магазине выходит под вашим именем. Для медицинских и финансовых приложений Apple требует именно аккаунт организации.</p>`,
    side: `<div class="phones"><img src="/assets/work/zq-01.webp" width="660" height="1434" loading="lazy" alt="Приложение ZOR QADAM на iPhone"><img src="/assets/work/rs-03.webp" width="660" height="1434" loading="lazy" alt="Приложение Repstone на iPhone"></div>`,
    faq: [
      ['Сколько стоит мобильное приложение?', 'Цена зависит от числа экранов, платформ, интеграций и того, нужен ли сервер. После разговора и прототипа называем точную сумму и разбиваем её на этапы.'],
      ['Сколько времени занимает разработка?', 'Сроки называем вместе с ценой. Работаем этапами: в конце каждого вы ставите свежую версию на свой телефон и видите прогресс сами.'],
      ['Можно сразу на iPhone и Android?', 'Да. Нативно — два приложения с общей логикой и одинаковым дизайном; кроссплатформенно — один код на обе системы.'],
      ['Поддерживаете казахский язык?', 'Да. ZOR QADAM и Repstone вышли на казахском с первой версии. Берём шрифты, в которых есть все казахские буквы, и проверяем экраны на длинных казахских словах.'],
      ['Обновления после выхода входят в цену?', 'Нет, это отдельный договор. Вы выбираете, что нужно: обновления под новые iOS и Android, исправления, новые функции.'],
      ['Кто публикует приложение в магазинах?', 'Мы: готовим карточки, скриншоты и тексты, проходим проверку Apple и Google. Аккаунт разработчика лучше оформить на вашу компанию.'],
    ],
  },
  {
    slug: 'razrabotka-ii-botov',
    title: 'Чат-бот для WhatsApp и Telegram с ИИ для бизнеса — Salmark',
    description: 'ИИ-бот отвечает клиентам в WhatsApp и Telegram и записывает на свободное время. Цены берёт из вашего прайса, сложное передаёт администратору.',
    h1: 'Чат-боты с ИИ для WhatsApp и Telegram',
    lead: 'Бот отвечает клиентам в WhatsApp и Telegram днём и ночью и записывает на свободное время. Цены и окна берёт из вашего прайса и расписания. Если в данных нет ответа, вопрос уходит администратору вместе с перепиской.',
    serviceType: 'Разработка ИИ-ботов',
    what: [
      ['ИИ-администратор', 'Отвечает на вопросы о ценах и услугах, подбирает свободное время и записывает клиента в расписание. Так работает Айя в нашей Kanri.'],
      ['ИИ-продавец', 'Ведёт переписку с новыми заявками, отвечает на возражения, мягко напоминает замолчавшим — без спама и рассылок пачкой.'],
      ['Ассистент для команды', 'Отвечает сотрудникам по базе знаний, регламентам и цифрам бизнеса: «сколько записей на завтра», «кто не пришёл».'],
      ['Звонки и голосовые', 'Расшифровка звонков и голосовых сообщений, краткие выжимки и разбор работы администраторов.'],
      ['Каналы', 'WhatsApp: обычный номер по QR-коду или официальный API Meta. Telegram.'],
    ],
    body: `<h2>Почему наш бот не выдумывает</h2>
<p>Главная беда ИИ-ботов — уверенные ответы, которых нет в реальности: несуществующая скидка, занятое время, услуга, которую вы не оказываете. Мы строим ботов так, чтобы цены, услуги и свободные окна бот брал только из ваших данных — прайса, расписания, CRM.</p>
<p>Запись в расписание проверяется программой, а не словами модели: бот не может записать клиента на занятое время. Чего бот не знает — он не сочиняет, а передаёт администратору вместе со всей перепиской.</p>
<h2>Как запускаем бота</h2>
<ul>
<li>Собираем факты: прайс, услуги, правила записи и отмены, частые вопросы</li>
<li>Пишем сценарии и прогоняем бота на тестовых диалогах до запуска</li>
<li>Подключаем канал: WhatsApp или Telegram</li>
<li>Первые недели читаем живые переписки и правим поведение</li>
<li>Показываем отчёт: сколько диалогов, сколько записей, где бот передал человеку</li>
</ul>
<h2>Модели и данные</h2>
<p>Работаем с моделями Claude и OpenAI и подбираем модель под задачу: на простых ответах — быструю и недорогую, на сложных — сильную. Стоимость диалога считаем заранее на ваших объёмах.</p>
<p>Если переписку нельзя отправлять в облако — используем локальные модели на вашем сервере.</p>`,
    side: `<img class="shot" src="/assets/work/kanri-chat.webp" width="620" height="1342" loading="lazy" alt="Переписка с клиентом в WhatsApp: напоминание о записи и подтверждение" style="max-width:320px">`,
    faq: [
      ['Бот будет выдумывать цены и услуги?', 'Нет. Цены, услуги и свободное время бот берёт из ваших данных, а запись проверяет программа. Если ответа нет — вопрос уходит человеку.'],
      ['Можно ли подключить обычный WhatsApp, без официального API?', 'Да. Подключаем и обычный номер по QR-коду, и официальный WhatsApp Business API от Meta. Расскажем, чем они отличаются для вашей задачи.'],
      ['Клиенты поймут, что пишет бот?', 'Бот представляется ИИ-ассистентом и не выдаёт себя за человека. Отвечает на «вы», коротко и по делу — так, как пишет хороший администратор.'],
      ['Бот понимает казахский?', 'Да. Если клиент пишет по-казахски, бот отвечает по-казахски.'],
      ['Сколько стоит содержание бота?', 'Основной расход — оплата ИИ-модели за каждый диалог. Считаем его заранее на ваших объёмах и подбираем модель, чтобы расход был предсказуемым.'],
    ],
  },
  {
    slug: 'avtomatizaciya-biznesa',
    title: 'Автоматизация бизнеса и интеграции в Казахстане — Salmark',
    description: 'Напоминания клиентам в WhatsApp, задачи сотрудникам, обмен данными между CRM, телефонией и сайтом через API. Астана и весь Казахстан.',
    h1: 'Автоматизация бизнеса и интеграции',
    lead: 'Убираем ручную работу. Данные сами переходят между программами, напоминания и отчёты уходят вовремя, задача сама появляется у нужного сотрудника.',
    serviceType: 'Автоматизация бизнес-процессов',
    what: [
      ['Сначала — карта процесса', 'Смотрим, где теряются клиенты и часы сотрудников, и автоматизируем то, что окупится, а не всё подряд.'],
      ['Напоминания клиентам', 'Сообщения в WhatsApp о записи — при записи, за сутки и за два часа. Ответ «подтверждаю» или «отмена» сам меняет статус.'],
      ['Задачи и контроль', 'Клиент не пришёл — администратор получает задачу перезвонить. День рождения — клиенту уходит поздравление.'],
      ['Интеграции', 'Связываем CRM, телефонию, сайт, мессенджеры и таблицы через API и веб-хуки.'],
      ['Отчёты', 'Сводка владельцу в Telegram или на почту: выручка, записи, неявки — без ручного сбора цифр.'],
    ],
    body: `<h2>Что мы уже автоматизировали</h2>
<p>Все примеры ниже уже работают в нашей <a href="/proekty/kanri/">Kanri</a>:</p>
<ul>
<li>Напоминания о записи в WhatsApp с подтверждением ответом клиента</li>
<li>Задача администратору, когда клиент не пришёл</li>
<li>Поздравление с днём рождения в WhatsApp и бонус по правилам клиники</li>
<li>Списание расходников со склада при оплате услуги</li>
<li>Расчёт зарплаты специалистов по проценту или ставке</li>
<li>Записи звонков из телефонии Sipuni — с расшифровкой и оценкой разговора</li>
<li>Отправка готовых анализов пациенту в WhatsApp со ссылкой на бланк</li>
</ul>
<h2>С чем связываем</h2>
<p>WhatsApp (обычный номер и официальный API Meta), Telegram, телефония Sipuni, сайты и формы заявок, Google Таблицы, почта. Если у программы есть API или веб-хуки — подключим и её.</p>
<h2>Как считаем пользу</h2>
<p>До работы фиксируем, сколько времени и денег уходит на процесс сейчас: сколько неявок, сколько часов администратор тратит на звонки, сколько заявок теряется. После запуска сравниваем с тем же показателем.</p>`,
    side: `<img class="shot" src="/assets/work/kanri-analytics.webp" width="620" height="1342" loading="lazy" alt="Аналитика бизнеса в приложении Kanri" style="max-width:320px">`,
    faq: [
      ['С чего начать автоматизацию?', 'С одного процесса, где больше всего ручной работы или потерь: обычно это напоминания клиентам и обработка заявок. Он окупается быстрее всего.'],
      ['Нужно ли менять наши программы?', 'Не обязательно. Если у программы есть API, веб-хуки или выгрузка — связываем то, что у вас уже есть.'],
      ['Что если что-то сломается?', 'Делаем так, чтобы каждая автоматизация вела журнал и сообщала об ошибке: сбои не должны быть молчаливыми — это наше правило.'],
      ['Можно автоматизировать работу с WhatsApp?', 'Да: напоминания, подтверждения, рассылки по сегментам клиентов, передача переписки в CRM.'],
    ],
  },
  {
    slug: 'razrabotka-crm',
    title: 'Внедрение и разработка CRM в Астане и Казахстане — Salmark',
    description: 'Готовая CRM Kanri для салонов, студий и клиник или своя CRM под ваши процессы. Перенос базы, настройка, обучение сотрудников. Астана, весь Казахстан.',
    h1: 'Внедрение и разработка CRM',
    lead: 'Есть два пути. Салону, студии или клинике подойдёт наша Kanri: регистрируетесь на kanri.kz и 7 дней работаете бесплатно, карта не нужна. Если процессы у вас свои, сделаем CRM под них. Что выгоднее, скажем после разговора.',
    serviceType: 'Разработка CRM-систем',
    what: [
      ['Готовая или своя — решаем вместе', 'Смотрим на процессы, число сотрудников и бюджет. Если подходит готовое решение — не будем продавать разработку.'],
      ['Kanri для сферы услуг', 'Салоны, студии, клиники, стоматологии, лаборатории: расписание, клиенты, касса, зарплата, склад, WhatsApp в одной программе.'],
      ['Своя CRM', 'Когда процессы нестандартные: свои воронки, роли, документы, отчёты, приложение для сотрудников.'],
      ['Перенос базы', 'Клиенты и услуги переезжают из Excel или выгрузки старой программы.'],
      ['Обучение команды', 'Показываем сотрудникам, как работать, и остаёмся на связи в первые недели.'],
    ],
    body: `<h2>Kanri — готовая CRM для бизнеса с записью</h2>
<p><a href="/proekty/kanri/">Kanri</a> — наша CRM для салонов, студий и клиник. В ней расписание по специалистам и кабинетам, карточки клиентов с перепиской WhatsApp, касса с Kaspi QR и наличными, зарплата, бонусы, склад, медкарта с МКБ-10 и зубной формулой, воронки продаж и аналитика.</p>
<p>Стоимость — 20 000 ₸ в месяц за филиал или 120 000 ₸ в год, число сотрудников на цену не влияет. Первые 7 дней бесплатно, карта не нужна. Подробнее — на <a href="https://kanri.kz" rel="noopener">kanri.kz</a>.</p>
<h2>Когда нужна своя CRM</h2>
<ul>
<li>Процесс продажи длинный и непохожий на типовой: тендеры, производство, проекты</li>
<li>Нужны свои документы, расчёты и согласования</li>
<li>CRM должна связаться с вашими учётными системами и сайтом</li>
<li>Сотрудникам нужно мобильное приложение под их задачи</li>
</ul>
<p>Свою CRM собираем этапами: сначала то, без чего бизнес не может работать каждый день, потом отчёты и автоматизации.</p>
<h2>Что обычно входит</h2>
<ul>
<li>Воронки продаж и сделки</li>
<li>Карточки клиентов с историей и перепиской</li>
<li>Роли и права доступа сотрудников</li>
<li>Задачи и напоминания</li>
<li>Отчёты и выгрузка в Excel</li>
<li>API и веб-хуки для связи с другими программами</li>
</ul>`,
    side: `<img class="shot" src="/assets/work/kanri-ios.webp" width="620" height="1342" loading="lazy" alt="Расписание Kanri в приложении для iPhone" style="max-width:320px">`,
    faq: [
      ['Сколько стоит внедрение Kanri?', 'Подписка стоит 20 000 ₸ в месяц за филиал или 120 000 ₸ в год, число сотрудников на цену не влияет. Перенос базы из Excel бесплатный. Настройка с нашей помощью (заведение, WhatsApp, обучение) стоит 150 000 ₸ разово, при оплате за год 30 000 ₸. Она по желанию.'],
      ['Сколько стоит своя CRM?', 'Зависит от числа процессов, ролей и интеграций. После разбора процессов называем цену по этапам: сначала основное, потом остальное.'],
      ['Можно перенести базу из старой программы?', 'Да. Клиентов и услуги переносим из Excel или выгрузки старой системы.'],
      ['CRM будет работать на телефоне?', 'Kanri работает в браузере и в приложении для iPhone. Для своей CRM делаем мобильное приложение, если оно нужно сотрудникам.'],
    ],
  },
];

for (const s of SVC_PAGES) {
  const path = `/${s.slug}/`;
  const others = SERVICES.filter(x => x.slug !== s.slug);
  write(s.slug, page({
    path, title: s.title, description: s.description,
    ld: [
      { '@type': 'Service', name: s.h1, serviceType: s.serviceType, description: s.description, provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'Country', name: 'Казахстан' }, url: SITE + path },
      faqLd(s.faq),
      crumbsLd([['Главная', '/'], [s.h1, path]]),
    ],
  }, `<section class="page-hero">
  <div class="wrap">
    <div class="ph-grid"><div>
    ${crumbs([['Главная', '/'], [s.h1, path]])}
    <h1 class="d">${nb(s.h1)}</h1>
    <p class="lead">${s.lead}</p>
    <a class="btn" href="#form">Обсудить проект ${ARROW}</a>
    </div><div class="ph-art">${s.side}</div></div>
  </div>
</section>
<section aria-label="Что входит">
  <div class="wrap what">
    ${s.what.map(([h, p]) => `<div class="rv"><h3>${nb(h)}</h3><p>${p}</p></div>`).join('\n    ')}
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap split one">
    <div class="prose rv">${nbH(s.body)}</div>
    <div class="side only-m">${s.side}</div>
  </div>
</section>
${faqBlock(s.faq)}
<section style="padding-top:0" aria-label="Другие услуги">
  <div class="wrap"><p class="mono" style="margin-bottom:16px">Ещё мы делаем</p><div class="next">${others.map(o => `<a href="/${o.slug}/">${o.short}${ARROW}</a>`).join('')}<a href="/proekty/">Наши проекты${ARROW}</a></div></div>
</section>`, path));
}

// ---------- проекты ----------
const CASE_PAGES = [
  {
    slug: 'kanri', name: 'Kanri', cls: 'kanri',
    title: 'Kanri — CRM для салонов и клиник с ИИ-администратором | проект Salmark',
    description: 'Как устроена Kanri: CRM для салонов, студий и клиник с WhatsApp, ИИ-администратором Айей, кассой, складом и приложением для iPhone. Проект студии Salmark.',
    lead: 'CRM для салонов, студий и клиник: расписание, клиенты, касса, зарплата, склад, медкарта и переписка WhatsApp в одном окне. Работает в браузере и на iPhone.',
    facts: [['Веб + iPhone', 'кабинет в браузере и приложение в App Store'], ['WhatsApp', 'обычный номер по QR или официальный API Meta'], ['ИИ', 'администратор Айя и продавец Екатерина']],
    body: `<h2>Задача</h2>
<p>Салонам и клиникам в Казахстане нужна программа, где записи, клиенты, деньги и переписка живут вместе, а не в пяти разных местах. И которая сама напоминает клиентам о записи — чтобы меньше людей не приходило.</p>
<h2>Что сделали</h2>
<ul>
<li>Расписание по специалистам и кабинетам, перенос записи перетаскиванием, статусы от «записан» до «оплатил»</li>
<li>Страница онлайн-записи для клиентов</li>
<li>WhatsApp в карточке клиента: напоминания при записи, за сутки и за два часа; ответ клиента сам меняет статус</li>
<li>Касса: Kaspi QR, наличные, карта, сертификаты, раздельная оплата</li>
<li>Зарплата специалистов, бонусы и «приведи друга», склад со списанием расходников</li>
<li>Медкарта с МКБ-10, зубная формула и планы лечения</li>
<li>Лаборатория: бланки результатов на казахском и русском, QR-код для проверки, отправка пациенту в WhatsApp</li>
<li>Телефония Sipuni: записи звонков с расшифровкой и оценкой</li>
<li>Приложение для iPhone с пуш-уведомлениями и замком по Face ID</li>
</ul>
<h2>ИИ внутри</h2>
<p>Айя — ИИ-администратор: отвечает клиентам в WhatsApp, подбирает свободное время и записывает. Записать на занятое время она не может — это проверяет программа, а не модель. Екатерина — ИИ-продавец на номере продаж Kanri: ведёт переписку с новыми заявками и помогает владельцам запуститься.</p>
<h2>На чём сделано</h2>
<p>TypeScript, Next.js, PostgreSQL, очереди задач, Capacitor для приложения, модели Claude для ИИ. Сайт <a href="https://kanri.kz" rel="noopener">kanri.kz</a> — на русском, казахском и английском.</p>`,
    pics: `<img class="shot" src="/assets/work/kanri-schedule.webp" width="1600" height="608" loading="lazy" alt="Расписание Kanri на день: специалисты, записи, оплаты" style="margin-bottom:20px"><div class="phones"><img src="/assets/work/kanri-chat.webp" width="620" height="1342" loading="lazy" alt="Kanri: переписка с клиентом в WhatsApp"><img src="/assets/work/kanri-ios.webp" width="620" height="1342" loading="lazy" alt="Kanri: расписание в приложении для iPhone"></div>`,
    link: ['https://kanri.kz', 'Открыть kanri.kz'],
  },
  {
    slug: 'zor-qadam', name: 'ZOR QADAM', cls: 'zq',
    title: 'ZOR QADAM — приложение ЛФК для iPhone и Android | проект Salmark',
    description: 'Как сделано приложение лечебной физкультуры ZOR QADAM: нативно на SwiftUI и Kotlin, казахский и русский, занятия, уроки и дневник боли. Проект студии Salmark.',
    lead: 'Приложение лечебной физкультуры для центра реабилитации ZOR QADAM в Астане: короткие ежедневные занятия при болях в спине и суставах, уроки и дневник боли.',
    facts: [['iPhone + Android', 'два нативных приложения с общим содержанием'], ['Қазақша + русский', 'оба языка с первого дня'], ['На телефоне', 'данные не уходят на сервер']],
    body: `<h2>Задача</h2>
<p>Центру реабилитации нужно было, чтобы пациенты продолжали упражнения дома — и чтобы приложение было полезно любому человеку с болью в спине, а не только пациентам центра.</p>
<h2>Что сделали</h2>
<ul>
<li>Программы по зонам: поясница, шея, грудной отдел, колени, плечи</li>
<li>Короткие занятия на несколько минут в день и уроки о боли</li>
<li>Дневник боли по шкале «светофор»</li>
<li>Тревожные симптомы: приложение останавливает занятия и направляет к специалисту</li>
<li>Мотивация без давления: серия дней, уровни и награды — но никогда за терпение боли</li>
<li>Запись в центр через WhatsApp</li>
</ul>
<h2>На чём сделано</h2>
<p>SwiftUI на iPhone, Kotlin и Jetpack Compose на Android. Упражнения и правила нагрузки утверждает реабилитолог центра. Приложение готовится к выходу в App Store и Google Play.</p>`,
    pics: `<div class="phones"><img src="/assets/work/zq-01.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран «Сегодня»"><img src="/assets/work/zq-03.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран приложения"></div><div class="phones" style="margin-top:20px"><img src="/assets/work/zq-02.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран приложения"><img src="/assets/work/zq-04.webp" width="660" height="1434" loading="lazy" alt="ZOR QADAM: экран приложения"></div>`,
    link: ['https://zorqadam.kz', 'Сайт центра ZOR QADAM'],
  },
  {
    slug: 'repstone', name: 'Repstone', cls: 'rs',
    title: 'Repstone — журнал тренировок для iPhone и Android | проект Salmark',
    description: 'Как сделан Repstone: бесплатный журнал тренировок без интернета и регистрации, программа по пяти вопросам, каталог упражнений с рисунками. Проект студии Salmark.',
    lead: 'Бесплатный журнал тренировок для зала: подход записывается одним касанием, программа собирается по пяти вопросам, всё работает без интернета.',
    facts: [['iPhone + Android', 'нативно на SwiftUI и Kotlin'], ['Без сети', 'без регистрации и рекламы'], ['3 языка', 'русский, казахский, английский']],
    body: `<h2>Задача</h2>
<p>Сделать журнал тренировок, которым удобно пользоваться прямо между подходами: без регистрации, без рекламы и без ожидания загрузки в подвальном зале без связи.</p>
<h2>Что сделали</h2>
<ul>
<li>Запись подхода одним касанием и таймер отдыха</li>
<li>Свой каталог упражнений с рисунками</li>
<li>Программа тренировок по пяти вопросам — собирается на телефоне, без сервера</li>
<li>Рекорды, кольца недели, календарь и награды</li>
<li>Резервная копия файлом и выгрузка в CSV</li>
</ul>
<h2>На чём сделано</h2>
<p>SwiftUI на iPhone, Kotlin и Jetpack Compose на Android, сотни автотестов на каждой платформе. Сайт — <a href="https://repstone.vercel.app" rel="noopener">repstone.vercel.app</a>.</p>`,
    pics: `<div class="phones"><img src="/assets/work/rs-01.webp" width="660" height="1434" loading="lazy" alt="Repstone: первый экран"><img src="/assets/work/rs-02.webp" width="660" height="1434" loading="lazy" alt="Repstone: экран приложения"></div><div class="phones" style="margin-top:20px"><img src="/assets/work/rs-03.webp" width="660" height="1434" loading="lazy" alt="Repstone: экран приложения"><img src="/assets/work/rs-04.webp" width="660" height="1434" loading="lazy" alt="Repstone: экран приложения"></div>`,
    link: ['https://repstone.vercel.app', 'Открыть сайт Repstone'],
  },
];

for (const c of CASE_PAGES) {
  const path = `/proekty/${c.slug}/`;
  write(`proekty/${c.slug}`, page({
    path, title: c.title, description: c.description,
    ld: [
      { '@type': 'CreativeWork', name: c.name, description: c.description, creator: { '@id': SITE + '/#org' }, url: SITE + path },
      crumbsLd([['Главная', '/'], ['Проекты', '/proekty/'], [c.name, path]]),
    ],
  }, `<section class="page-hero ${c.cls}">
  <div class="wrap">
    ${crumbs([['Главная', '/'], ['Проекты', '/proekty/'], [c.name, path]])}
    <h1 class="d">${c.name}</h1>
    <p class="lead">${c.lead}</p>
    <div class="facts">${c.facts.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
  </div>
</section>
<section>
  <div class="wrap split">
    <div class="prose rv">${nbH(c.body)}<p><a href="${c.link[0]}" rel="noopener">${c.link[1]} →</a></p></div>
    <div class="side rv">${c.pics}</div>
  </div>
</section>
<section style="padding-top:0" aria-label="Другие проекты">
  <div class="wrap"><p class="mono" style="margin-bottom:16px">Другие проекты и услуги</p><div class="next">${CASE_PAGES.filter(x => x !== c).map(o => `<a href="/proekty/${o.slug}/">${o.name}${ARROW}</a>`).join('')}<a href="/razrabotka-mobilnyh-prilozhenij/">Мобильные приложения${ARROW}</a><a href="/razrabotka-ii-botov/">ИИ-боты${ARROW}</a></div></div>
</section>`, '/proekty/'));
}

write('proekty', page({
  path: '/proekty/',
  title: 'Проекты: приложения, CRM и ИИ-боты — портфолио Salmark',
  description: 'Портфолио IT-студии Salmark: CRM Kanri с ИИ-администратором, приложение ЛФК ZOR QADAM и журнал тренировок Repstone для iPhone и Android.',
  ld: [crumbsLd([['Главная', '/'], ['Проекты', '/proekty/']])],
}, `<section class="page-hero">
  <div class="wrap">
    ${crumbs([['Главная', '/'], ['Проекты', '/proekty/']])}
    <h1 class="d">Наши проекты</h1>
    <p class="lead">Продукты, которые мы сделали и поддерживаем сами: CRM с ИИ-администратором и два нативных приложения для iPhone и Android.</p>
  </div>
</section>
<section>
  <div class="wrap cases">
    ${CASE_CARDS.kanri}
    ${CASE_CARDS['zor-qadam']}
    ${CASE_CARDS.repstone}
  </div>
</section>`, '/proekty/'));

// ---------- контакты ----------
write('kontakty', page({
  path: '/kontakty/',
  title: 'Контакты IT-студии Salmark — Астана',
  description: 'Оставьте заявку на разработку приложения, ИИ-бота, CRM или автоматизации. Salmark — Астана, работаем со всем Казахстаном.',
  ld: [crumbsLd([['Главная', '/'], ['Контакты', '/kontakty/']])],
  formTitle: 'Оставить заявку',
}, `<section class="page-hero">
  <div class="wrap">
    ${crumbs([['Главная', '/'], ['Контакты', '/kontakty/']])}
    <h1 class="d">Контакты</h1>
    <p class="lead">Проще всего — оставить заявку в форме ниже: опишите задачу, и мы свяжемся по телефону или почте, которые вы укажете.</p>
    <div class="facts">
      <div><b>Астана</b><span>работаем со всем Казахстаном онлайн</span></div>
      <div><b>Заявка</b><span>через форму на этой странице</span></div>
      <div><b>Реквизиты</b><span>${LEGAL}</span></div>
    </div>
  </div>
</section>`, '/kontakty/'));

// ---------- политика ----------
write('privacy', page({
  path: '/privacy/',
  title: 'Политика конфиденциальности — Salmark',
  description: 'Как сайт salmark.kz обрабатывает данные из формы заявки.',
  ld: [crumbsLd([['Главная', '/'], ['Политика конфиденциальности', '/privacy/']])],
}, `<section class="page-hero" style="border:0;padding-bottom:0">
  <div class="wrap">
    ${crumbs([['Главная', '/'], ['Политика конфиденциальности', '/privacy/']])}
    <h1 class="d" style="font-size:clamp(24px,5vw,64px)">Политика конфиден&shy;циальности</h1>
    <p class="mono" style="margin-top:20px">Редакция от 16.10.2026</p>
  </div>
</section>
<section style="padding-top:40px">
  <div class="wrap prose">
<p>Политика описывает, как сайт salmark.kz обрабатывает персональные данные посетителей. Оператор — ${LEGAL}. Политика составлена в соответствии с Законом Республики Казахстан «О персональных данных и их защите».</p>
<h2>Какие данные мы получаем</h2>
<p>Только то, что вы сами указали в форме заявки: имя, телефон или адрес почты, выбранные услуги и текст сообщения. Сайт не использует счётчики посещений и не ставит рекламные cookie.</p>
<h2>Зачем</h2>
<p>Чтобы ответить на заявку, уточнить задачу и подготовить предложение. Рассылок по этим данным мы не делаем.</p>
<h2>Как передаются и где хранятся</h2>
<p>Заявка передаётся через сервис отправки форм FormSubmit и приходит письмом на почту оператора (Google Gmail). Серверы этих сервисов находятся за пределами Казахстана. Отправляя форму, вы даёте согласие на такую трансграничную передачу.</p>
<h2>Сколько храним</h2>
<p>Пока идёт переписка по вашей задаче и не дольше трёх лет после неё, если вы не попросите удалить данные раньше.</p>
<h2>Ваши права</h2>
<p>Вы можете узнать, какие данные о вас хранятся, исправить их или попросить удалить, а также отозвать согласие. Для этого отправьте запрос через форму на странице <a href="/kontakty/">«Контакты»</a> — ответим в течение 10 рабочих дней.</p>
<h2>Приложения</h2>
<p>У мобильных приложений, опубликованных с этого домена, свои политики: например, <a href="/app/privacy/">политика приложения</a>.</p>
  </div>
</section>`, ''));

// ---------- 404 ----------
writeFileSync(join(OUT, '404.html'), head({ path: '/404', title: 'Страница не найдена — Salmark', description: 'Такой страницы нет.', noindex: true }) + '\n' + header() + `
<main id="main"><section class="nf"><div class="wrap"><p class="d">404</p><h1 class="d" style="font-size:clamp(28px,4vw,48px);margin:10px 0 30px">Такой страницы нет</h1><a class="btn" href="/">На главную ${ARROW}</a></div></section></main>
` + footer());

// ---------- карта сайта ----------
const urls = ['/', ...SERVICES.map(s => `/${s.slug}/`), '/proekty/', ...CASES.map(c => `/proekty/${c.slug}/`), '/kontakty/', '/privacy/', '/app/', '/app/privacy/'];
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${u === '/' ? '1.0' : u.startsWith('/app') || u === '/privacy/' ? '0.3' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\nHost: ${SITE}\n`);
console.log('ok:', urls.length, 'адресов в карте сайта');
