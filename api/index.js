const {Telegraf, Markup, Scenes, session} = require('telegraf');
const {messages} = require("../config");
const {makeKeyboard} = require("../helpers/keyboard");
const {editScene} = require("../scenes/editScene");
const {requestScene} = require("../scenes/requestScene");
const {profileNormalizeScene} = require("../scenes/profileNormalizeScene");
const {getUserFormDB, sendProfile} = require("../helpers/getUserFormDB");
const {sendToAdmins} = require("../helpers/sendToAdmins");
const {supabase} = require("../supabase");
const {wait} = require("../helpers/wait");
const cloudinary = require('cloudinary').v2;

const { init, track } = require('@amplitude/analytics-node');

init('fc185899af59f00b16d189f6bae75ad');

const dayjs = require('dayjs');
const weekOfYear = require("dayjs/plugin/weekOfYear");
const weekday = require("dayjs/plugin/weekday");
dayjs.extend(weekOfYear)
dayjs.extend(weekday)

cloudinary.config({
    cloud_name: "dgpgmk0w7",
    api_key: "928942683275635",
    api_secret: "p2Zvcv3kPZt0bLNpBbHhSNZXiac"
});

const devToken = '6130195892:AAFB22x7qbo0wICcuSXffFHSyflc4tYm0b4'
const prodToken = '5888882359:AAGcta__XatJMomOeSNIzTvQ9k5y7ejP8jQ'
const bot = new Telegraf(prodToken);

const stage = new Scenes.Stage([editScene, requestScene, profileNormalizeScene]);
bot.use(session());
bot.use(stage.middleware());

bot.telegram.setWebhook('https://minders-match.vercel.app/api/index');

module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};

const updatePairInSupabase = async (user, impression) => {
    const { data, error } = await supabase
        .from('Pairs')
        .select('*')
        .or(`user.eq.${user}, partner.eq.${user}`)
        .single()

        const fieldName = data.user === user ? 'impression_user' : 'impression_partner'
        await supabase
        .from('Pairs')
        .update({ [fieldName]: impression })
        .eq('id', data.id)
        .single()
}

const saveChatId = async (ctx) => {
    const {error} = await supabase
        .from('Users')
        .update({ chat_id: ctx.chat.id })
        .eq('telegram', ctx.from.username);

    if (error && ctx.session.id_save_counter < 3) {
        ctx.session.id_save_counter = ctx.session.id_save_counter ? ctx.session.id_save_counter + 1 : 1;
        saveChatId(ctx);
    }
}

bot.start(async (ctx) => {
    track('start', undefined, {
        user_id: ctx.from.username,
    });
    const username =  ctx.from.username;
    const {user, error} = await getUserFormDB(username);
    if (user){
        saveChatId(ctx);
        ctx.session.user = user
    } else {
        await supabase
            .from('Users')
            .insert([{
                telegram: ctx.from.username,
                chat_id: ctx.chat.id,
            }])
        const {user, error} = await getUserFormDB(username);
        ctx.session = {user}
    }
    // track('bot start', {
    //     user_id: ctx.from.username,
    //     username: ctx.from.username,
    // })
    await ctx.reply(messages.welcome(ctx.from.first_name), Markup.inlineKeyboard(makeKeyboard(['Поехали 🚀'], 3, 'sync'), {columns: 3}));
});

bot.action(/sync(.+)/, async (ctx) => {
    track('sync button pushed',undefined, {
        user_id: ctx.from.username,
    })
    await ctx.answerCbQuery();
    await wait(1000);
    await ctx.scene.enter('profileNormalize');
})

bot.action(/isRight_(.+)/, async (ctx) => {
    const optionName = ctx.match[1];
    await ctx.answerCbQuery(); // Required to close the loading state on the button
    if(optionName === 'Да, мой') {
        track('profile recognized',undefined, {
            user_id: ctx.from.username,
        })
        await ctx.reply(`Супер, нужно заполнить недостающие поля`);
        await wait(1000);
        await ctx.scene.enter('profileNormalize');
    } else {
        track('profile not recognized',undefined, {
            user_id: ctx.from.username,
        })
        await ctx.reply(`Написал в поддержку, скоро тебе помогут`);
        const timestamp = new Date().toLocaleString();
        await sendToAdmins(`🚨Пользователь ${ctx.from.username} не признал свой профиль, ${timestamp}`, bot)
    }
})

bot.action(/get_review(.+)/, async (ctx) => {
    const answer = ctx.match[1]
    await ctx.answerCbQuery();
    if(answer === '_Да, встретились!') {
        ctx.reply('Как прошла встреча?', Markup.inlineKeyboard(makeKeyboard(['Отлично', 'Нормально', 'Ну такое'], 3, 'meet_quality'), {columns: 3}))
    }
    if(answer === '_Нет, встретимся позже') {
        await updatePairInSupabase(ctx.from.username, 'later')
        await ctx.reply(`Окей, записал`);
    }
    if(answer === '_Не договорились') {
        await updatePairInSupabase(ctx.from.username, 'not_met')
        await ctx.reply(`Окей, записал`);
    }
})

