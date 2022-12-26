import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command, CommandRun } from '../types';
import { getHighestEditableRole } from './role.js';

export const command = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Shows the name and color for your editable role');

export const run: CommandRun = async (c, interaction) => {
    const role = getHighestEditableRole(interaction.member as GuildMember, interaction.guild?.members.cache.find(m => m.id === interaction.client.user.id) as GuildMember);
    
    if (!role) {
        await interaction.editReply('You do not have an editable role');
        return;
    }

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(role.hexColor)
                .setTitle(`Your role is "${role.name}" with the color \`${role.hexColor}\``)
                .setAuthor({iconURL: interaction.user.avatarURL() || undefined, name: interaction.user.username})
        ]
    });
};
