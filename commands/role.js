const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manajemen role di server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Berikan role ke member')
                .addUserOption(option => option.setName('user').setDescription('Pilih pengguna').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Pilih role').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Hapus role dari member')
                .addUserOption(option => option.setName('user').setDescription('Pilih pengguna').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Pilih role').setRequired(true))
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin **Manage Roles**.', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');
        const subcommand = interaction.options.getSubcommand();

        if (targetRole.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
             return interaction.reply({ content: 'Kamu tidak dapat mengatur role yang sama atau lebih tinggi dari rolenya kamu.', ephemeral: true });
        }

        if (targetRole.position >= interaction.guild.members.me.roles.highest.position) {
             return interaction.reply({ content: 'Bot tidak memiliki hierarki role yang cukup tinggi untuk mengatur role ini.', ephemeral: true });
        }

        try {
            if (subcommand === 'add') {
                if (targetUser.roles.cache.has(targetRole.id)) {
                    return interaction.reply({ content: `${targetUser} sudah memiliki role ${targetRole}.`, ephemeral: true });
                }
                await targetUser.roles.add(targetRole);
                await interaction.reply({ content: `Role ${targetRole} berhasil ditambahkan ke ${targetUser}.` });
            } else if (subcommand === 'remove') {
                if (!targetUser.roles.cache.has(targetRole.id)) {
                     return interaction.reply({ content: `${targetUser} tidak memiliki role ${targetRole}.`, ephemeral: true });
                }
                await targetUser.roles.remove(targetRole);
                await interaction.reply({ content: `Role ${targetRole} berhasil dihapus dari ${targetUser}.` });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat mengatur role.', ephemeral: true });
        }
    },
};
