const { Events, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        }

        // --- Ticket System Logic: Modal Submit ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'ticket_modal') {
                const question = interaction.fields.getTextInputValue('ticket_question');
                const user = interaction.user;
                const guild = interaction.guild;
                const channelName = `ticket-${user.username.toLowerCase()}`;
                const existingChannel = guild.channels.cache.find(c => c.name === channelName);

                if (existingChannel) {
                    return interaction.reply({ content: `Kamu sudah memiliki tiket terbuka di ${existingChannel}!`, ephemeral: true });
                }

                try {
                    const ticketCategory = '1554548485217591307';
                    const allowedRoles = ['1554540431033761903', '1554540535455420456', '1554540633081905152', '1554540709963501699'];
                    
                    const permissionOverwrites = [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        }
                    ];

                    for (const roleId of allowedRoles) {
                        permissionOverwrites.push({
                            id: roleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        });
                    }

                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: ticketCategory,
                        permissionOverwrites: permissionOverwrites,
                    });

                    const embed = new EmbedBuilder()
                        .setTitle('Tiket Dukungan Baru')
                        .setDescription(`Halo ${user}, tiket Anda telah dibuat.\n\n**Pertanyaan / Masalah:**\n${question}`)
                        .setColor('Blue');

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Tutup Tiket')
                            .setStyle(ButtonStyle.Danger)
                    );

                    // Mention allowed roles
                    const roleMentions = allowedRoles.map(id => `<@&${id}>`).join(' ');
                    await ticketChannel.send({ content: `${user} ${roleMentions}`, embeds: [embed], components: [actionRow] });
                    await interaction.reply({ content: `Tiketmu telah berhasil dibuat: ${ticketChannel}`, ephemeral: true });
                } catch (error) {
                    console.error('Error creating ticket:', error);
                    await interaction.reply({ content: 'Terjadi kesalahan saat membuat tiket.', ephemeral: true });
                }
            }
            
            // --- Announcement System Logic: Modal Submit ---
            if (interaction.customId.startsWith('announce_modal_')) {
                const parts = interaction.customId.split('_');
                const themeOption = parts[2]; // blue, red, green, gold
                const pingOption = parts[3]; // none, everyone, here
                
                const title = interaction.fields.getTextInputValue('announce_title');
                const desc = interaction.fields.getTextInputValue('announce_desc');
                const imageUrl = interaction.fields.getTextInputValue('announce_image');
                const btnLabel = interaction.fields.getTextInputValue('announce_btn_label');
                const btnUrl = interaction.fields.getTextInputValue('announce_btn_url');
                
                let embedColor = 'Blue';
                if (themeOption === 'red') embedColor = 'Red';
                if (themeOption === 'green') embedColor = 'Green';
                if (themeOption === 'gold') embedColor = 'Gold';
                
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor(embedColor)
                    .setAuthor({ name: `Announced by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();
                    
                if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
                    embed.setImage(imageUrl);
                }
                
                let contentText = '';
                if (pingOption === 'everyone') contentText = '@everyone';
                if (pingOption === 'here') contentText = '@here';
                
                let components = [];
                if (btnLabel && btnUrl) {
                    try {
                        const actionRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel(btnLabel)
                                .setURL(btnUrl.startsWith('http') ? btnUrl : `https://${btnUrl}`)
                                .setStyle(ButtonStyle.Link)
                        );
                        components.push(actionRow);
                    } catch (err) {
                        console.error("Invalid URL provided for announcement button:", err);
                    }
                }
                
                try {
                    const targetChannelId = '1554542241958203423';
                    const targetChannel = interaction.guild.channels.cache.get(targetChannelId);
                    if (!targetChannel) {
                        return interaction.reply({ content: 'Gagal menemukan channel target Announcement.', ephemeral: true });
                    }
                    
                    const messageParams = { embeds: [embed] };
                    if (contentText !== '') messageParams.content = contentText;
                    if (components.length > 0) messageParams.components = components;
                    
                    await targetChannel.send(messageParams);
                    await interaction.reply({ content: '✅ Pengumuman berhasil dipublikasikan!', ephemeral: true });
                } catch (error) {
                    console.error('Error sending announcement:', error);
                    await interaction.reply({ content: '❌ Terjadi kesalahan saat mengirim pengumuman.', ephemeral: true });
                }
            }

            // --- Streamer Modal Logic ---
            if (interaction.customId === 'streamer_modal') {
                const links = interaction.fields.getTextInputValue('streamer_links');
                const roleId = '1554705939762905108'; // Role Streamer
                const member = interaction.member;

                if (!links || links.trim().length === 0) {
                    return interaction.reply({ content: 'Kamu wajib menyertakan minimal 1 link platform streaming!', ephemeral: true });
                }

                try {
                    if (member.roles.cache.has(roleId)) {
                        return interaction.reply({ content: 'Kamu sudah memiliki role Streamer!', ephemeral: true });
                    }
                    await member.roles.add(roleId);

                    const embed = new EmbedBuilder()
                        .setTitle('Role Streamer Diberikan!')
                        .setDescription(`Halo ${interaction.user}, kamu sekarang resmi menjadi Streamer! Bot akan otomatis mendeteksi saat kamu live dan memberi tahu member di channel notifikasi. Pastikan akun Discord kamu sudah tertaut (terhubung) dengan Twitch/YouTube kamu agar bot bida mendeteksi status live.\n\n**Link Kamu:**\n${links}`)
                        .setColor('Green');
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('Error giving streamer role:', error);
                    await interaction.reply({ content: 'Terjadi kesalahan saat memberikan role streamer. Pastikan role bot berada lebih atas dari role streamer.', ephemeral: true });
                }
            }
            return;
        }

        // --- System Logic: Buttons ---
        if (interaction.isButton()) {
            const { customId, guild, user, member } = interaction;

            // --- Button Role Logic ---
            if (customId.startsWith('role_')) {
                const roleId = customId.split('_')[1];
                const role = guild.roles.cache.get(roleId);
                
                if (!role) {
                    return interaction.reply({ content: 'Role ini sudah tidak ada/dihapus dari server.', ephemeral: true });
                }

                try {
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        return interaction.reply({ content: `Role **${role.name}** telah dihapus dari Anda.`, ephemeral: true });
                    } else {
                        await member.roles.add(roleId);
                        return interaction.reply({ content: `Role **${role.name}** telah berhasil ditambahkan!`, ephemeral: true });
                    }
                } catch (error) {
                    console.error(error);
                    return interaction.reply({ content: 'Gagal mengatur role. Pastikan hirarki role bot ada di atas role yang ingin diberikan!', ephemeral: true });
                }
            }

            if (interaction.customId === 'open_ticket') {
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal')
                    .setTitle('Buat Tiket Dukungan');
                
                const questionInput = new TextInputBuilder()
                    .setCustomId('ticket_question')
                    .setLabel('Apa yang ingin Anda tanyakan?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                
                const actionRow = new ActionRowBuilder().addComponents(questionInput);
                modal.addComponents(actionRow);
                
                await interaction.showModal(modal);
            }

            if (interaction.customId === 'req_streamer') {
                const modal = new ModalBuilder()
                    .setCustomId('streamer_modal')
                    .setTitle('Request Role Streamer');
                
                const linkInput = new TextInputBuilder()
                    .setCustomId('streamer_links')
                    .setLabel('Link Channel (YouTube/Kick/TikTok dll)')
                    .setPlaceholder('https://youtube.com/... atau tiktok.com/...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                
                const actionRow = new ActionRowBuilder().addComponents(linkInput);
                modal.addComponents(actionRow);
                
                await interaction.showModal(modal);
            }

            if (customId === 'close_ticket') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && !interaction.channel.name.includes(interaction.user.username.toLowerCase())) {
                    return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menutup tiket ini!', ephemeral: true });
                }

                await interaction.reply({ content: 'Tiket akan ditutup dalam 5 detik... Menyimpan log transcript...' });
                
                try {
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    const transcriptData = messages.reverse().map(m => {
                        const date = new Date(m.createdTimestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                        return `[${date}] ${m.author.tag}: ${m.content || '[Embed/Attachment/System Message]'}`;
                    }).join('\n');
                    
                    const transcriptChannelId = '1554548639861444668';
                    const logChannel = guild.channels.cache.get(transcriptChannelId);
                    
                    if (logChannel) {
                        const buffer = Buffer.from(transcriptData, 'utf-8');
                        const attachment = new AttachmentBuilder(buffer, { name: `${interaction.channel.name}-transcript.txt` });
                        
                        const embed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .setDescription(`**Ticket:** ${interaction.channel.name}\n**Closed by:** ${interaction.user.tag}`)
                            .setColor('Red');
                            
                        await logChannel.send({ embeds: [embed], files: [attachment] });
                    }
                } catch (err) {
                    console.error('Error saving transcript:', err);
                }

                setTimeout(() => {
                    interaction.channel.delete().catch(console.error);
                }, 5000);
            }
        }
    },
};
