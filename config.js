const messages = {
    // welcome: (name) => `Привет ${name}! Это рандомный кофе от minders. Возможно ты уже заполнял анкету, сейчас поищу, секунду...⏳`,
    welcome: (name) => `Привет!
Я Matching бот сообщества Minders
Каждую неделю я буду предлагать тебе для встречи интересного человека, случайно выбранного среди других участников сообщества.
Чтобы принять участие во встречах, нужно заполнить анкету.
Если у меня уже есть какие-то данные о тебе, я пропущу соответствующие вопросы.

Ищу, секунду...⏳`,
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
    {id: 'productManagement', name: 'Управление продуктом'},
    {id: 'sales', name: 'Продажи'},
    {id: 'finance', name: 'Финансы'},
    {id: 'uxUiDesign', name: 'UX/UI'},
    {id: 'mobileAppDevelopment', name: 'Мобильные приложения'},
    {id: 'dataScience', name: 'Data Science'},
    {id: 'blockchain', name: 'Блокчейн'},
    {id: 'eventManagement', name: 'Мероприятия'},
    {id: 'mediaMarketing', name: 'Медиа'},
    {id: 'law', name: 'Юридические'},
    {id: 'hr', name: 'Кадры'},
    {id: 'operationsManagement', name: 'Операции'},
    {id: 'logistics', name: 'Логистика'},
    {id: 'sustainability', name: 'Экология'},
    {id: 'education', name: 'Обучение'},
    {id: 'ventureInvesting', name: 'Венчурные инвестиции'},
    {id: 'privateInvesting', name: 'Частные инвестиции'}
];
const hobbiesDict = [
    {id: 'travel', name: 'Путешествия'},
    {id: 'fitness', name: 'Фитнес'},
    {id: 'cooking', name: 'Кулинария'},
    {id: 'art', name: 'Искусство'},
    {id: 'cars', name: 'Автомобили'},
    {id: 'photography', name: 'Фото/Видео'},
    {id: 'music', name: 'Музыка'},
    {id: 'movies', name: 'Кино'},
    {id: 'literature', name: 'Литература'},
    {id: 'yoga', name: 'Йога'},
    {id: 'gaming', name: 'Игры'},
    {id: 'cycling', name: 'Велоспорт'},
    {id: 'hiking', name: 'Хайкинг'},
    {id: 'fashion', name: 'Мода'},
    {id: 'dance', name: 'Танцы'},
    {id: 'gardening', name: 'Садоводство'},
    {id: 'handmade', name: 'Хендмейд'},
    {id: 'pets', name: 'Животные'},
    {id: 'volunteering', name: 'Волонтерство'},
    {id: 'language', name: 'Языки'}
];



module.exports = {messages, userDataDict, skillsDict, hobbiesDict}