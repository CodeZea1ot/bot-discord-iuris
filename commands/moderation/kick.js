module.exports = {
  name: "kick",
  description: "Kick a user from the server.",
  guildOnly: true,
  permissions: "KICK_MEMBERS",
  args: true,
  usage: "<member>",
  execute(message, args) {
    let mentionedMember = message.mentions.members.first();
    mentionedMember.kick();
  },
};