bot.action(/meet_quality(.+)/, async (ctx) => {
    // const username =  ctx.from.username;
    // const {user, error} = await getUserFormDB(username);
    const answer = ctx.match[1]
    if(answer === '_Отлично'){
        await updatePairInSupabase(ctx.from.username, 'great')
    }
    if(answer === '_Нормально'){
        await updatePairInSupabase(ctx.from.username, 'ok')
    }
    if(answer === '_Ну такое'){
        await updatePairInSupabase(ctx.from.username, 'bad')
    }
    await ctx.answerCbQuery();
    await ctx.reply(`Окей, записал`);
})

bot.hears('👤 Профиль', async (ctx) => {
    await sendProfile(ctx, true)
    // await ctx.reply('Действия:', Markup.inlineKeyboard(makeKeyboard(['📝 Редактировать'], 2, 'profileActions'), {columns: 2}))

});
bot.hears('🤲 Поддержка', async (ctx) => {
    await ctx.reply('Если что-то пошло не так напиши @badavoo или @ivan_tyumenyev в личку. Мы обязательно поможем')
});
bot.hears('👥 Пара этой недели', async (ctx) => {
    await ctx.reply('Ваша пара на этой неделе:')
    await ctx.reply('Хотите изменить?')
});
bot.hears('🗣 Запрос', async (ctx) => {
    await ctx.reply('Ваш текущий запрос выглядит так')
    await ctx.reply('Хотите что то изменить?')
});
bot.hears('⏸ Поставить на паузу', async (ctx) => {
    await ctx.reply('Вам не будут приходить оповещения до конца следующей недели')
});

bot.action(/profileActions_(.+)/, async (ctx) => {
    const optionName = ctx.match[1];
    await ctx.answerCbQuery(); // Required to close the loading state on the button
    if(optionName === '📝 Редактировать') {
        await ctx.scene.enter('editScene');
    }
})

const multyChoiceFields = ['skills', 'hobbies']
bot.action(/editProfile_(.+)/, async (ctx) => {
    const optionName = ctx.match[1];
    if(!multyChoiceFields.includes(optionName)) {

    }
    await ctx.answerCbQuery(); // Required to close the loading state on the button
    console.log(optionName)
    if(optionName === '📝 Редактировать') {
        await ctx.scene.enter('editScene');
    }
})

bot.on('text', async (ctx) => {
    track('text',
        {text: ctx.message.text},
        {user_id: ctx.from.username})
});

module.exports = {bot}
// bot.on('text', async (ctx) => {
//     if(ctx.message.text === '/start') return
//     if(ctx.message.text === 'edit'){
//         await ctx.scene.enter('editProfile');
//     }
//
//     if(ctx.message.text === 'skills') {
//         // reply with inline keyboard of skills
//         ctx.reply('💻Tехнические навыки', Markup.inlineKeyboard(makeKeyboard(skills.tech, 3), {columns: 3}));
//         ctx.reply('💼 Бизнес', Markup.inlineKeyboard(makeKeyboard(skills.business, 3), {columns: 3}));
//         ctx.reply('🎨 Креативность', Markup.inlineKeyboard(makeKeyboard(skills.creative, 3), {columns: 3}));
//         ctx.reply('💜 Софт скилз', Markup.inlineKeyboard(makeKeyboard(skills.soft_skills, 3), {columns: 3}));
//         // ctx.reply('Business skills', Markup.inlineKeyboard(businessKeys));
//     }
//     if(ctx.message.text === 'hobbies') {
//         const hightCategoryKeyboard = Object.keys(hobbies).reduce((acc,key) => {
//             return [...acc, [Markup.button.callback(key, `option_${key}`)]];
//         },[]);
//         ctx.replyWithHTML(`<b><code> Выберите категорию </code></b>`, Markup.inlineKeyboard(hightCategoryKeyboard,{columns:1}));
//     }
// });
//
//
// bot.action(/skill_(.+)/, async (ctx) => {
//     const optionName = ctx.match[1];
//     await ctx.answerCbQuery(); // Required to close the loading state on the button
//     await ctx.replyWithHTML(`<b>${optionName}</b> skill has been added to your profile`);
// })
// bot.action(/option_(.+)/, async (ctx) => {
//     const optionName = ctx.match[1];
//     await ctx.answerCbQuery(); // Required to close the loading state on the button
//     await ctx.replyWithHTML(`<b>${optionName}</b> skill has been added to your profile`);
// })


// GPT_API_KEY = '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'
// TOKEN_PROD = '5888882359:AAGcta__XatJMomOeSNIzTvQ9k5y7ejP8jQ'
// TOKEN_DEV = '6130195892:AAFB22x7qbo0wICcuSXffFHSyflc4tYm0b4'
// AMPLITUDE_API_KEY = 'fc185899af59f00b16d189f6bae75ad'
// NODE_ENV = 'development'

// bot.launch();
// console.log('bot started');
