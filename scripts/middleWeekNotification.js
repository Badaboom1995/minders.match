const {supabase} = require("../supabase");
const dayjs = require("dayjs");
const {bot} = require("../api");

const middleWeekNotification = async () => {
    const weekStart = dayjs().startOf('isoWeek').subtract(1, 'week');
    const { data: requests, error } = await supabase
        .from('Requests')
        .select('*')
        .gt('created_at', weekStart)

    const telegrams = requests.map(request => request.telegram)
    const { data: users, error: usersError } = await supabase
        .from('Users')
        .select('*')
        .in('telegram', telegrams)
        .eq('is_ready', true)
    for(let i = 0; i < users.length; i++) {
        await bot.telegram.sendMessage(users[i].chat_id, `✉️ Уже середина недели.
Напиши своему партнеру Random Coffee, если вдруг забыл(а).`
        )
    }
}

middleWeekNotification()