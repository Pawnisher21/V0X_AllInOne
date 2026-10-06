const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Kirim pembaruan atau pengumuman ke server')
        .addStringOption(option => 
            option.setName('judul')
                .setDescription('Judul dari update/pengumuman')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('deskripsi')
                .setDescription('Isi dari update/pengumuman')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan command ini!', ephemeral: true });
        }
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[interaction.guild.id] || {};
        
        const updateChannelId = guildConfig.UPDATE_CHANNEL_ID;
        if (!updateChannelId) {
            return interaction.reply({ content: 'Channel pembaruan tidak diatur untuk server ini di config.json!', ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(updateChannelId);
        if (!channel) {
            return interaction.reply({ content: 'Channel pembaruan tidak ditemukan!', ephemeral: true });
        }

        const title = interaction.options.getString('judul');
        const description = interaction.options.getString('deskripsi');

        const embed = new EmbedBuilder()
            .setTitle(`📢 ${title}`)
            .setDescription(description)
            .setColor('DarkRed')
            .setFooter({ text: `Update oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: `Pembaruan berhasil dikirim ke ${channel}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat mengirim pembaruan.', ephemeral: true });
        }
    },
};
