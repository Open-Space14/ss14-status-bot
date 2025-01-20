const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences
    ]
});

const STATUS_URL = 'http://ip:port/status (game server)';
let statusUpdateInterval;

client.on('ready', () => {
    console.log(`Бот ${client.user.tag} запущен и готов к работе!`);
    updateStatus();
    statusUpdateInterval = setInterval(updateStatus, 10000); // Обновление статуса каждые 10 секунд
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'send-status') {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({ content: 'У вас нет прав администратора!', ephemeral: true });
            return;
        }

        try {
            const response = await axios.get(STATUS_URL);
            const data = response.data;

            const embed = new EmbedBuilder()
                .setTitle(data.name)
                .setDescription(`**Онлайн:** ${data.players}/${data.soft_max_players}\n**Карта:** ${data.map}\n**Режим:** ${data.preset}\n**Идентификатор раунда:** ${data.round_id}\n${getTimeDifference(data.round_start_time)}`)
                .setColor(0x00FF00)
                .setThumbnail('https://i.postimg.cc/dV29CGcd/LOGO2-1-640-640.png');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при получении статуса:', error);
            await interaction.reply({ content: 'Произошла ошибка при получении статуса сервера.', ephemeral: true });
        }
    }
});

function getTimeDifference(roundStartTimeStr) {
    const roundStartTime = new Date(roundStartTimeStr);
    const currentTime = new Date();
    const timeDiff = currentTime - roundStartTime;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
        return `Продолжительность: ${minutes} минут`;
    } else if (hours === 1) {
        return `Продолжительность: ${hours} час ${minutes} минут`;
    } else if (hours >= 2 && hours <= 4) {
        return `Продолжительность: ${hours} часа ${minutes} минут`;
    } else {
        return `Продолжительность: ${hours} часов ${minutes} минут`;
    }
}

async function updateStatus() {
    try {
        const response = await axios.get(STATUS_URL);
        const data = response.data;

        const players = data.players;
        const maxPlayers = data.soft_max_players;

        client.user.setActivity(`Онлайн: ${players}/${maxPlayers}`, { type: ActivityType.Watching });
        console.log(`Статус обновлен: ${players}/${maxPlayers}`);
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
    }
}

client.login('Discord Bot Token');
