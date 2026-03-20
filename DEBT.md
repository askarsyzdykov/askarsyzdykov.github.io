# DEBT

Цель: ускорить загрузку `evpoint.kz`, улучшить индексацию страниц и повысить качество SEO для лендинга, блога и каталога станций.

## P0

### 1. Привести в порядок базовое SEO лендинга

Проблема:
- У главной страницы нет `meta description` в `<head>`: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).
- Каноникал используется неверно: `rel="canonical"` стоит на ссылке в navbar, а не на `<link>` в `<head>`: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).
- Twitter meta-теги закомментированы: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).

Почему важно:
- Главная страница теряет CTR в поиске и получает слабые сигналы для социальных превью.
- Неверный canonical может приводить к неявным дублям `/` и `/index.html`.

Что сделать:
- Добавить `meta name="description"` для главной.
- Добавить `<link rel="canonical" href="https://evpoint.kz/">` в `<head>`.
- Разкомментировать и проверить `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- При необходимости добавить `og:url`.

### 2. Убрать блокирующие рендер внешние ресурсы на главной

Проблема:
- Главная тянет Google Fonts, Bootstrap CSS с CDN, Animate.css и `wow.min.js` в `<head>`: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).
- `WOW.js` и анимации не критичны для первого экрана, но участвуют в критическом пути рендера.

Почему важно:
- Это бьёт по LCP, First Paint и стабильности загрузки на мобильных сетях.
- Любая зависимость от внешних CDN увеличивает latency и риск деградации.

Что сделать:
- Удалить `animate.css` и `wow.js`, если они не дают реальной ценности.
- Если Bootstrap нужен только для простого layout, заменить на локальный минимальный CSS.
- Если внешний шрифт остаётся, хотя бы добавить `preconnect`; лучше перейти на системный стек или локальный шрифт.
- Оставить главную максимально статичной и самодостаточной.

### 3. Сделать FAQ индексируемым без JavaScript

Проблема:
- [faq/index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/faq/index.html) рендерит весь контент через `fetch('faq.json')`, а в HTML изначально есть только `Загрузка...`.
- JSON-LD для FAQ тоже вставляется только после выполнения JS.

Почему важно:
- Поисковики могут увидеть thin page без реального содержимого.
- FAQ-разметка и текст могут индексироваться нестабильно.

Что сделать:
- Генерировать FAQ как статический HTML на этапе сборки.
- Оставить `faq.json` только как источник данных, а не как единственный способ отрисовки.
- Вставлять JSON-LD сразу в итоговый HTML.
- Добавить canonical, OG и внутренние ссылки из FAQ на главную, блог и станции.

### 4. Включить и нормально настроить SEO для блога

Проблема:
- В [blog-src/_includes/head.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/blog-src/_includes/head.html) используется `{%- seo -%}`.
- Но `jekyll-seo-tag` закомментирован в [blog-src/_config.yml](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/blog-src/_config.yml).
- Там же пустые `title` и `description`.

Почему важно:
- Блог может рендерить неполные или слабые SEO-теги.
- Без site-level metadata посты и страницы получают менее качественные `title`, description, Open Graph и canonical.

Что сделать:
- Включить `jekyll-seo-tag` в `plugins`.
- Заполнить `title`, `description`, `logo`, `social`, `author` в `_config.yml`.
- Проверить итоговый HTML для главной страницы блога, постов и `providers.md`.

## P1

### 5. Исправить качество и достоверность `lastmod` для станций и sitemap

Проблема:
- В генераторе станций `inferUpdatedAt()` всегда возвращает `new Date().toISOString()`: [scripts/generate-station-pages.js](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/scripts/generate-station-pages.js).
- Из-за этого все station pages и sitemap выглядят как обновлённые на каждый билд.

Почему важно:
- Это слабый сигнал для поисковых систем и может подрывать доверие к `lastmod`.
- Поисковый робот получает шум вместо реальной свежести контента.

Что сделать:
- Брать `updatedAt` из исходных данных станции, если поле существует.
- Если его нет, использовать дату обновления датасета, а не текущее время.
- Для root sitemap тоже перейти на автоматическую генерацию реальных `lastmod`.

### 6. Снизить риск thin / duplicate content в каталоге станций

Проблема:
- Генерируется около 1200 station pages по одному шаблону: [scripts/generate-station-pages.js](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/scripts/generate-station-pages.js).
- Тексты у них почти одинаковые, различаются в основном заголовок, адрес и списки разъёмов.
- Блок “Другие станции рядом по локации” показывает не ближайшие станции, а просто станции того же locality.

Почему важно:
- Это риск массового near-duplicate content.
- Часть страниц может не приносить поисковой ценности, но съедать crawl budget.

Что сделать:
- Разделить station pages по качеству данных.
- Для страниц без нормального адреса, координат, провайдера и полезных атрибутов рассмотреть `noindex,follow`.
- Для сильных страниц добавить больше уникального контента: провайдеры, типы коннекторов, мощность, способы оплаты, карта/координаты, ссылка на город и соседние станции по фактической близости.
- Заменить псевдо-близкие “рядом” на реальные соседние станции по координатам.

### 7. Вынести CSS station pages в общий файл

Проблема:
- Весь CSS station/locality/index pages встроен инлайном в каждую HTML-страницу: [scripts/generate-station-pages.js](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/scripts/generate-station-pages.js).

Почему важно:
- Повторяется один и тот же CSS на сотнях страниц.
- Теряется кэшируемость, растёт размер HTML и стоимость обхода каталога.

Что сделать:
- Вынести общий стиль станций в отдельный `assets` CSS-файл.
- Оставить HTML страниц компактным.
- Проверить размер итоговых station pages до и после.

### 8. Усилить structured data для станций и листингов

Проблема:
- Сейчас есть только базовый JSON-LD для station page и простая `CollectionPage` для листингов: [scripts/generate-station-pages.js](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/scripts/generate-station-pages.js).
- Нет breadcrumb schema.
- Нет ItemList для городских страниц.

Почему важно:
- Поисковики хуже понимают иерархию `/stations/ -> /stations/{city}/ -> /stations/{station}/`.
- Теряется шанс на более чистые сниппеты и лучшую связность сущностей.

Что сделать:
- Добавить `BreadcrumbList` на station и locality pages.
- Для страниц городов добавить `ItemList` с URL станций.
- Расширить `ElectricVehicleChargingStation`, если в данных есть цена, оператор, geo, opening hours, payment options.

### 9. Автоматизировать root sitemap вместо ручного файла

Проблема:
- Корневой [sitemap.xml](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/sitemap.xml) поддерживается вручную.
- Даты и список URL могут устаревать.

Почему важно:
- Ручной sitemap часто расходится с реальным состоянием сайта.
- Это особенно опасно после удаления или добавления разделов.

Что сделать:
- Генерировать root sitemap в `build-pages.sh` или отдельным script.
- Включать туда root pages, `faq/`, `app/`, `blog/`, а station sitemap оставлять отдельным индексом или частью общей схемы.
- Исключить ручное редактирование sitemap из повседневного процесса.

## P2

### 10. Доработать медиа и LCP на главной

Проблема:
- Главный экран использует скриншот телефона: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).
- У изображения нет `alt`, `width`, `height`, `decoding`, `fetchpriority`.
- Текущий `width="300px;"` некорректен как HTML-атрибут.

Почему важно:
- Это влияет на CLS/LCP и на доступность.

Что сделать:
- Задать корректные `width` и `height`.
- Добавить `alt`.
- Использовать `decoding="async"`.
- Если изображение входит в LCP, протестировать `fetchpriority="high"`.

### 11. Подчистить техдолг в root pages

Проблема:
- [404.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/404.html) на английском, в то время как основной сайт русскоязычный.
- На главной есть legacy-разметка и закомментированные блоки, затрудняющие сопровождение: [index.html](/Users/askarsyzdykov/Projects/my/ev-charging-stations/blog/askarsyzdykov.github.io/index.html).

Почему важно:
- Это не основной SEO-фактор, но ухудшает консистентность и повышает риск ошибок при правках.

Что сделать:
- Сделать 404 локализованной и связанной с текущей структурой сайта.
- Удалить мёртвый/закомментированный HTML с главной.
- Привести главную к компактному и предсказуемому шаблону.

### 12. Добавить внутреннюю перелинковку между лендингом, блогом и каталогом станций

Проблема:
- Сейчас связи между разделами ограничены.
- Лендинг почти не прокачивает каталог станций и ключевые страницы блога.

Почему важно:
- Внутренняя перелинковка помогает распределять вес, улучшает обход и даёт больше релевантных входов из поиска.

Что сделать:
- Добавить на главную ссылку на `/stations/`, `/faq/` и 2-3 ключевые evergreen-материала из блога.
- На station/locality pages добавить ссылки на FAQ и релевантные статьи.
- На blog pages и `providers.md` дать больше ссылок в каталог станций и города.

## Порядок выполнения

1. P0.1, P0.2, P0.3, P0.4.
2. P1.5, P1.6, P1.7.
3. P1.8, P1.9.
4. P2.10, P2.11, P2.12.

## Как мерить результат

- Lighthouse mobile для `/`, `/faq/`, `/blog/` и 1-2 station pages.
- Размер HTML station page до/после выноса CSS.
- Наличие корректных `title`, `description`, `canonical`, OG, Twitter tags на главной, в блоге, на FAQ и station pages.
- Число страниц в sitemap и соответствие реальному набору URL.
- Индексируемость FAQ без JavaScript.
