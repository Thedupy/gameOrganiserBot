const { Client, MessageEmbed, Message } = require('discord.js');
const client = new Client();
const {prefix} = require("./config.json");
require("dotenv").config();

let tabSession = [
    // { id: 0, jeu: "Jeu test", date: new Date(Date.now()), desc: "Desc Test", users: [] , postID: 232323},
];

let idPostChannel = "";
let postChannel = "";
// Message d'affichage
let messageModify = "";
let tabArgs = [];
let collector;
let filter;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    let tabMsg = msg.content.split(" ");
    switch(tabMsg[0]) {
        //TEST

        //Gestion sessions        
        case `${prefix}sessionadd`:
            if (idPostChannel == "") {
                msg.reply("Pas de channel de post pour le post de messgage de jeu, utilisez la commande \`$registerPost [idChannel]\`");
                return;
            };
            tabArgs = getArgs(msg.content);
            // Gestion de date
            var now = new Date(Date.now());
            var dates = tabArgs["jour"].split("/");
            var sessionDate = new Date(`2020-${dates[1] - 1}-${dates[0]}`)
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
                users: []
            };
            tabSession.push(newSession);
            msg.reply("Ta session a bien été ajouté !");
            editSessionBoard();
            postRegisterMessage(newSession);
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

        case `${prefix}registerPost`:
            var myId = msg.content.split(" ")[1];
            console.log(myId);
            if (idPostChannel === myId) {
                msg.reply("Déja inscrit a ce channel");
            }
            else {
            client.channels.fetch(myId)
            .then(element => {
                msg.reply("l'affichage sera fait dans le channel : " + element.name);
                idPostChannel = myId;
                postChannel = client.channels.cache.get(idPostChannel);
            })
                .catch(error => { msg.channel.send("Channel inconnu, re-essayez"); console.error(error); });
            }
        break;

        case `${prefix}sessionHelp`:
            const dupyGood = msg.guild.emojis.cache.find(emoji => emoji.name === "dupygood")
            msg.reply("**Voici un template de commande de creation de session a copier et a remplir** \n" +
                `\`${prefix}sessionadd jeu:titre jour:Jour/Mois heure:Heure/Minute desc:description(optionnel)\` \n` +
                "_*Un exemple ci-dessous*_ : \n" +
                `\`${prefix}sessionadd jeu:"Sea of Thieves" jour:13/11 heure:21H30\` \n` +
                "_*Pour modifier une session existante, utilisez la commande suivante*_ : \n" +
                `\`${prefix}sessionupdate session:[numeroSession] jeu:"Undertale"\` \n` +
                "_*Pour supprimer une session, utilisez la commande suivante*_ : \n" +
                `\`${prefix}sessionremove [numeroSession]\` \n` +
                "_*Les \`\"\"\` ne sont necessaire que quand votre valeur a des espaces comme \"Sea of Thieves\"*_ : \n" +
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
                .catch(error => console.log(error));
            break;
        case `${prefix}majEdit`:
            editSessionBoard();
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
            listeSessions += "Joueurs Inscrit : ";
            session.users.forEach(joueur => {
                listeSessions += ` ${joueur.username}`
            })
            listeSessions += "\n--------------------\n";
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

function postRegisterMessage(session) {
    console.log(`Jeu de session : ${session.jeu}`);

    filter = (reaction, user) => {
        return true;
    };
    var jour = session.date.getDate()
    var jourName = getDayName(session.date.getDay());
    var mois = getMonthName(session.date.getMonth());
    var heureMinute = session.date.getHours() + "H" + session.date.getMinutes();
    postChannel.send(`Message d'inscription pour la session de **${session.jeu}** le **${jourName} ${jour} ${mois}** à _${heureMinute}_`)
        .then(message => {
            collector = message.createReactionCollector(filter);
            session.postID = message.id;
            console.log("Message bien créé");
            collector.on('collect', (reaction, user) => {
                var myMess = session.users.find(item => item.tag == user.tag);
                console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                // session.users.push(user);
                // editSessionBoard();
            });

            collector.on("remove", (reaction, user) => {
                console.log(`User : ${user.username} / Emoji : ${reaction.emoji.name}`);
            });

            // collector.on('end', collected => {
            //     console.log(`Collected ${collected.size} items`);
            //     if (userTab.length > 0) {
            //         message.channel.send(`${userTab[0].personne} s'est inscrit avec l'émoticone ${userTab[0].emoji.emoji.name}!`)
            //     }
            // });
        })
        .catch(error => {
            msg.channel.send("Error dans la creation !");
            console.log(error);
        });
}

client.login(process.env.API_KEY);