const axios = require("axios");
const { SlashCommandBuilder } = require("discord.js");

const { getNewSessionToken, openTicket } = require("../../utils/actions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chamado")
    .setDescription("Abre um chamado junto ao suporte")
    .addStringOption((option) =>
      option
        .setName("assunto")
        .setDescription("Assunto do chamado")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("mensagem")
        .setDescription(
          'Descreva seu problema (use "--" para quebra de linha).'
        )
        .setRequired(true)
        .setMaxLength(6000)
    ),
  async execute(interaction) {
    try {
      await openTicket(interaction);
    } catch (error) {
      console.log("error", error);
      await getNewSessionToken();
      await openTicket(interaction);
    }
  },
};
