const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invoice')
        .setDescription('Buat tagihan/invoice pembayaran jasa')
        .addStringOption(option => 
            option.setName('jenis_jasa')
                .setDescription('Masukkan jenis jasa')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('detail_jasa')
                .setDescription('Masukkan detail jasa')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('note_jasa')
                .setDescription('Durasi pengerjaan, antrian saat ini, T&C')
                .setRequired(true)),
                
    async execute(interaction) {
        if (interaction.guild.id !== '709279383340318740') {
            return interaction.reply({ content: 'Command ini khusus untuk server tertentu.', ephemeral: true });
        }

        const jenis = interaction.options.getString('jenis_jasa');
        const detail = interaction.options.getString('detail_jasa');
        const note = interaction.options.getString('note_jasa');

        const embed = new EmbedBuilder()
            .setTitle('🧾 INVOICE PEMBAYARAN JASA')
            .setColor('Green')
            .addFields(
                { name: 'Jenis Jasa', value: jenis, inline: true },
                { name: 'Detail Jasa', value: detail, inline: false },
                { name: 'Notes & T&C', value: note, inline: false },
                { name: '💳 Tata Cara Pembayaran', value: 'Silakan lakukan transfer ke salah satu rekening berikut:\n\n**BCA (Bank Central Asia)**\n`2900283531` a/n Choirul Fajar R\n\n**Mandiri TBK.**\n`1520017506060` a/n Choirul Fajar R\n\n*Jika sudah membayar, harap kirimkan bukti transfer di chat.*', inline: false }
            )
            .setFooter({ text: `Invoice diterbitkan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in /invoice:', error);
            await interaction.reply({ content: 'Gagal membuat invoice.', ephemeral: true });
        }
    },
};
