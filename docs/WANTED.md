# «Где нужна зарядка»

## Что добавлено

Раздел работает как статическое vanilla-приложение внутри текущего GitHub Pages сайта. Карта использует Google Maps JavaScript API и `@googlemaps/markerclusterer`. Публичные страницы находятся по адресам `/wanted/`, `/wanted/new` и `/wanted/:id`.

Фронтенд обращается к API, настроенному в `wanted/config.js` (`apiUrl`). Авторизация пользователей и токен сессии обрабатываются через Firebase Auth (Google, Apple).

## Локальный запуск

1. Установить Ruby-зависимости блога в `blog-src` командой `bundle install`.
2. Запустить `./scripts/preview-pages.sh 4000`.
3. Открыть `http://127.0.0.1:4000/wanted/`.
4. Для сценария с координатами открыть `http://127.0.0.1:4000/wanted/new?lat=43.2389&lng=76.8897`.

## Ключ Google Maps

Вставьте browser API key в [`wanted/config.js`](../wanted/config.js), заменив `PASTE_GOOGLE_MAPS_API_KEY_HERE`. В Google Cloud необходимо включить **Maps JavaScript API** и billing.

Ограничьте ключ:

- Application restrictions → Websites;
- production referrer: `https://evpoint.kz/*`;
- local referrers: `http://127.0.0.1:4000/*` и при необходимости `http://localhost:4000/*`;
- API restrictions → только Maps JavaScript API.

Ключ Maps JavaScript API передаётся браузеру и поэтому виден посетителю сайта. Безопасность обеспечивается ограничениями по referrer и API, а не попыткой скрыть ключ в GitHub Pages.

Проверки: `npm test` запускает unit-тесты валидации, расстояния и фильтров; `npm run build` собирает полный Pages-артефакт.

## Production API

Бэкенд настраивается в `wanted/config.js` (`apiUrl`). Маршруты и контракт API:


## API

- `GET /api/wanted?south=&north=&west=&east=&status=&locationType=&chargerType=` — публичный компактный список;
- `GET /api/wanted/:id` — публичная точка и комментарии без данных автора;
- `GET /api/wanted/nearby?lat=&lng=&radius=300` — поиск дублей;
- `POST /api/wanted` — создать, требуется сессия;
- `PUT|DELETE /api/wanted/:id/vote` — поставить/снять голос;
- `POST /api/wanted/:id/comments` — добавить комментарий;
- `PATCH /api/wanted/:id` — статус/скрытие с `Authorization: Bearer ADMIN_TOKEN`.

Создатель автоматически получает первый голос. Уникальный ключ `(proposal_id, user_id)` исключает повторное голосование. Сервер ограничивает частоту записи по IP, длину полей, допустимые enum и координаты Казахстана. Для жилых локаций координаты округляются примерно до 10 метров. Публичные ответы не содержат provider subject, email или имя пользователя.

## Важное ограничение GitHub Pages

Существующие seed-точки получают статические HTML-страницы с индивидуальными Open Graph-тегами во время сборки. Для мгновенного OG-превью новых production-точек нужен edge/backend rewrite маршрута `/wanted/:id`, который вернёт HTML с метаданными записи до загрузки JavaScript. GitHub Pages сам по себе не умеет динамически формировать такое превью. В браузере неизвестный `/wanted/:id` уже открывается через клиентский fallback в `404.html`, но боты мессенджеров JavaScript обычно не исполняют.

## Аналитика

Используется уже подключённый Google Analytics: `wanted_map_open`, `wanted_banner_click`, `wanted_create_start`, `wanted_create_success`, `wanted_duplicate_found`, `wanted_proposal_open`, `wanted_vote`, `wanted_vote_cancel`, `wanted_share`, `wanted_install_app`. Новая аналитическая система не добавлялась.
