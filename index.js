const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const fs = require("fs");

const client = new Discord.Client();
client.cooldowns = new Discord.Collection();

//Start parse mentions properly
function getUserFromMention(message, mention) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }
    return message.guild.member(mention);
  } else {
    //If mention does not contain an actual mention, send error code to command being executed
    return -1;
  }
}
//End parse mentions properly

//Start Command Handler
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

//End Command Handler

client.once("ready", () => {
  console.log("Iuris is online!");
  client.user
    .setActivity("for law breakers", { type: "WATCHING" })
    .catch(console.error);
});

//Start on message
client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  let mentionedMember = "init mention";

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply("I can't execute that command inside DMs!");
  }

  if (command.permissions) {
    const authorPerms = message.channel.permissionsFor(message.author);

    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply("You can not do this!");
    }
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (command.args && args.length && command.mentionRequired) {
    //if args require a mention, parse it properly
    mentionedMember = getUserFromMention(message, args[0]);
  }

  //Start cooldowns
  const { cooldowns } = client;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  //End cooldowns

  try {
    command.execute(message, args, mentionedMember);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});
//End on message

client.login(token);
