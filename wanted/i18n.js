(function () {
  "use strict";
  window.WANTED_MESSAGES = {
    ru: {
      title: "Где нужна зарядка",
      subtitle: "Покажите операторам, где вам не хватает зарядных станций",
      propose: "Предложить место",
      map: "Карта",
      filters: "Фильтры",
      allStatuses: "Все статусы",
      allLocations: "Все места",
      allChargers: "Любая зарядка",
      votes: "голосов",
      open: "Открыть предложение",
      empty: "Здесь пока нет предложений. Добавьте первое место",
      loading: "Загружаем предложения…",
      loadError: "Не удалось загрузить предложения. Попробуйте позже.",

      // Source type selection
      sourceTypeTitle: "Выберите тип заявки",
      sourceTypeSubtitle: "Вы можете запросить установку как водитель или предложить свою площадку как бизнес",
      driverDemandTitle: "Я водитель электромобиля",
      driverDemandDesc: "Я водитель электромобиля и хочу предложить место для установки зарядной станции.",
      siteOfferTitle: "Я представляю площадку или бизнес",
      siteOfferDesc: "Я представляю площадку или бизнес и готов рассмотреть установку зарядной станции.",

      // Filters & Badges
      filterAll: "Все",
      filterDriverDemand: "Где нужна зарядка",
      filterSiteOffer: "Площадки от бизнеса",
      badgeDriverDemand: "Нужна зарядка",
      badgeSiteOffer: "Площадка от бизнеса",
      driverVotes: "Голосов водителей",

      // Locations
      locations: {
        residential: "Жилой комплекс или двор",
        office: "Работа или офис",
        mall: "Торговый центр",
        retail: "Магазин или супермаркет",
        restaurant: "Ресторан или кафе",
        hotel: "Отель или гостиница",
        gas_station: "АЗС / Заправка",
        parking: "Парковка или автостоянка",
        roadside: "Придорожный сервис",
        service_center: "Автосервис или автомойка",
        public_parking: "Общественная парковка",
        hotel_tourism: "Гостиница или туристический объект",
        highway: "Трасса",
        other: "Другое"
      },

      // Site roles
      siteRoles: {
        owner: "Собственник",
        tenant: "Арендатор",
        management_company: "Управляющая компания",
        business_representative: "Представитель бизнеса",
        government_representative: "Представитель госорганизации",
        other: "Другое"
      },

      // Parking spaces
      parkingSpacesQuestion: "Сколько парковочных мест можно выделить под зарядку?",
      parkingSpaces: {
        "1": "1 место",
        "2": "2 места",
        "3_4": "3–4 места",
        "5_plus": "5 и более мест",
        unknown: "Не знаю"
      },

      // Site access
      siteAccessLabel: "Режим доступа к площадке",
      siteAccesses: {
        "24_7": "Круглосуточно (24/7)",
        business_hours: "В рабочие часы",
        restricted: "Ограниченный доступ (шлагбаум/пропуск)",
        other: "Другое"
      },

      // Power status
      powerStatusQuestion: "Что известно об электроснабжении площадки?",
      powerStatuses: {
        available: "Есть свободная мощность",
        upgrade_possible: "Возможно увеличение мощности",
        probably_insufficient: "Скорее всего, мощности недостаточно",
        unknown: "Не знаю"
      },

      // Available power
      availablePowerLabel: "Приблизительная доступная мощность (необязательно)",
      availablePowers: {
        up_to_22: "До 22 кВт (медленная зарядка)",
        "22_50": "22 – 50 кВт",
        "50_100": "50 – 100 кВт (быстрая зарядка)",
        "100_200": "100 – 200 кВт",
        "200_plus": "Более 200 кВт (ультрабыстрая)",
        unknown: "Не знаю"
      },

      // Preferred charger
      preferredChargerLabel: "Предпочтительный тип станции (необязательно)",
      preferredChargers: {
        ac: "Медленная (AC)",
        dc: "Быстрая (DC)",
        ac_dc: "И медленная, и быстрая (AC + DC)",
        unknown: "Не знаю / Не имеет значения"
      },

      // Cooperation types
      cooperationLabel: "Варианты сотрудничества",
      cooperationHint: "Выберите один или несколько вариантов",
      cooperationOptions: {
        provide_site: "Готов предоставить место",
        rent: "Аренда площадки",
        revenue_share: "Разделение дохода",
        co_invest: "Готов соинвестировать",
        own_investment: "Готов самостоятельно инвестировать",
        discuss: "Хочу обсудить варианты"
      },

      // Site offer form fields
      siteNameLabel: "Название объекта / площадки",
      siteNamePlaceholder: "Например: ТРЦ Grand Park, БЦ Almaty Towers",
      siteRoleLabel: "Кем вы являетесь на этой площадке?",
      representativeConfirmed: "Я являюсь владельцем или уполномоченным представителем этой площадки.",
      contactNameLabel: "Имя контактного лица",
      contactNamePlaceholder: "Ваше имя или имя представителя",
      contactPhoneLabel: "Номер телефона (WhatsApp)",
      contactPhonePlaceholder: "+7 701 123 45 67",
      contactEmailLabel: "Email (необязательно)",
      contactEmailPlaceholder: "contact@example.kz",
      authorCommentSiteLabel: "Публичный комментарий (необязательно)",
      authorCommentSitePlaceholder: "Например: удобный въезд со стороны проспекта, рядом фудкорт",
      authorCommentSiteHint: "Этот комментарий будет виден публично на странице площадки. Не указывайте здесь личные контактные данные.",
      submitSiteOffer: "Опубликовать предложение площадки",

      // Driver form
      chargers: { ac: "Медленная (AC)", dc: "Быстрая (DC)", unknown: "Неважно" },
      frequencies: { unspecified: "Не указано", daily: "Ежедневно", several_weekly: "Несколько раз в неделю", several_monthly: "Несколько раз в месяц", trips: "Во время поездок" },
      statuses: { collecting_votes: "Собирает поддержку", sent_to_operators: "Передано операторам", under_review: "Рассматривается", planned: "Запланирована", installed: "Установлена", rejected: "Отклонено", archived: "Архив" },
      back: "Назад к карте",
      newTitle: "Предложить место",
      step: "Шаг",
      next: "Продолжить",
      prev: "Назад",
      submit: "Опубликовать предложение",
      placeStep: "Выберите место на карте",
      placeHelp: "Нажмите на карту или передвиньте маркер.",
      useLocation: "Моё местоположение",
      address: "Адрес или понятное описание (необязательно)",
      locationStep: "Что это за место?",
      reasonStep: "Почему здесь нужна зарядка?",
      reasonPlaceholder: "Например: ближайшие станции далеко и вечером часто заняты",
      chargerStep: "Какая зарядка нужна?",
      connectors: "Типы разъёмов (необязательно)",
      comment: "Дополнительный комментарий (необязательно)",

      // Auth
      authTitle: "Войдите, чтобы продолжить",
      authText: "Создание предложений, голоса и комментарии доступны после входа.",
      signIn: "Войти",
      devSignIn: "Войти в локальном режиме",
      authUnavailable: "Авторизация временно недоступна. Попробуйте позже.",
      validation: "Проверьте обязательные поля.",

      // Nearby dialogs
      duplicateTitle: "Рядом уже есть заявка. Поддержать существующее место?",
      duplicateContinue: "Всё равно создать новое",
      duplicateSupport: "Поддержать существующее",
      nearbyVoteDemandTitle: "Рядом уже есть запрос от водителей",
      nearbyVoteDemandText: "Водители уже предложили установить зарядку рядом. Вы можете поддержать существующее место своим голосом.",
      nearbyVoteDemandAction: "Поддержать заявку водителей",
      nearbyVerifySiteTitle: "Рядом уже предложена площадка от бизнеса",
      nearbyVerifySiteText: "Проверьте, не является ли это той же самой площадкой?",
      nearbyVerifySiteAction: "Открыть существующую площадку",
      nearbySupportOfferTitle: "Рядом есть площадка, готовая к установке станции!",
      nearbySupportOfferText: "Представитель бизнеса уже готов рассмотреть установку зарядки в этом месте. Поддержите площадку своим голосом!",
      nearbySupportOfferAction: "Поддержать площадку от бизнеса",
      nearbyMatchDemandTitle: "Рядом уже есть высокий спрос от водителей!",
      nearbyMatchDemandText: "Водители электромобилей уже просят зарядку поблизости. Ваше предложение площадки будет очень востребовано!",
      nearbyMatchDemandAction: "Продолжить добавление площадки",

      created: "Предложение опубликовано",
      detailLoading: "Загрузка...",
      notFound: "Предложение не найдено",
      reason: "Почему нужна зарядка",
      frequency: "Частота",
      preferred: "Желаемая зарядка",
      createdAt: "Создано",
      support: "Хочу зарядку здесь",
      supported: "Ваш голос учтен",
      cancelVote: "Отменить голос",
      share: "Поделиться",
      shared: "Ссылка скопирована",
      comments: "Комментарии",
      addComment: "Добавить комментарий",
      commentPlaceholder: "Ваш комментарий",
      send: "Отправить",
      noComments: "Комментариев пока нет",
      disclaimer: "Предложение показывает интерес к локации и не является гарантией установки зарядной станции",
      installApp: "Открыть приложение",
      localMode: "Локальный демонстрационный режим",
      close: "Закрыть",
      mapUnavailable: "Карта не загрузилась. Проверьте подключение к интернету.",
      mapKeyMissing: "Добавьте ключ Google Maps в файл",
      locateError: "Не удалось определить местоположение.",
      all: "Все",
      authSheetTitle: "Вход в аккаунт",
      authSheetSubtitle: "Войдите, чтобы предложить место или поддержать зарядку",
      signInGoogle: "Продолжить с Google",
      signInApple: "Продолжить с Apple",
      addVote: "Добавить голос",
      driver: "Водитель",
      signOut: "Выйти",

      // Detail page site offer
      siteOfferBanner: "Владелец площадки готов рассмотреть установку зарядной станции здесь.",
      siteOfferCta: "Хочу зарядку здесь",
      parkingSpacesDetail: "Доступные парковочные места",
      siteAccessDetail: "Режим доступа",
      powerStatusDetail: "Электроснабжение",
      availablePowerDetail: "Доступная мощность",
      preferredChargerDetail: "Предпочтительная станция",
      siteNameDetail: "Объект / площадка",

      myProposals: "Мои предложения",
      noMyProposals: "У вас пока нет предложений",
      sortBy: "Сортировка",
      sortByDate: "По дате",
      sortByVotes: "По голосам",
      newestFirst: "Сначала новые",
      oldestFirst: "Сначала старые",
      mostVotes: "Больше голосов",
      youAuthor: "Вы автор",
      cantRemoveAuthorVote: "Автор предложения не может отозвать свой голос",
      thankYouTitle: "Спасибо за ваш вклад!",
      thankYouText: "Предложение опубликовано. Скопируйте ссылку и отправьте в чаты водителей или домовые группы, чтобы быстрее собрать голоса.",
      copyLink: "Скопировать ссылку",
      copiedLink: "✓ Ссылка скопирована",
      shareInChats: "Поделиться",
      gotIt: "Понятно",
      shareTextTemplate: "Предлагаю установить зарядную станцию для электромобилей в этом месте.\nУже проголосовали: {votes_count} чел.\nЕсли вам тоже нужна зарядка здесь — поддержите место своим голосом в evPoint:",
      shareSiteTextTemplate: "Здесь предлагают установить зарядную станцию для электромобилей.\nЕсли вам тоже нужна зарядка в этом месте — поддержите локацию своим голосом в evPoint.\nУже проголосовали: {votes_count} чел."
    },
    kk: {
      title: "Зарядтау қайда қажет",
      subtitle: "Сізге зарядтау станциялары жетіспейтін жерлерді операторларға көрсетіңіз",
      propose: "Орын ұсыну",
      map: "Карта",
      filters: "Сүзгілер",
      allStatuses: "Барлық мәртебе",
      allLocations: "Барлық орын",
      allChargers: "Кез келген зарядтау",
      votes: "дауыс",
      open: "Ұсынысты ашу",
      empty: "Мұнда әзірге ұсыныс жоқ. Бірінші орынды қосыңыз",
      loading: "Ұсыныстар жүктелуде…",
      loadError: "Ұсыныстарды жүктеу мүмкін болмады.",

      // Source type selection
      sourceTypeTitle: "Өтінім түрін таңдаңыз",
      sourceTypeSubtitle: "Сіз жүргізуші ретінде сұраныс бере аласыз немесе бизнес ретінде өз алаңыңызды ұсына аласыз",
      driverDemandTitle: "Мен электромобиль жүргізушісімін",
      driverDemandDesc: "Мен электромобиль жүргізушісімін және зарядтау станциясын орнату үшін орын ұсынғым келеді.",
      siteOfferTitle: "Мен алаң немесе бизнес өкілімін",
      siteOfferDesc: "Мен алаң немесе бизнес өкілімін және зарядтау станциясын орнатуды қарастыруға дайынмын.",

      // Filters & Badges
      filterAll: "Барлығы",
      filterDriverDemand: "Зарядтау қайда қажет",
      filterSiteOffer: "Бизнес ұсынған алаңдар",
      badgeDriverDemand: "Зарядтау қажет",
      badgeSiteOffer: "Бизнес ұсынған алаң",
      driverVotes: "Жүргізушілер дауысы",

      // Locations
      locations: {
        residential: "Тұрғын үй кешені немесе аула",
        office: "Жұмыс немесе кеңсе",
        mall: "Сауда орталығы",
        retail: "Дүкен немесе супермаркет",
        restaurant: "Мейрамхана немесе дәмхана",
        hotel: "Қонақүй",
        gas_station: "ЖҚС / Жанармай бекеті",
        parking: "Автотұрақ",
        roadside: "Жол бойындағы қызмет",
        service_center: "Автосервис немесе көлік жуу орны",
        public_parking: "Қоғамдық автотұрақ",
        hotel_tourism: "Қонақүй немесе туристік нысан",
        highway: "Тас жол",
        other: "Басқа"
      },

      // Site roles
      siteRoles: {
        owner: "Меншік иесі",
        tenant: "Жалға алушы",
        management_company: "Басқарушы компания",
        business_representative: "Бизнес өкілі",
        government_representative: "Мемлекеттік ұйым өкілі",
        other: "Басқа"
      },

      // Parking spaces
      parkingSpacesQuestion: "Зарядтау үшін қанша тұрақ орнын бөлуге болады?",
      parkingSpaces: {
        "1": "1 орын",
        "2": "2 орын",
        "3_4": "3–4 орын",
        "5_plus": "5 және одан көп орын",
        unknown: "Білмеймін"
      },

      // Site access
      siteAccessLabel: "Алаңға кіру тәртібі",
      siteAccesses: {
        "24_7": "Тәулік бойы (24/7)",
        business_hours: "Жұмыс уақытында",
        restricted: "Шектеулі кіру (шлагбаум/рұқсаттама)",
        other: "Басқа"
      },

      // Power status
      powerStatusQuestion: "Алаңның электрмен жабдықталуы туралы не белгілі?",
      powerStatuses: {
        available: "Бос қуат бар",
        upgrade_possible: "Қуатты арттыруға болады",
        probably_insufficient: "Қуат жеткіліксіз болуы мүмкін",
        unknown: "Білмеймін"
      },

      // Available power
      availablePowerLabel: "Шамамен қолжетімді қуат (міндетті емес)",
      availablePowers: {
        up_to_22: "22 кВт-қа дейін (баяу зарядтау)",
        "22_50": "22 – 50 кВт",
        "50_100": "50 – 100 кВт (жылдам зарядтау)",
        "100_200": "100 – 200 кВт",
        "200_plus": "200 кВт-тан астам (ультражылдам)",
        unknown: "Білмеймін"
      },

      // Preferred charger
      preferredChargerLabel: "Қалаулы станция түрі (міндетті емес)",
      preferredChargers: {
        ac: "Баяу (AC)",
        dc: "Жылдам (DC)",
        ac_dc: "Баяу және жылдам (AC + DC)",
        unknown: "Білмеймін / Маңызды емес"
      },

      // Cooperation types
      cooperationLabel: "Ынтымақтастық нұсқалары",
      cooperationHint: "Бір немесе бірнеше нұсқаны таңдаңыз",
      cooperationOptions: {
        provide_site: "Орын беруге дайынмын",
        rent: "Алаңды жалға беру",
        revenue_share: "Табысты бөлісу",
        co_invest: "Бірлесіп инвестициялауға дайынмын",
        own_investment: "Өз бетімше инвестициялауға дайынмын",
        discuss: "Нұсқаларды талқылағым келеді"
      },

      // Site offer form fields
      siteNameLabel: "Нысан / алаң атауы",
      siteNamePlaceholder: "Мысалы: Grand Park СОО, Almaty Towers БО",
      siteRoleLabel: "Бұл алаңдағы сіздің рөліңіз қандай?",
      representativeConfirmed: "Мен осы алаңның иесі немесе уәкілетті өкілімін.",
      contactNameLabel: "Байланыс тұлғасының аты",
      contactNamePlaceholder: "Сіздің атыңыз немесе өкілдің аты",
      contactPhoneLabel: "Телефон нөмірі (WhatsApp)",
      contactPhonePlaceholder: "+7 701 123 45 67",
      contactEmailLabel: "Email (міндетті емес)",
      contactEmailPlaceholder: "contact@example.kz",
      authorCommentSiteLabel: "Қоғамдық пікір (міндетті емес)",
      authorCommentSitePlaceholder: "Мысалы: даңғыл жағынан ыңғайлы кіру, қасында фудкорт бар",
      authorCommentSiteHint: "Бұл пікір алаң парақшасында барлық пайдаланушыларға көрінеді. Мұнда жеке байланыс мәліметтерін жазбаңыз.",
      submitSiteOffer: "Алаң ұсынысын жариялау",

      // Driver form
      chargers: { ac: "Баяу (AC)", dc: "Жылдам (DC)", unknown: "Маңызды емес" },
      frequencies: { unspecified: "Көрсетілмеген", daily: "Күн сайын", several_weekly: "Аптасына бірнеше рет", several_monthly: "Айына бірнеше рет", trips: "Сапар кезінде" },
      statuses: { collecting_votes: "Қолдау жиналуда", sent_to_operators: "Операторларға жіберілді", under_review: "Қаралуда", planned: "Орнату жоспарланды", installed: "Орнатылды", rejected: "Қабылданбады", archived: "Мұрағат" },
      back: "Картаға оралу",
      newTitle: "Орын ұсыну",
      step: "Қадам",
      next: "Жалғастыру",
      prev: "Артқа",
      submit: "Ұсынысты жариялау",
      placeStep: "Картадан орынды таңдаңыз",
      placeHelp: "Картаны басыңыз немесе маркерді жылжытыңыз.",
      useLocation: "Менің орным",
      address: "Мекенжай немесе орын сипаттамасы (міндетті емес)",
      locationStep: "Бұл қандай орын?",
      reasonStep: "Мұнда зарядтау неге қажет?",
      reasonPlaceholder: "Мысалы: жақын станциялар алыс және кешке бос емес",
      chargerStep: "Қандай зарядтау қажет?",
      connectors: "Коннекторлар (міндетті емес)",
      comment: "Қосымша пікір (міндетті емес)",

      // Auth
      authTitle: "Жалғастыру үшін кіріңіз",
      authText: "Ұсыныс, дауыс және пікір үшін жүйеге кіру керек.",
      signIn: "Кіру",
      devSignIn: "Жергілікті режимде кіру",
      authUnavailable: "Кіру уақытша қолжетімсіз.",
      validation: "Міндетті өрістерді тексеріңіз.",

      // Nearby dialogs
      duplicateTitle: "Жақын жерде ұсыныс бар. Қолдайсыз ба?",
      duplicateContinue: "Жаңасын бәрібір қосу",
      duplicateSupport: "Бар ұсынысты қолдау",
      nearbyVoteDemandTitle: "Жақын жерде жүргізушілердің өтінімі бар",
      nearbyVoteDemandText: "Жүргізушілер жақын маңға зарядтау орнатуды ұсынып қойған. Сіз бар орынды өз дауысыңызбен қолдай аласыз.",
      nearbyVoteDemandAction: "Жүргізушілер өтінімін қолдау",
      nearbyVerifySiteTitle: "Жақын жерде бизнес алаңы ұсынылған",
      nearbyVerifySiteText: "Бұл дәл сол алаң емес пе, тексеріңіз?",
      nearbyVerifySiteAction: "Бар алаңды ашу",
      nearbySupportOfferTitle: "Жақын жерде станция орнатуға дайын алаң бар!",
      nearbySupportOfferText: "Бизнес өкілі осы жерде зарядтау орнатуды қарастыруға дайын. Алаңды өз дауысыңызбен қолдаңыз!",
      nearbySupportOfferAction: "Бизнес алаңын қолдау",
      nearbyMatchDemandTitle: "Жақын жерде жүргізушілердің жоғары сұранысы бар!",
      nearbyMatchDemandText: "Электромобиль жүргізушілері осы аймақта зарядтауды сұрап қойған. Сіздің алаң ұсынысыңыз өте өзекті!",
      nearbyMatchDemandAction: "Алаңды қосуды жалғастыру",

      created: "Ұсыныс жарияланды",
      detailLoading: "Жүктелуде...",
      notFound: "Ұсыныс табылмады",
      reason: "Зарядтау неге қажет",
      frequency: "Жиілігі",
      preferred: "Қалаулы зарядтау",
      createdAt: "Құрылған күні",
      support: "Хочу зарядку здесь",
      supported: "Дауысыңыз есепке алынды",
      cancelVote: "Дауысты қайтару",
      share: "Бөлісу",
      shared: "Сілтеме көшірілді",
      comments: "Пікірлер",
      addComment: "Пікір қосу",
      commentPlaceholder: "Пікіріңіз",
      send: "Жіберу",
      noComments: "Пікір жоқ",
      disclaimer: "Ұсыныс орынға қызығушылықты білдіреді және станция орнатылатынына кепілдік бермейді",
      installApp: "Қосымшаны ашу",
      localMode: "Жергілікті демо режим",
      close: "Жабу",
      mapUnavailable: "Карта жүктелмеді.",
      mapKeyMissing: "Google Maps кілтін файлға қосыңыз",
      locateError: "Орныңызды анықтау мүмкін болмады.",
      all: "Барлығы",
      authSheetTitle: "Аккаунтқа кіру",
      authSheetSubtitle: "Орын ұсыну немесе қолдау үшін кіріңіз",
      signInGoogle: "Google арқылы жалғастыру",
      signInApple: "Apple арқылы жалғастыру",
      addVote: "Дауыс қосу",
      driver: "Жүргізуші",
      signOut: "Шығу",

      // Detail page site offer
      siteOfferBanner: "Алаң иесі мұнда зарядтау станциясын орнатуды қарастыруға дайын.",
      siteOfferCta: "Хочу зарядку здесь",
      parkingSpacesDetail: "Қолжетімді тұрақ орындары",
      siteAccessDetail: "Кіру тәртібі",
      powerStatusDetail: "Электрмен жабдықталуы",
      availablePowerDetail: "Қолжетімді қуат",
      preferredChargerDetail: "Қалаулы станция",
      siteNameDetail: "Нысан / алаң",

      myProposals: "Менің ұсыныстарым",
      noMyProposals: "Сізде әлі ұсыныстар жоқ",
      sortBy: "Сұрыптау",
      sortByDate: "Күні бойынша",
      sortByVotes: "Дауыс саны бойынша",
      newestFirst: "Алдымен жаңалары",
      oldestFirst: "Алдымен ескілері",
      mostVotes: "Көп дауыс",
      youAuthor: "Сіз авторсыз",
      cantRemoveAuthorVote: "Ұсыныс авторы өз дауысын қайтара алмайды",
      thankYouTitle: "Үлесіңіз үшін рақмет!",
      thankYouText: "Ұсынысыңыз жарияланды. Дауыс жинауды жеделдету үшін сілтемені көшіріп, жүргізушілер чаттарына немесе тұрғындар топтарына жіберіңіз.",
      copyLink: "Сілтемені көшіру",
      copiedLink: "✓ Сілтеме көшірілді",
      shareInChats: "Бөлісу",
      gotIt: "Түсінікті",
      shareTextTemplate: "Осы жерге электромобильдерге арналған зарядтау станциясын орнатуды ұсынамын.\nДауыс бергендер саны: {votes_count} адам.\nЕгер сізге де осы жерде зарядтау қажет болса — evPoint-те өз дауысыңызбен қолдаңыз:",
      shareSiteTextTemplate: "Мұнда электромобильдерге арналған зарядтау станциясын орнату ұсынылуда.\nЕгер сізге де осы жерде зарядтау қажет болса — evPoint-те өз дауысыңызбен қолдаңыз.\nДауыс бергендер саны: {votes_count} адам."
    },
    en: {
      title: "Where charging is needed",
      subtitle: "Show operators where you need more charging stations",
      propose: "Suggest a place",
      map: "Map",
      filters: "Filters",
      allStatuses: "All statuses",
      allLocations: "All places",
      allChargers: "Any charger",
      votes: "votes",
      open: "Open proposal",
      empty: "No proposals here yet. Add the first place",
      loading: "Loading proposals…",
      loadError: "Could not load proposals. Try again later.",

      // Source type selection
      sourceTypeTitle: "Select Request Type",
      sourceTypeSubtitle: "You can request charging as an EV driver or propose your venue as a business",
      driverDemandTitle: "I am an EV driver",
      driverDemandDesc: "I am an EV driver and want to suggest a location for a charging station.",
      siteOfferTitle: "I represent a site or business",
      siteOfferDesc: "I represent a site or business and am ready to consider installing a charging station.",

      // Filters & Badges
      filterAll: "All",
      filterDriverDemand: "Where charging is needed",
      filterSiteOffer: "Business site offers",
      badgeDriverDemand: "Charging needed",
      badgeSiteOffer: "Business site offer",
      driverVotes: "Driver votes",

      // Locations
      locations: {
        residential: "Residential complex or yard",
        office: "Work or office",
        mall: "Shopping centre",
        retail: "Retail store or supermarket",
        restaurant: "Restaurant or cafe",
        hotel: "Hotel",
        gas_station: "Gas station",
        parking: "Parking lot",
        roadside: "Roadside service",
        service_center: "Auto service or car wash",
        public_parking: "Public parking",
        hotel_tourism: "Hotel or tourist site",
        highway: "Highway",
        other: "Other"
      },

      // Site roles
      siteRoles: {
        owner: "Property owner",
        tenant: "Tenant",
        management_company: "Management company",
        business_representative: "Business representative",
        government_representative: "Government representative",
        other: "Other"
      },

      // Parking spaces
      parkingSpacesQuestion: "How many parking spaces can be allocated for charging?",
      parkingSpaces: {
        "1": "1 space",
        "2": "2 spaces",
        "3_4": "3–4 spaces",
        "5_plus": "5+ spaces",
        unknown: "Not sure"
      },

      // Site access
      siteAccessLabel: "Site access hours",
      siteAccesses: {
        "24_7": "24/7 (round the clock)",
        business_hours: "Business hours",
        restricted: "Restricted access (barrier/pass)",
        other: "Other"
      },

      // Power status
      powerStatusQuestion: "What is known about the site's power supply?",
      powerStatuses: {
        available: "Available capacity exists",
        upgrade_possible: "Power upgrade is possible",
        probably_insufficient: "Power is likely insufficient",
        unknown: "Not sure"
      },

      // Available power
      availablePowerLabel: "Approximate available power (optional)",
      availablePowers: {
        up_to_22: "Up to 22 kW (slow charging)",
        "22_50": "22 – 50 kW",
        "50_100": "50 – 100 kW (fast charging)",
        "100_200": "100 – 200 kW",
        "200_plus": "200+ kW (ultra-fast)",
        unknown: "Not sure"
      },

      // Preferred charger
      preferredChargerLabel: "Preferred charger type (optional)",
      preferredChargers: {
        ac: "Slow (AC)",
        dc: "Fast (DC)",
        ac_dc: "Both slow & fast (AC + DC)",
        unknown: "Doesn't matter / Not sure"
      },

      // Cooperation types
      cooperationLabel: "Cooperation options",
      cooperationHint: "Select one or more options",
      cooperationOptions: {
        provide_site: "Ready to provide site",
        rent: "Site lease / rent",
        revenue_share: "Revenue sharing",
        co_invest: "Ready to co-invest",
        own_investment: "Ready to invest independently",
        discuss: "Want to discuss options"
      },

      // Site offer form fields
      siteNameLabel: "Site or venue name",
      siteNamePlaceholder: "e.g. Grand Park Mall, Almaty Towers",
      siteRoleLabel: "What is your role at this venue?",
      representativeConfirmed: "I am the owner or authorized representative of this site.",
      contactNameLabel: "Contact person name",
      contactNamePlaceholder: "Your name or representative's name",
      contactPhoneLabel: "Phone number (WhatsApp)",
      contactPhonePlaceholder: "+7 701 123 45 67",
      contactEmailLabel: "Email (optional)",
      contactEmailPlaceholder: "contact@example.kz",
      authorCommentSiteLabel: "Public comment (optional)",
      authorCommentSitePlaceholder: "e.g. convenient driveway from the main street, food court nearby",
      authorCommentSiteHint: "This comment will be publicly visible on the proposal page. Do not include private contact details here.",
      submitSiteOffer: "Publish site offer",

      // Driver form
      chargers: { ac: "Slow (AC)", dc: "Fast (DC)", unknown: "Doesn’t matter" },
      frequencies: { unspecified: "Not specified", daily: "Daily", several_weekly: "Several times a week", several_monthly: "Several times a month", trips: "While travelling" },
      statuses: { collecting_votes: "Collecting support", sent_to_operators: "Sent to operators", under_review: "Under review", planned: "Installation planned", installed: "Installed", rejected: "Rejected", archived: "Archived" },
      back: "Back to map",
      newTitle: "Suggest a place",
      step: "Step",
      next: "Continue",
      prev: "Back",
      submit: "Publish proposal",
      placeStep: "Choose a place on the map",
      placeHelp: "Tap the map or drag the marker.",
      useLocation: "My location",
      address: "Address or place description (optional)",
      locationStep: "What kind of place is this?",
      reasonStep: "Why is charging needed here?",
      reasonPlaceholder: "For example: nearby chargers are far away and often busy",
      chargerStep: "What kind of charger is needed?",
      connectors: "Connector types (optional)",
      comment: "Additional comment (optional)",

      // Auth
      authTitle: "Sign in to continue",
      authText: "Creating proposals, voting and comments require sign-in.",
      signIn: "Sign in",
      devSignIn: "Sign in locally",
      authUnavailable: "Sign-in is temporarily unavailable.",
      validation: "Check the required fields.",

      // Nearby dialogs
      duplicateTitle: "A charging proposal already exists nearby. Support it?",
      duplicateContinue: "Create a new one anyway",
      duplicateSupport: "Support existing",
      nearbyVoteDemandTitle: "Driver demand already exists nearby",
      nearbyVoteDemandText: "Drivers have already suggested a charger nearby. You can support the existing request with your vote.",
      nearbyVoteDemandAction: "Support driver request",
      nearbyVerifySiteTitle: "A business site offer already exists nearby",
      nearbyVerifySiteText: "Please verify if this is the same site or venue.",
      nearbyVerifySiteAction: "Open existing site offer",
      nearbySupportOfferTitle: "A site is available for installation nearby!",
      nearbySupportOfferText: "A site owner is already ready to consider installing a charger here. Support this site with your vote!",
      nearbySupportOfferAction: "Support business site",
      nearbyMatchDemandTitle: "High driver demand nearby!",
      nearbyMatchDemandText: "EV drivers have already requested charging in this area. Your site offer will be in high demand!",
      nearbyMatchDemandAction: "Continue creating site offer",

      created: "Proposal published",
      detailLoading: "Loading...",
      notFound: "Proposal not found",
      reason: "Why charging is needed",
      frequency: "Frequency",
      preferred: "Preferred charger",
      createdAt: "Created",
      support: "I want a charger here",
      supported: "Your vote has been counted",
      cancelVote: "Remove vote",
      share: "Share",
      shared: "Link copied",
      comments: "Comments",
      addComment: "Add a comment",
      commentPlaceholder: "Your comment",
      send: "Send",
      noComments: "No comments yet",
      disclaimer: "A proposal shows interest and does not guarantee that a charging station will be installed",
      installApp: "Open the app",
      localMode: "Local demo mode",
      close: "Close",
      mapUnavailable: "The map could not load.",
      mapKeyMissing: "Add the Google Maps key to",
      locateError: "Could not determine your location.",
      all: "All",
      authSheetTitle: "Sign In",
      authSheetSubtitle: "Sign in to propose locations or support charging stations",
      signInGoogle: "Continue with Google",
      signInApple: "Continue with Apple",
      addVote: "Add vote",
      driver: "Driver",
      signOut: "Sign out",

      // Detail page site offer
      siteOfferBanner: "The site owner is ready to consider installing a charging station here.",
      siteOfferCta: "I want a charger here",
      parkingSpacesDetail: "Available parking spaces",
      siteAccessDetail: "Access hours",
      powerStatusDetail: "Power supply",
      availablePowerDetail: "Available power",
      preferredChargerDetail: "Preferred station",
      siteNameDetail: "Site / venue",

      myProposals: "My proposals",
      noMyProposals: "You have no proposals yet",
      sortBy: "Sort by",
      sortByDate: "By date",
      sortByVotes: "By votes",
      newestFirst: "Newest first",
      oldestFirst: "Oldest first",
      mostVotes: "Most voted",
      youAuthor: "You are author",
      cantRemoveAuthorVote: "The author cannot remove their vote",
      thankYouTitle: "Thank you for your contribution!",
      thankYouText: "Your proposal is published. Copy the link and share it in driver or local community chats to collect votes faster.",
      copyLink: "Copy link",
      copiedLink: "✓ Link copied",
      shareInChats: "Share",
      gotIt: "Got it",
      shareTextTemplate: "I propose installing an EV charging station at this location.\nAlready voted: {votes_count} people.\nIf you also need charging here, support this place with your vote on evPoint:",
      shareSiteTextTemplate: "A site is being offered here for EV charging station installation.\nIf you also need charging at this location, support it with your vote on evPoint.\nAlready voted: {votes_count} people."
    }
  };
}());
