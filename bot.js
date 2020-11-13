const { Client, MessageEmbed, Message } = require('discord.js');
const client = new Client();
const {prefix} = require("./config.json");
require("dotenv").config();

let tabSession = [
    { id: 0, jeu: "Jeu test", date: new Date(Date.now()), desc: "Desc Test", users: [] },
];

let idChannelCmd = "";
let idChannelTabAffiche = "";
let myChannelCmd = "";
let myChannelTabAffiche = "";
// Message d'affichage
let messageModify = "";
let tabArgs = [];
let collector;
let filter;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    const command = msg.content.split(" ")[0].toLowerCase()
    let tabMsg = msg.content.split(" ");
    switch(tabMsg[0]) {
        //TEST
        case `${prefix}register`:
            var userTab = [];
            filter = (reaction, user) => {
                return reaction.emoji.name === '⌛';
            };
            msg.channel.send("Message ouvert aux inscriptions !")
            collector = msg.createReactionCollector(filter, { time: 15000 });
            collector.on('collect', (reaction, user) => {
                console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                userTab.push(user);
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
                if (userTab.length > 0) {
                    msg.channel.send(`${userTab[0]} s'est inscrit !`)
                }
            });
            break;

        case `${prefix}test`:
            var myMess;
            var userTab = [];
            filter = (reaction, user) => {
                return reaction.emoji.name === '👍';
            };
            msg.reply("Reagissez a ce message pour vous inscrire !")
                .then(message => {
                    collector = message.createReactionCollector(filter, { time: 5000 });
                    console.log("Message bien créé");
                    collector.on('collect', (reaction, user) => {
                        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                        userTab.push(user);
                    });

                    collector.on('end', collected => {
                        console.log(`Collected ${collected.size} items`);
                        if (userTab.length > 0) {
                            message.channel.send(`${userTab[0]} s'est inscrit !`)
                        }
                    });
                })
                .catch(error => {
                    msg.channel.send("Error dans la creation !");
                    console.log(error);
                });
            break;
        //Gestion sessions        
        case `${prefix}sessionadd`:
            tabArgs = getArgs(msg.content);
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
                jeu: tabArgs["jeu"],
                date: sessionDate,
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

        case `${prefix}sessionupdate`:
            tabArgs = getArgs(msg.content);
            if (!("session" in tabArgs)) {
                msg.reply("Vous avez oublié l'attribut session dans votre requete... Re-essayez");
            }
            else {
                const sessionIndex = parseInt(tabArgs.session);
                const session = tabSession.find(item => item.id == sessionIndex);
                if (session === undefined) {
                    msg.reply("Session introuvable, etes vous sur d'avoir mis le bon numero ?");
                } else {
                    Object.keys(tabArgs).forEach(key => {
                        if (key == "heure") {
                            [heure, minutes] = tabArgs[key].split("H");
                            console.log(`Heures a modifier ${heure} et ${minutes}`)
                            session.date.setHours(heure, minutes);
                        }
                        else if (key == "jour") {
                            [jour, mois] = tabArgs[key].split("/");
                            session.date.setDate(jour);
                            session.date.setMonth(mois - 1);
                        }
                        else {
                            session[key] = tabArgs[key]
                        }
                    })
                    editSessionBoard();
                    msg.reply(`Session ${sessionIndex} modifié !`)
                }
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
            var jour = session.date.getDate()
            var jourName = getDayName(session.date.getDay());
            var mois = getMonthName(session.date.getMonth());
            var heureMinute = session.date.getHours() + "H" + session.date.getMinutes();
            listeSessions += `${session.id} | **${session.jeu}** , **${jourName} ${jour} ${mois}** à _${heureMinute}_ : ${session.desc}\n`;
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

function getArgs(myCmd) {
    var regex = /(?<key>[\S]+):(?<value>[^ "]+|["][\w?! ]*["])/gm;
    var matches = myCmd.matchAll(regex)
    var tabArgs = {}
    for (const match of matches) {
        var monString = match[2].replace(/\"/g, "");
        tabArgs[match[1]] = monString;
    }
    return tabArgs;
}

client.login(process.env.API_KEY);