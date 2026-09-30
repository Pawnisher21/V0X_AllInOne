const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Kirim pengumuman server ke channel Announcement')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option =>
            option.setName('tema')
                .setDescription('Pilih tema warna pengumuman')
                .setRequired(false)
                .addChoices(
                    { name: 'Biru (Informasi)', value: 'blue' },
                    { name: 'Merah (Penting/Urgent)', value: 'red' },
                    { name: 'Hijau (Event)', value: 'green' },
                    { name: 'Emas (Update/Maintenance)', value: 'gold' }
                ))
        .addStringOption(option =>
            option.setName('ping')
                .setDescription('Siapa yang ingin di-ping?')
                .setRequired(false)
                .addChoices(
                    { name: 'Tanpa Ping', value: 'none' },
                    { name: '@everyone', value: 'everyone' },
                    { name: '@here', value: 'here' }
                )),
    async execute(interaction) {
        // Ambil pilihan opsi, default-nya blue dan none
        const theme = interaction.options.getString('tema') || 'blue';
        const ping = interaction.options.getString('ping') || 'none';

        // Custom ID Modal menyertakan opsi tema dan ping
        const modal = new ModalBuilder()
            .setCustomId(`announce_modal_${theme}_${ping}`)
            .setTitle('Form Pengumuman Server');

        // Input 1: Judul
        const titleInput = new TextInputBuilder()
            .setCustomId('announce_title')
            .setLabel('Judul Pengumuman (Wajib)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(256);

        // Input 2: Isi
        const descInput = new TextInputBuilder()
            .setCustomId('announce_desc')
            .setLabel('Isi Pengumuman (Wajib)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

        // Input 3: Banner/Image (Optional)
        const imageInput = new TextInputBuilder()
            .setCustomId('announce_image')
            .setLabel('Link URL Gambar / Banner (Opsional)')
            .setPlaceholder('https://... .png/.jpg')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        // Input 4: Teks Tombol (Optional)
        const btnLabelInput = new TextInputBuilder()
            .setCustomId('announce_btn_label')
            .setLabel('Teks Tombol (Opsional)')
            .setPlaceholder('Contoh: Tonton Sekarang')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(80);

        // Input 5: Link Tombol (Optional)
        const btnUrlInput = new TextInputBuilder()
            .setCustomId('announce_btn_url')
            .setLabel('URL Tombol (Wajib jika Label diisi)')
            .setPlaceholder('https://...')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        // Masukkan komponen ke modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(btnLabelInput),
            new ActionRowBuilder().addComponents(btnUrlInput)
        );

        // Tampilkan modal ke user
        await interaction.showModal(modal);
    }
};
