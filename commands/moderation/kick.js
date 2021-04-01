module.exports = {
  name: "kick",
  description: "Kick a user from the server.",
  guildOnly: true,
  permissions: "KICK_MEMBERS",
  args: true,
  mentionRequired: true,
  usage: "<member> [reason]",
  cooldown: 5,
  execute(message, args, guildMemberObj) {
    if (guildMemberObj === -1) {
      return message.channel.send(
        "Command requires a valid mentioned Member as an argument."
      );
    }

    let reason = args.slice(1).join(" ");
    let notification = `${message.author.tag} kicked ${guildMemberObj.user.username}. Reason(s): ${reason}`;
    guildMemberObj
      .kick(reason)
      .then(() => {
        console.log(notification);
        message.channel.send(notification);
      })
      .catch(console.error);
  },
};
