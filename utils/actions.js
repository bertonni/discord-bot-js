const axios = require("axios");
const fs = require("node:fs");

axios.defaults.baseURL = "http://chamado.igarassu/apirest.php";

const filePath = "config.json";

function getUpdatedData() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

let { appToken, userToken } = getUpdatedData();
// const sessionToken = process.env.SESSION_TOKEN;
// const appToken = process.env.APP_TOKEN;

async function getNewSessionToken() {
  const response = await axios.get("/initSession", {
    headers: {
      "App-Token": appToken,
      Authorization: `user_token ${userToken}`,
    },
  });

  if (response.status === 200) {
    const newToken = response.data.session_token;
    console.log("new session token", newToken);

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.log("error while reading file", err);
        return;
      }

      let obj = JSON.parse(data);

      obj.sessionToken = newToken;

      const newContent = JSON.stringify(obj, null, 2);

      fs.writeFile(filePath, newContent, "utf-8", (err) => {
        if (err) {
          console.log("err", err);
          return;
        }
        console.log("arquivo atualizado");
      });
    });
  }
}

async function openTicket(interaction) {
  const subject = interaction.options.getString("assunto");
  const message = interaction.options
    .getString("mensagem")
    .replaceAll("--", "\n");

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

  let { sessionToken } = getUpdatedData();

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
}

module.exports = {
  openTicket,
  getNewSessionToken,
};
