const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streamersetup')
        .setDescription('Setup panel Request Role Streamer'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan command ini!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎥 Request Role Streamer')
            .setDescription('Ingin role Streamer agar saat kamu live langsung ada notifikasi otomatis? \n\nKlik tombol di bawah ini dan isi form-nya dengan Link Channel / Platform kamu (minimal 1 link)!')
            .setColor('Purple');

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('req_streamer')
                .setLabel('Request Streamer Role')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📺')
        );

        try {
            await interaction.channel.send({ embeds: [embed], components: [actionRow] });
            await interaction.reply({ content: 'Panel Streamer Role berhasil disiapkan!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Gagal mengirim panel.', ephemeral: true });
        }
    },
};
