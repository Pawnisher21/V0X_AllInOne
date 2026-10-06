const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('projectsetup')
        .setDescription('Setup informasi awal proyek jasa klien')
        .addStringOption(option => 
            option.setName('nama_klien')
                .setDescription('Nama Klien')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('nama_proyek')
                .setDescription('Nama atau judul proyek')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('deskripsi')
                .setDescription('Deskripsi singkat tentang proyek ini')
                .setRequired(true)),
                
    async execute(interaction) {
        if (interaction.guild.id !== '709279383340318740') {
            return interaction.reply({ content: 'Command ini khusus untuk server tertentu.', ephemeral: true });
        }

        const clientName = interaction.options.getString('nama_klien');
        const projectName = interaction.options.getString('nama_proyek');
        const description = interaction.options.getString('deskripsi');

        const embed = new EmbedBuilder()
            .setTitle(`🚀 PROJECT SETUP: ${projectName.toUpperCase()}`)
            .setDescription(description)
            .setColor('Blue')
            .addFields(
                { name: 'Klien', value: clientName, inline: true },
                { name: 'Status', value: '`Preparation / Setup`', inline: true }
            )
            .setFooter({ text: `Setup oleh ${interaction.user.tag}` })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in /projectsetup:', error);
            await interaction.reply({ content: 'Gagal membuat setup project.', ephemeral: true });
        }
    },
};
