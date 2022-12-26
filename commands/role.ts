import { EmbedBuilder, GuildMember, HexColorString, ModalBuilder, Role, SlashCommandBuilder, TextInputBuilder } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { CommandRun } from '../types';
import parse from 'parse-color';

const { addRoles, blacklistedRoles, blacklistedUsers, roleOffset } = config;

export const command = new SlashCommandBuilder()
    .setName('role')
    .setDescription('Sets a role name and color for you in this server')
    .addStringOption(option => {
        return option.setName('name')
            .setDescription('The name of the role')
            .setRequired(true);
    }).addStringOption(option => {
        return option.setName('color')
            .setDescription('The color of the role, in hex format (e.g. #ff0000 for red)')
    });

export const getHighestEditableRole = (member: GuildMember, me: GuildMember) => {
    let highestRole: Role | null = null;

    for (const role of member.roles.cache.values()) {
        // Make sure it's not @everyone, and that it's not a blacklisted role
        if (blacklistedRoles.includes(role.id) || role.name === '@everyone') {
            continue;
        }
        if (role.editable && role.comparePositionTo(me.roles.highest) < 0) {
            if (!highestRole || role.comparePositionTo(highestRole) > 0) {
                highestRole = role;
            }
        }
    }

    return highestRole;
};

export const run: CommandRun = async (c, interaction) => {
    const { value: name } = interaction.options.get('name', true);
    const { value: color } = interaction.options.get('color') || {};

    const {hex: parsedColor} = parse(color as string);

    if (color && !parsedColor) {
        await interaction.editReply('Invalid color');
        return;
    }

    if (!interaction.guild) {
        await interaction.editReply('This command can only be used in a server');
        return;
    }

    const member: GuildMember = interaction.member as GuildMember;
    const roles = member.roles.cache;
    let editableRole = getHighestEditableRole(member, interaction.guild.members.cache.find(m => m.id === interaction.client.user.id) as GuildMember);

    if ((blacklistedUsers as string[]).includes(interaction.user.id)) {
        await interaction.editReply('You are not allowed to use this command');
        return;
    }

    // Above all addRoles roles
    const initialRoleOffset = interaction.guild.roles.cache.filter(r => addRoles.includes(r.id)).sort((a, b) => b.position - a.position).first()?.position || 0;

    if (!editableRole) {
        editableRole = await interaction.guild.roles.create({
            color: parsedColor as HexColorString | undefined,
            name: name as string,
            hoist: true,
            position: initialRoleOffset + roleOffset + 1,
            permissions: []
        });

        for (const role of addRoles) {
            const roleToAdd = interaction.guild.roles.cache.find(r => r.id === `${role}`);

            if (roleToAdd) {
                await member.roles.add(roleToAdd);
            }
        }

        if (!editableRole) {
            await interaction.editReply('Error creating role');
            return;
        }

        await member.roles.add(editableRole);        
    } else {
        await editableRole.edit({
            color: parsedColor as HexColorString || editableRole.color,
            name: name as string,
        });
    }

    const realColor = parsedColor as HexColorString || editableRole.hexColor || null;

    if (!roles) {
        await interaction.editReply('You have no roles');
        return;
    }

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(realColor)
                .setTitle(`Updated your role to "${editableRole.name}" with the color \`${realColor}\``)
                .setAuthor({iconURL: interaction.user.avatarURL() || undefined, name: interaction.user.username})
        ]
    });
};
