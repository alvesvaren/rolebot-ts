import { SlashCommandBuilder } from 'discord.js';
import { CommandRun } from '../types';

enum Options {
  Input = 'input',
  Arch = 'arch',
  Windows = 'windows',
}

export const command = new SlashCommandBuilder()
  .setName('archjokes')
  .setDescription('Get a random Arch Linux joke or roast about Windows')
  .addStringOption(option => {
    return option
      .setName(Options.Input)
      .setDescription('Optional input to include in the joke')
      .setRequired(false);
  })
  .addBooleanOption(option => {
    return option
      .setName(Options.Arch)
      .setDescription('Get a joke about Arch Linux')
      .setRequired(false);
  })
  .addBooleanOption(option => {
    return option
      .setName(Options.Windows)
      .setDescription('Get a roast about Windows')
      .setRequired(false);
  });

const archJokes = [
  'Why did the Arch user quit his job? He didn\'t have enough time to compile!',
  'Why do Arch users like gardening? Because they love to plant!',
  'What do Arch users use for backup? Time machine!',
];

const windowsRoasts = [
  'Why did Windows users switch to Mac? Because they couldn\'t handle the CTRL+ALT+DEL lifestyle.',
  'Why don\'t Windows users ever have any money? Because they keep forking it over to Microsoft.',
  'Why did the Windows user go to the doctor? He had a bad case of NTFS (Need To Format Soon).',
];

export const run: CommandRun = async (client, interaction) => {
  const { value: input = '' } = interaction.options.get(Options.Input) || {};

  const { value: isArchJoke = false } = interaction.options.get(Options.Arch) || {};
  const { value: isWindowsRoast = false } = interaction.options.get(Options.Windows) || {};

  let messageReply = '';

  if (isArchJoke && isWindowsRoast) {
    messageReply = 'You can\'t have both an Arch joke and a Windows roast, silly!';
  } else if (!isArchJoke && !isWindowsRoast) {
    messageReply = 'Please choose either an Arch joke or a Windows roast!';
  } else {
    const optionsArray = isArchJoke ? archJokes : windowsRoasts;
    const randomIndex = Math.floor(Math.random() * optionsArray.length);
    const randomOption = optionsArray[randomIndex];
    messageReply = `${randomOption} ${input}`;
  }

  await interaction.editReply(messageReply);
};
