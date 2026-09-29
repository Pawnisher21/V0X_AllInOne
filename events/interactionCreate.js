const { Events, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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

        // --- Ticket System Logic ---
        if (interaction.isButton()) {
            const { customId, guild, user } = interaction;
            const categoryId = process.env.TICKET_CATEGORY_ID;

            if (customId === 'open_ticket') {
                const channelName = `ticket-${user.username.toLowerCase()}`;
                const existingChannel = guild.channels.cache.find(c => c.name === channelName);

                if (existingChannel) {
                    return interaction.reply({ content: `Kamu sudah memiliki tiket terbuka di ${existingChannel}!`, ephemeral: true });
                }

                try {
                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId || null,
                        permissionOverwrites: [
                            {
                                id: guild.id,
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
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle('Tiket Dukungan')
                        .setDescription(`Halo ${user}, silakan jelaskan tujuan Anda membuka tiket tiket ini. Admin akan segera membalasnya.`)
                        .setColor('Blue');

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Tutup Tiket')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ embeds: [embed], components: [actionRow] });
                    await interaction.reply({ content: `Tiketmu telah berhasil dibuat: ${ticketChannel}`, ephemeral: true });

                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'Terjadi kesalahan saat membuat tiket.', ephemeral: true });
                }
            }

            if (customId === 'close_ticket') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && !interaction.channel.name.includes(interaction.user.username.toLowerCase())) {
                    return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menutup tiket ini!', ephemeral: true });
                }

                await interaction.reply({ content: 'Tiket akan ditutup dalam 5 detik...' });
                setTimeout(() => {
                    interaction.channel.delete().catch(console.error);
                }, 5000);
            }
        }
    },
};
