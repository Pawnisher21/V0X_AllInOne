const { Events, EmbedBuilder } = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[member.guild.id] || {};

        const welcomeChannelId = guildConfig.WELCOME_CHANNEL_ID;
        const autoRoleId = guildConfig.AUTO_ROLE_ID;

        // Auto Role
        if (autoRoleId) {
            try {
                const role = member.guild.roles.cache.get(autoRoleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Assigned role ${role.name} to ${member.user.tag}`);
                } else {
                    console.error(`Auto role with ID ${autoRoleId} not found.`);
                }
            } catch (error) {
                console.error(`Failed to assign role to ${member.user.tag}:`, error);
            }
        }

        // Welcome Message
        if (welcomeChannelId) {
            try {
                const channel = member.guild.channels.cache.get(welcomeChannelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Selamat Datang di ${member.guild.name}!`)
                        .setDescription(`Halo ${member}, kami senang Anda bergabung dengan kami!\nJangan lupa untuk membaca peraturan server.`)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setColor('Green')
                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                } else {
                    console.error(`Welcome channel with ID ${welcomeChannelId} not found.`);
                }
            } catch (error) {
                console.error('Failed to send welcome message:', error);
            }
        }
    },
};
