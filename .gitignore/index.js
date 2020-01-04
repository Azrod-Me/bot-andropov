const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
const FileSync = require("lowdb/adapters/FileSync")

let prefix = "!"

const warns = JSON.parse(fs.readFileSync('./warns.json'))
 
client.login(process.env.TOKEN);

 //join et addrole
client.on('guildMemberAdd', function (member) {
    let embed = new Discord.RichEmbed()
    .setColor("#FFBF00")
    .setAuthor(member.user.username, member.user.displayAvatarURL)
    .setDescription("WoW " + member.user + " a rejoins notre serveur")
    .setFooter('Nous sommes désormais ' + member.guild.memberCount)
    member.guild.channels.get('662714899129958447').send(embed)
    member.addRole('662725948591964160')
})


//clear
client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLowerCase() === prefix + "clear") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let count = parseInt(args[1])
        if (!count) return message.channel.send("Veuillez indiquer un nombre de messages à supprimer")
        if (isNaN(count)) return message.channel.send("Veuillez indiquer un nombre valide")
        if (count < 1 || count > 100) return message.channel.send("Veuillez indiquer un nombre entre 1 et 100")
        message.channel.bulkDelete(count + 1, true)
    }
       //warn
    if (args[0].toLowerCase() === prefix + "mute") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Membre introuvable")
        if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas mute ce membre")
        if (!member.manageable) return message.channel.send("Je ne peux pas mute ce membre")
        let muterole = message.guild.roles.find(role => role.name === 'Muted')
        if (muterole) {
            member.addRole(muterole)
            message.channel.send(member + ' a été mute :white_check_mark:')
        }
        else {
            message.guild.createRole({name: 'Muted', permissions: 0}).then(function (role) {
                message.guild.channels.filter(channel => channel.type === 'text').forEach(function (channel) {
                    channel.overwritePermissions(role, {
                        SEND_MESSAGES: false
                    })
                })
                member.addRole(role)
                message.channel.send(member + ' a été mute :white_check_mark:')
            })
        }
    }});
            //warn
    client.on("message", function (message) {
        if (!message.guild) return
        let args = message.content.trim().split(/ +/g)
     
        if (args[0].toLowerCase() === prefix + "warn") {
            if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
            let member = message.mentions.members.first()
            if (!member) return message.channel.send("Veuillez mentionner un membre")
            if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas warn ce membre")
            let reason = args.slice(2).join(' ')
            if (!reason) return message.channel.send("Veuillez indiquer une raison")
            if (!warns[member.id]) {
                warns[member.id] = []
            }
            warns[member.id].unshift({
                reason: reason,
                date: Date.now(),
                mod: message.author.id
            })
            fs.writeFileSync('./warns.json', JSON.stringify(warns))
            message.channel.send(member + " a été warn pour " + reason + " :white_check_mark:")
        }
          //Savoir warn
        if (args[0].toLowerCase() === prefix + "infractions") {
            if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
            let member = message.mentions.members.first()
            if (!member) return message.channel.send("Veuillez mentionner un membre")
            let embed = new Discord.RichEmbed()
                .setAuthor(member.user.username, member.user.displayAvatarURL)
                .addField('10 derniers warns', ((warns[member.id] && warns[member.id].length) ? warns[member.id].slice(0, 10).map(e => e.reason) : "Ce membre n'a aucun warns"))
                .setTimestamp()
                .setColor("#FFBF00")
            message.channel.send(embed)
        }
    })
    
    client.on("message", function (message) {
        if (!message.guild) return
        let args = message.content.trim().split(/ +/g)
     
        //unmute
        if (args[0].toLowerCase() === prefix + "unmute") {
            if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
            let member = message.mentions.members.first()
            if(!member) return message.channel.send("Membre introuvable")
            if(member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas unmute ce membre.")
            if(!member.manageable) return message.channel.send("Je ne pas unmute ce membre.")
            let muterole = message.guild.roles.find(role => role.name === 'Muted')
            if(muterole && member.roles.has(muterole.id)) member.removeRole(muterole)
            message.channel.send(member.user.username + ' a été unmute :white_check_mark:')
        }
     
        //unwarn
        if (args[0].toLowerCase() === prefix + "unwarn") {
            let member = message.mentions.members.first()
            if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
            if(!member) return message.channel.send("Membre introuvable")
            if(!warns[member.id] || !warns[member.id].length) return message.channel.send("Ce membre n'a actuellement aucun warns.")
            warns[member.id].shift()
            fs.writeFileSync('./warns.json', JSON.stringify(warns))
            message.channel.send("Le dernier warn de " + member + " a été retiré :white_check_mark:")
        }
    })

    client.on("ready" , async () => {
        console.log(" ")
        console.log("Connecté en tant que :" + client.user.tag)
        client.user.setActivity("!help | Bot Andropov" , {type: "PLAYING" });
    });

    /*Kick*/
client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLowerCase() === prefix + 'kick') {
       if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ;(")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send("Veuillez mentionner un utilisateur :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas kick cet utilisateur :x:")
       if (!member.kickable) return message.channel.send("Je ne peux pas exclure cet utilisateur :sunglass:")
       member.kick()
       message.channel.send('**' + member.user.username + '** a été exclu :white_check_mark:')
    }
})
 
/*Ban*/
client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLocaleLowerCase() === prefix + 'ban') {
       if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ;(")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send("Veuillez mentionner un utilisateur :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas bannir cet utilisateur :x:")
       if (!member.bannable) return message.channel.send("Je ne peux pas bannir cet utilisateur :sunglass:")
       message.guild.ban(member, {days: 7})
       message.channel.send('**' + member.user.username + '** a été banni :white_check_mark:')
    }
})

client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLocaleLowerCase() === prefix + 'unban'){
        message.guild.fetchBans().then(bans => {
            bans.forEach(user => {
                console.log(user.username + '#' + user.tag);
                user.send('MESSAGE / INVITE LINK');
                message.guild.unban(user);
            });
        });
    }
});

client.on("message" , message =>{
    if(!message.guild) return
    if (message.content === prefix + "help"){
        message.channel.send("Les commandes sont en cours de dev. Désolé")
    }
});
 
