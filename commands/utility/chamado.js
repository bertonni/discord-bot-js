const axios = require("axios");
const { SlashCommandBuilder } = require("discord.js");

axios.defaults.baseURL = "http://chamado.igarassu/apirest.php";

const sessionToken = process.env.SESSION_TOKEN;
const appToken = process.env.APP_TOKEN;

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
        .setDescription("Descreva seu problema")
        .setRequired(true)
        .setMaxLength(10000)
    ),
  async execute(interaction) {
    try {
      const subject = interaction.options.getString("assunto");
      const message = interaction.options.getString("mensagem");

      const ticketData = {
        input: {
          name: subject,
          content: `\nSolicitante: ${interaction.user.globalName}\n\n${message}`,
          urgency: 3, // Urgência do chamado (1 - Muito urgente, 5 - Não urgente)
          impact: 3, // Impacto do chamado (1 - Total, 5 - Nenhum)
          status: 1, // Status do ticket (1 - Novo, 2 - Em andamento, etc.)
          priority: 3,
        },
      };

      const response = await axios.post("Ticket", ticketData, {
        headers: {
          "Content-Type": "application/json",
          "Session-Token": sessionToken,
          "App-Token": appToken,
        },
      });
      console.log(response.status);
      if (response.status === 201) {
        await interaction.reply(response.data.message);
      } else {
        await interaction.reply(
          "Algo aconteceu e não foi possível abrir o chamado. Procure a equipe da @CTIC para maiores informações"
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  },
};
