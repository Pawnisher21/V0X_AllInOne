const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('projectupdate')
        .setDescription('Update status pekerjaan/project klien')
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Pilih status pekerjaan saat ini')
                .setRequired(true)
                .addChoices(
                    { name: 'On Hold', value: 'On Hold' },
                    { name: 'Waiting for Client', value: 'Waiting for Client' },
                    { name: 'On Queue', value: 'On Queue' },
                    { name: 'On Progress', value: 'On Progress' },
                    { name: 'Review by Client', value: 'Review by Client' },
                    { name: 'Project Done', value: 'Project Done' }
                ))
        .addIntegerOption(option => 
            option.setName('persentase')
                .setDescription('Persentase pekerjaan (%)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('notes')
                .setDescription('Catatan progres')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('gambar1')
                .setDescription('Lampiran gambar / bukti progres 1')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('gambar2')
                .setDescription('Lampiran gambar / bukti progres 2 (Opsional)')
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName('gambar3')
                .setDescription('Lampiran gambar / bukti progres 3 (Opsional)')
                .setRequired(false)),
                
    async execute(interaction) {
        if (interaction.guild.id !== '709279383340318740') {
            return interaction.reply({ content: 'Command ini khusus untuk server tertentu.', ephemeral: true });
        }

        const status = interaction.options.getString('status');
        const persentase = interaction.options.getInteger('persentase');
        const notes = interaction.options.getString('notes');
        
        const gambar1 = interaction.options.getAttachment('gambar1');
        const gambar2 = interaction.options.getAttachment('gambar2');
        const gambar3 = interaction.options.getAttachment('gambar3');

        // Let's determine color based on status
        let embedColor = 'Blue';
        if (status === 'Project Done') embedColor = 'Green';
        if (status === 'On Hold') embedColor = 'Red';
        if (status === 'Waiting for Client') embedColor = 'Gold';

        const embed = new EmbedBuilder()
            .setTitle('🛠️ UPDATE STATUS PEKERJAAN')
            .setColor(embedColor)
            .addFields(
                { name: 'Status Saat Ini', value: `\`${status}\``, inline: true },
                { name: 'Persentase', value: `\`${persentase}%\``, inline: true },
                { name: 'Catatan', value: notes, inline: false }
            )
            .setFooter({ text: `Update oleh ${interaction.user.tag}` })
            .setTimestamp();
            
        if (gambar1) embed.setImage(gambar1.url);

        const embeds = [embed];

        // Discord API allows multiple embeds per message. 
        // We can create additional embeds for the extra images if they exist.
        if (gambar2) {
            embeds.push(new EmbedBuilder().setURL('https://discord.com').setImage(gambar2.url).setColor(embedColor));
        }
        if (gambar3) {
            embeds.push(new EmbedBuilder().setURL('https://discord.com').setImage(gambar3.url).setColor(embedColor));
        }
        
        // Trick: Set URL of the primary embed and additional embeds to the SAME anchor url
        // so Discord groups them visually as one block of images.
        if (gambar1 || gambar2 || gambar3) {
            const groupUrl = 'https://discord.com';
            embeds.forEach(e => e.setURL(groupUrl));
        }

        try {
            await interaction.reply({ embeds: embeds });
        } catch (error) {
            console.error('Error in /projectupdate:', error);
            await interaction.reply({ content: 'Gagal mengirim update.', ephemeral: true });
        }
    },
};
