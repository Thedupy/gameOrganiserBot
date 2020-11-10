const { Client, MessageEmbed} = require('discord.js');
const client = new Client();
const {prefix, token} = require("./config.json");

let tabSession = [

];

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

    // const args = msg.content.slice(prefix.length).trim().split('/ +/');
    // const command = args.shift().toLowerCase();
    let tabMsg = msg.content.split(" ");
    switch(tabMsg[0]) {
        case `${prefix}sessionadd`:
            let args = msg.content.split("|")[1];
            let session = args.split(";");
            console.log(session);
            let newSession = {
                id: tabSession.length,
                game: session[0],
                title: session[1],
                date: session[2],
                hour: session[3],
                desc: session[4],
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
            }
            break;

        case `${prefix}listsessions`:
            let listeSessions = "";
            tabSession.forEach(session => {
                console.log("Ok Lets go !");
                listeSessions += `**Titre** : ${session.title} , **Jeu** : ${session.game} **Jour** : ${session.date} **Heure** : ${session.hour} \n`;
            });
            myChannelTabAffiche.send(listeSessions);
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
        tabSession.forEach(session => {
            console.log("Ok Lets go !");
            listeSessions += `**Numero** : ${session.id} **Titre** : ${session.title} , **Jeu** : ${session.game} **Jour** : ${session.date} **Heure** : ${session.hour} \n`;
        })
        messageModify.edit(listeSessions)
        .then(console.log("Board updated"))
        .catch(console.error);
    } else {
        console.log("Aucun message editable ajouté, utiliser commande $printEdit");
    }
}

client.login(token);