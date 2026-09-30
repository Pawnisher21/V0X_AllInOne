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

            if (customId === 'open_ticket') {
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
