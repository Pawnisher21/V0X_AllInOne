const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Buat panel Button Role untuk member mengambil role sendiri')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role yang akan diberikan saat tombol diklik')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('pesan')
                .setDescription('Pesan instruksi pada Embed')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('label_tombol')
                .setDescription('Teks yang muncul di dalam tombol')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji untuk tombol (Opsional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('warna_embed')
                .setDescription('Warna embed (Opsional, Default: Green)')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin **Administrator**.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const pesan = interaction.options.getString('pesan');
        const label = interaction.options.getString('label_tombol');
        const emoji = interaction.options.getString('emoji');
        let finalColor = 'Green';
        const inputColor = interaction.options.getString('warna_embed');
        if (inputColor) {
            if (inputColor.startsWith('#')) {
                finalColor = inputColor;
            } else {
                finalColor = inputColor.charAt(0).toUpperCase() + inputColor.slice(1).toLowerCase();
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('✨ Dapatkan Role Anda!')
            .setDescription(pesan);
            
        try {
            embed.setColor(finalColor);
        } catch (e) {
            embed.setColor('Green');
        }

        const button = new ButtonBuilder()
            .setCustomId(`role_${role.id}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Primary);

        if (emoji) {
            try { button.setEmoji(emoji); } catch(e) { /* ignore invalid emoji */ }
        }

        const actionRow = new ActionRowBuilder().addComponents(button);

        try {
            await interaction.channel.send({ embeds: [embed], components: [actionRow] });
            await interaction.reply({ content: 'Panel Reaction Role berhasil dibuat!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Gagal membuat panel.', ephemeral: true });
        }
    },
};
