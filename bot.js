const { Client, MessageEmbed} = require('discord.js');
const client = new Client();
const {prefix} = require("./config.json");
require("dotenv").config();

let tabSession = [

];
//Ben yes
let idChannelCmd = "";
let idChannelTabAffiche = "";
let myChannelCmd = "";
let myChannelTabAffiche = "";
let messageModify = "";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    const command = msg.content.split(" ")[0].toLowerCase()
    let tabMsg = msg.content.split(" ");
    switch(tabMsg[0]) {
        //Gestion sessions        
        case `${prefix}sessionadd`:
            var regex = /(?<key>[\S]+):(?<value>[^ "]+|["][\w?! ]*["])/gm;
            var matches = msg.content.matchAll(regex)
            var tabArgs = {}
            for (const match of matches) {
                console.log(match);
                var monString = match[2].replace(/\"/g, "");
                tabArgs[match[1]] = monString;
            }
            // Gestion de date
            var now = new Date(Date.now());
            var dates = tabArgs["jour"].split("/");
            var sessionDate = new Date(`2020-${dates[1]}-${dates[0]}`)
            if (now > sessionDate) {
                sessionDate.setFullYear(sessionDate.getFullYear() + 1);
            }
            var time = tabArgs["heure"].split("H");
            sessionDate.setHours(time[0])
            sessionDate.setMinutes(time[1]);
            // Fin de gestion de date

            let newSession = {
                id: tabSession.length,
                game: tabArgs["jeu"],
                time: sessionDate,
                desc: tabArgs["desc"],
            };
            tabSession.push(newSession);
            msg.reply("Ta session a bien été ajouté !");
            editSessionBoard();
            console.log(JSON.stringify(newSession));
        break;

        case `${prefix}sessionremove`:
            var removeSession = msg.content.split(" ", 2)[1];
            var toSuppr = tabSession.find(session => session.id == removeSession);
            if (toSuppr)
            {
                tabSession.splice(tabSession.indexOf(toSuppr), 1);
                editSessionBoard();
            }
            else
            {
                console.log("Pas trouvé")
                msg.reply("La session que tu as voulu supprimer n'as pas été trouvé, essaye encore");
            }
            break;
        
        case `${prefix}registerTabAffiche`:
            var myId = msg.channel.id;
            console.log(myId);
            if(idChannelTabAffiche === myId) {
                myChannelTabAffiche.send("Déja inscrit a ce channel");
            }
            else {
            client.channels.fetch(myId)
            .then(element => {
                msg.reply("l'affichage sera fait dans le channel : " + element.name);
                idChannelTabAffiche = myId;
                myChannelTabAffiche = client.channels.cache.get(idChannelTabAffiche);
                myChannelTabAffiche.send("L'affichage sera fait désormais dans le channel ")
            })
            .catch(error => console.log(error));
            }
        break;
        case `${prefix}registerCmd`:
            var myId = msg.channel.id;
            console.log(myId);
            if(myId === idChannelCmd) {
                myChannelCmd.log("Déja inscrit a ce channel");
            }
            else {
            client.channels.fetch(myId)
            .then(element => {
                msg.reply("Je suis maintenant présent dans le channel " + element.name);
                idChannelCmd = myId;
                myChannelCmd = client.channels.cache.get(idChannelCmd);
            })
            .catch(error => console.log(error));
            }
        break;
        case `${prefix}sessionHelp`:
            const dupyGood = msg.guild.emojis.cache.find(emoji => emoji.name === "dupygood")
            myChannelCmd.send("**Voici un template de commande de creation de session a copier et a remplir** \n" +
            `\`${prefix}sessionadd |jeu;titre;Jour/Mois;Heure/Minute;description\` \n` +
            "_*Un exemple ci-dessous*_ : \n" +
            `\`${prefix}sessionadd |Sea of Thieves;Fable Time !;24/12;21:00;On va s'amuser, venez !\` \n` +
            `Amusez vous bien ! ${dupyGood}`);
        break;
        case `${prefix}messageEmbed`:
            const embed = new MessageEmbed()
            .setTitle("Ma vie de bandit")
            .setColor(0xff0000)
            .setDescription("Ben voila, c'est ma vie de bandit");
            msg.channel.send(embed);
            break;
        case `${prefix}printEdit`:
            msg.channel.send("Message a modifier")
            .then(message => messageModify = message)
            .catch(console.error);
            editSessionBoard();
            break;
        case `${prefix}editlol`:
            messageModify.edit("Bonjour la famille !")
            .then(message => console.log(message))
            .catch(console.error);
            break;
        default:
            msg.reply(`Commande inconnu, utilisez la commande ${prefix}sessionHelp pour connaitre la liste des commandes`)
    }
});

function editSessionBoard()
{
    if (messageModify != "") {
        var listeSessions = "";
        if(!tabSession.length > 0) {
            messageModify.edit("Aucune session prévu ...")
            .then(console.log("Board updated"))
            .catch(console.error);
        }else {
        tabSession.forEach(session => {
            var jour = session.time.getDate()
            var jourName = getDayName(session.time.getDay());
            var mois = getMonthName(session.time.getMonth());
            var heureMinute = session.time.getHours() + "H" + session.time.getMinutes();
            listeSessions += `${session.id} | **${session.game}** , **${jourName} ${jour} ${mois}** à _${heureMinute}_ : ${session.desc}\n`;
            console.log(listeSessions);
        })
        messageModify.edit(listeSessions)
        .then(console.log("Board updated"))
        .catch(console.error);
        }
    } else {
        console.log("Aucun message editable ajouté, utiliser commande $printEdit");
    }
}

function getDayName(dayNum)
{   
    var dayName = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return dayName[dayNum];
}

function getMonthName(monthNum)
{
    var monthName = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Novembre", "Décembre"];
    return monthName[monthNum];
}

client.login(process.env.API_KEY);