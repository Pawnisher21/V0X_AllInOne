const { Events, EmbedBuilder, ActivityType } = require('discord.js');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        // Harus ada object presence dan membernya
        if (!newPresence || !newPresence.member) return;

        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[newPresence.guild.id] || {};

        // Base Role untuk izin sistem notifikasi Streamer
        const baseStreamerRoleId = guildConfig.STREAMER_ROLE_ID;
        if (!baseStreamerRoleId || !newPresence.member.roles.cache.has(baseStreamerRoleId)) return;

        // Cek activity streaming
        const wasStreaming = oldPresence ? oldPresence.activities.some(activity => activity.type === ActivityType.Streaming) : false;
        const isStreaming = newPresence.activities.some(activity => activity.type === ActivityType.Streaming);

        // Role The Showman (Diberikan dinamis HANYA saat live)
        const dynamicLiveRoleId = guildConfig.DYNAMIC_LIVE_ROLE_ID;

        // Jika baru mulai live stream
        if (!wasStreaming && isStreaming) {
            
            // Tambahkan role The Showman
            try {
                if (!newPresence.member.roles.cache.has(dynamicLiveRoleId)) {
                    await newPresence.member.roles.add(dynamicLiveRoleId);
                }
            } catch (error) {
                console.error("Gagal memberikan role dinamis The Showman:", error);
            }

            const streamActivity = newPresence.activities.find(activity => activity.type === ActivityType.Streaming);
            
            const notificationChannelId = guildConfig.NOTIFICATION_CHANNEL_ID;
            const channel = notificationChannelId ? newPresence.guild.channels.cache.get(notificationChannelId) : null;
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`🎥 ${newPresence.user.username} Sedang Live Sekarang!`)
                    .setDescription(`**Game / Aktivitas:** ${streamActivity.state || streamActivity.name || 'Tidak diketahui'}\n\n**Tonton di:** [Klik Disini](${streamActivity.url || '#'})`)
                    .setColor('Purple')
                    .setThumbnail(newPresence.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();
                
                await channel.send({ content: `Hai @everyone, ${newPresence.member} sedang Live Stream! 🎉`, embeds: [embed] });
            }
        }

        // Jika baru selesai live stream (kembali offline/bermain game biasa)
        if (wasStreaming && !isStreaming) {
            // Cabut role The Showman
            try {
                if (newPresence.member.roles.cache.has(dynamicLiveRoleId)) {
                    await newPresence.member.roles.remove(dynamicLiveRoleId);
                }
            } catch (error) {
                console.error("Gagal mencabut role dinamis The Showman:", error);
            }
        }
    },
};
