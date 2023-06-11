const {supabase} = require("../supabase");
const dayjs = require("dayjs");
const {sendProfileByChatId} = require("../helpers/getUserFormDB");
const {bot} = require("../api");


function findMultiplePairings(pairs) {
    const pairings = new Map();

    pairs.forEach(pair => {
        const user1 = pair.user;
        const user2 = pair.profile;

        if(pairings.has(user1)) {
            pairings.set(user1, pairings.get(user1).add(user2));
        } else {
            pairings.set(user1, new Set([user2]));
        }

        if(pairings.has(user2)) {
            pairings.set(user2, pairings.get(user2).add(user1));
        } else {
            pairings.set(user2, new Set([user1]));
        }
    });

    let multiplePairings = [];

    for (let [user, pairSet] of pairings) {
        if(pairSet.size > 1) {
            multiplePairings.push(user);
        }
    }

    return multiplePairings;
}


const getMainGroup = (user) => {
    if(!user) return 'other'
    if(user.groups.includes('Я инвестор')) {
        return 'investor'
    }
    if(user.groups.includes('Я основатель')) {
        return 'founder'
    }
    if(user.groups.includes('Я творческая личность') || user.groups.includes('Я специалист')) {
        return 'professional'
    }
    return 'other'
}

const checkGroupMatch = (user, profile) => {
    const mainGroup = getMainGroup(user)
    const profileMainGroup = getMainGroup(profile)
    if(mainGroup === profileMainGroup) {
        return true
    } else {
        return false
    }
}
let requests = []
const getWeekRequests = async () => {
    const weekStart = dayjs().startOf('isoWeek').subtract(1, 'week');
    // get previous week requests
    // const { data: prevWeekRequests, error } = await supabase
    //     .from('Requests')
    //     .select('*')
    //     .gt('created_at', weekStart)

    const weekRequests = await supabase.from('Requests').select('*')
    return weekRequests.data
}

const findPersonalMatch = (user, clusters, start, pairedUsers, isLastChance) => {
    const userRequests = requests?.find(request => request.telegram === user.telegram)
    const currClusters = clusters.slice(start.clusterIndex)
    currClusters[0] = currClusters[0].slice(start.index + 1)
    let bestMatch = { profile: null, score: 0 }
    currClusters.some((cluster, i) => {
        cluster.forEach((profile, j) => {
            // console.log(user.telegram, profile.telegram)
            const funProfit = 10
            const userSkills = user.skills.split(',')
            const userHobbies = user.hobbies.split(',')
            const profileSkills = profile.skills.split(',')
            const profileHobbies = profile.hobbies.split(',')
            const userRequests = requests?.find(request => request.telegram === user.telegram)
            const profileRequests = requests?.find(request => request.telegram === profile.telegram)
            const formatMatch = userRequests.format === profileRequests.format

            if(profile.id === user.id || pairedUsers.has(profile)) return
            if(!formatMatch && !isLastChance) {
                // console.log('format mismatch', user.telegram, profile.telegram)
                return
            }
            if(userRequests.format === 'Офлайн' && userRequests.location !== profileRequests.location && !isLastChance) {
                // console.log('location mismatch', user.telegram, profile.telegram)
                return
            }

            // console.log(userRequests.location, profileRequests.location, formatMatch && userRequests.format === 'offline' && userRequests.location !== profileRequests.location)
            let score = 0
            // filter if already have been paired
                // check in table Pairs

            if(getMainGroup(user) === getMainGroup(profile)) {
                score += 100
                // console.log(user.telegram, 'matched with', profile.telegram, 'by group', getMainGroup(user))
            }
            profileSkills?.forEach(skill => {
                if(userSkills.includes(skill)) {
                    score += 10 * funProfit
                    // console.log(user.telegram, 'matched with', profile.telegram, 'by skill', skill)
                }
            });
            profileHobbies?.forEach(hobby => {
                if(userHobbies.includes(hobby)) {
                    score += 10 * (10 - funProfit)
                    // console.log(user.telegram, 'matched with', profile.telegram, 'by hobby', hobby)
                }
            });
            if(profile.age > user.age - 2 && profile.age < user.age + 2) {
                score += 50
                // console.log(user.telegram, 'matched with', profile.telegram, 'by age')
            }
            // console.log('total scroe is:', score)
            if(bestMatch.score < score) {
                bestMatch = {profile, score, isLastChance}
            }
            // if(!bestMatch.profile){
            //     console.log(profile, user)
            // }
        })
        if(bestMatch.score > 200) {
            return true
        }
    })
    if(bestMatch.profile === null) {
        return findPersonalMatch(user, clusters, {clusterIndex: 0, index: 0}, new Set(), true)
    }
    return {...bestMatch, user}
}

