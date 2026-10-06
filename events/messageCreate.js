const { Events } = require('discord.js');

const TARGET_ID = '257837387533516800';
// ponytail: using single global timeout for simplest state. Reset on new ping, cleared on any message from target.
let afkTimeout = null;

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.author.id === TARGET_ID) {
            if (afkTimeout) {
                clearTimeout(afkTimeout);
                afkTimeout = null;
            }
            return;
        }

        if (message.mentions.has(TARGET_ID)) {
            await message.reply(`Saya akan menghubungi <@${TARGET_ID}> segera, harap menunggu.`);

            try {
                const targetUser = await client.users.fetch(TARGET_ID);
                await targetUser.send(`Anda di-tag oleh **${message.author.tag}** di server **${message.guild?.name || 'DM'}** channel **${message.channel.name || 'DM'}**.\nLink: ${message.url}`);
            } catch (error) {
                // ignore dm errors
            }

            if (afkTimeout) clearTimeout(afkTimeout);
            afkTimeout = setTimeout(async () => {
                try {
                    await message.channel.send(`Mohon maaf, saat ini <@${TARGET_ID}> sedang tidak berada di depan PC / AFK. Akan diinfokan lebih lanjut jika sudah kembali.`);
                } catch (e) {}
                afkTimeout = null;
            }, 20 * 60 * 1000);
        }
    },
};
