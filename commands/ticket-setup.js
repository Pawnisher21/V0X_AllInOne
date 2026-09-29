const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketsetup')
        .setDescription('Setup pesan tiket dukungan'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan command ini!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 V0X Hub Support Ticket')
            .setDescription('Silakan klik tombol di bawah ini untuk membuka tiket baru.\nTim admin akan segera merespons Anda.')
            .setColor('Blue');

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Buka Tiket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        try {
            await interaction.channel.send({ embeds: [embed], components: [actionRow] });
            await interaction.reply({ content: 'Setup tiket berhasil disiapkan di channel ini!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Gagal mengirim pesan setup tiket.', ephemeral: true });
        }
    },
};
