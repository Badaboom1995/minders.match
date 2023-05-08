const messages = {
    welcome: (name) => `Привет!👋
Я нетворкинг бот сообщества minders для встреч один на один. Мы объединяем фаундеров, инвесторов, IT профессионалов и просто хороших людей на Бали 🤖

Каждую неделю я буду предлагать тебе для встречи интересного человека, специально подобранного для тебя среди других участников сообщества.

Чтобы принять участие во встречах, нужно заполнить анкету.💡
Если у меня уже есть какие-то данные о тебе, я пропущу соответствующие вопросы.`,
    foundProfile: () => `Кажется нашел! Проверь все ли совпало`,
    notFoundProfile: () => `К сожалению не нашел 😞, отправил сообщение админу, он скоро придет к тебе на помощь`,
    noHobbies: () => `Пусто`,
    noSkills: () => `Пусто`,
    noRequests: () => `Пусто`,
    noSuperpower: () => `Пусто`,

}

const userDataDict = {
    name: 'Имя',
    profile_photo_url: 'Фото',
    description: 'Описание',
    requests: 'Запросы',
    superpower: 'Суперсила',
    skills: 'Навыки',
    hobbies: 'Увлечения',
    groups: 'К какой группе относитесь',
}

const skillsDict = [
    {id: 'startup', name: 'Стартапы'},
    {id: 'marketing', name: 'Маркетинг'},
    {id: 'advertisement', name: 'Рекламам'},
    {id: 'productManagement', name: 'Управление продуктом'},
    {id: 'sales', name: 'Продажи'},
    {id: 'bizdev', name: 'Бизнес развитие'},
    {id: 'finance', name: 'Финансы'},
    {id: 'uxUiDesign', name: 'UX/UI'},
    {id: 'mobileAppDevelopment', name: 'Мобильная разработка'},
    {id: 'dataScience', name: 'Data Science'},
    {id: 'blockchain', name: 'Блокчейн'},
    {id: 'blockchain', name: 'Machine Learning'},
    {id: 'eventManagement', name: 'Организация мероприятий'},
    {id: 'mediaMarketing', name: 'Медиа маркетинг'},
    {id: 'law', name: 'Юриспруденция'},
    {id: 'hr', name: 'HR'},
    {id: 'operationsManagement', name: 'Операционный менеджмент'},
    {id: 'logistics', name: 'Логистика'},
    {id: 'sustainability', name: 'Экология'},
    {id: 'education', name: 'Образование'},
    {id: 'ventureInvesting', name: 'Венчурные инвестиции'},
    {id: 'privateInvesting', name: 'Частные инвестиции'}
];

const hobbiesDict = [
    {id: 'travel', name: 'Путешествия'},
    {id: 'fitness', name: 'Фитнес'},
    {id: 'cooking', name: 'Кулинария'},
    {id: 'art', name: 'Искусство'},
    {id: 'cars', name: 'Автомобили'},
    {id: 'cars', name: 'Мотоциклы'},
    {id: 'photography', name: 'Фото/Видео'},
    {id: 'music', name: 'Музыка'},
    {id: 'movies', name: 'Кино/Сериалы'},
    {id: 'literature', name: 'Литература'},
    {id: 'yoga', name: 'Йога'},
    {id: 'meditation', name: 'Медитация'},
    {id: 'gaming', name: 'Видеоигры'},
    {id: 'boardGames', name: 'Настольные игры'},
    {id: 'cycling', name: 'Велоспорт'},
    {id: 'hiking', name: 'Хайкинг'},
    {id: 'running', name: 'Бег'},
    {id: 'squash', name: 'Сквош'},
    {id: 'tennis', name: 'Теннис'},
    {id: 'extreme', name: 'Экстримальный спорт'},
    {id: 'fashion', name: 'Мода'},
    {id: 'dance', name: 'Танцы'},
    {id: 'gardening', name: 'Садоводство'},
    {id: 'handmade', name: 'Хендмейд'},
    {id: 'pets', name: 'Животные'},
    {id: 'volunteering', name: 'Волонтерство'},
    {id: 'language', name: 'Языки'}
];

module.exports = {messages, userDataDict, skillsDict, hobbiesDict}