const runMatching = (clusters) => {
    const pairs = []
    const pairedUsers = new Set();
    clusters.forEach((cluster, clusterIndex) => {
        cluster.forEach((user, index) => {
            if (pairedUsers.has(user)) return;
            const pair = findPersonalMatch(user, clusters, {clusterIndex, index}, pairedUsers)
            pairs.push(pair);
            pairedUsers.add(user);
            pairedUsers.add(pair.profile);
        })
    })
    // console.log(pairs.map(pair => ({user: pair.user.telegram, profile: pair.profile.telegram, isLastChance: pair.isLastChance})))
    // console.log(pairs)
    // sendProfileByChatId('208165379', pairs[0].user)
    // pairs.forEach( pair => {
    //     // send pair with hello message and instructions
    //     // one in charge for meeting
    //     // if isLastChance send with warning
    //     console.log('pair:', pair.user.telegram, pair.profile.telegram)
    //     console.log('to', pair.user.telegram, 'send', `
    //         Привет! Мы нашли тебе пару на эту неделю: @${pair.profile.telegram}.
    //         Случайным образом мы выбрали тебя в качестве ответственного за встречу. Пожалуйста, свяжись с @${pair.profile.telegram} и договорись о встрече.
    //
    //         ${pair.isLastChance ? 'К сожалению на этой неделе не нашлось людей в твоей локации, поэтому предлагаем вам встретиться онлайн' : ''}
    //     `)
    //     console.log('to', pair.profile.telegram, 'send', `
    //         Привет! Мы нашли тебе пару на эту неделю: @${pair.user.telegram}.
    //
    //         ${pair.isLastChance ? 'К сожалению на этой неделе не нашлось людей в твоей локации, поэтому предлагаем вам встретиться онлайн' : ''}
    //     `)
    // })
    const multiplePairs = findMultiplePairings(pairs)
    const sendPair = async (pair) => {
            // first user
        try {
            await bot.telegram.sendMessage(pair.user.chat_id, `Привет! Твоя пара на эту неделю -  @${pair.profile.telegram}`)
            await sendProfileByChatId(pair.user.chat_id, pair.profile)
            await bot.telegram.sendMessage(pair.user.chat_id, `Случайным образом мы выбрали тебя в качестве ответственного за встречу. Пожалуйста, свяжись с @${pair.profile.telegram} и договорись о встрече.`)
            // second user
            await bot.telegram.sendMessage(pair.profile.chat_id, `Привет! Твоя пара на эту неделю -  @${pair.user.telegram}`)
            await sendProfileByChatId(pair.profile.chat_id, pair.user)
            if(pair.isLastChance) {
                await bot.telegram.sendMessage(pair.user.chat_id, 'К сожалению на этой неделе не нашлось людей в твоей локации, поэтому предлагаем вам встретиться онлайн')
                await bot.telegram.sendMessage(pair.profile.chat_id, 'К сожалению на этой неделе не нашлось людей в твоей локации, поэтому предлагаем вам встретиться онлайн')
            }
            // send to admin
            await bot.telegram.sendMessage('208165379', `Отправлено ${pair.user.telegram} и ${pair.profile.telegram}`)
        } catch(e) {
            // send to admin
            await bot.telegram.sendMessage('208165379', `Что то пошло не так при отправке ${pair.user.telegram} и ${pair.profile.telegram}. ${e}`)
        }
    }
    multiplePairs.forEach(async user => {
        await bot.telegram.sendMessage(user.chat_id, `На этой неделе у нас нечетное количество участников и тебе досталась дополнительная пара :)`)
    })
    pairs.forEach( pair => {
      sendPair(pair)
    })
}
const weeklyMatching = async () => {
   // get all users from supabase
    let { data: Users, error } = await supabase
        .from('Users')
        .select('*')
        .eq('is_ready', true)
    requests = await getWeekRequests()
    const clasters = Users.reduce( (acc, user) => {
        if(user.groups.includes('Я инвестор')) {
            acc.investors.push(user)
            return acc
        }
        if(user.groups.includes('Я основатель')) {
            acc.founders.push(user)
            return acc
        }
        if(user.groups.includes('Я творческая личность') || user.groups.includes('Я специалист')) {
            acc.specialists.push(user)
            return acc
        }
        acc.others.push(user)
        return acc
    },{
        investors: [],
        founders: [],
        specialists: [],
        others: []
    })
    const sortedClusters = [clasters.investors, clasters.founders,clasters.specialists]
    runMatching(sortedClusters)
    return
}

weeklyMatching()
