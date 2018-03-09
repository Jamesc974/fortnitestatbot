// REQUIRES
const _discord = require('discord.js');
const _client  = new _discord.Client();
const _snek = require("snekfetch");
const _fs = require("fs");
// KEYS
const debug    = true;
const prefix   = '!';
const apiKeyK  = "TRN-Api-Key";
const apiKeyV  = process.env.api_key;
const apiLink  = "https://api.fortnitetracker.com/v1/profile";
// CHANNELS
const BR_PC    = (debug ? "412675076433903616" : "362236453771804683");
const BR_PS4   = (debug ? "412675127151427594" : "362676778642178049");
const BR_XB1   = (debug ? "412675141076779018" : "362676808975646732");
const STW_PC   = (debug ? "412675150174224384" : "322852071051231242");
const STW_PS4  = (debug ? "412675159518871552" : "362676713592717314");
const STW_XB1  = (debug ? "412675168499007490" : "362676802642247690");
const TYPES    = [ 'pc', 'psn', 'xbl' ];
const LABELS   = [ 'pc', 'psn', 'xbl' ];

// STATISTICS COMMAND
const checkUsage = (message) => {
    message.reply(`:thinking: À tu indiqué ton nom ? ${prefix}stats pc, xbl, psn **<PSEUDO>**`);
};

const getChannelType = (channel) => {
    switch(channel.id) {
        case BR_PC: case STW_PC:
            return "pc";
        
        case BR_PS4: case STW_PS4:
            return "psn";
            
        case BR_XB1: case STW_XB1:
            return "xbl";

        default:
            return null;
    }
};

const getApiResponse = async (type, username, callback) => {
    await _snek.get(`${apiLink}/${type}/${username}`)
        .set(apiKeyK, apiKeyV)
        .then((resp) => callback(resp.body));
};

const handleStatType = (type) => {
    switch(type) {
        default: case "stats_solo": return "p2";
        case "stats_duo": return "p10";
        case "stats_squads": return "p9";
    }
}

const handleApiData = (resp, data) => {
    // Each part of data has different types of responses, we'll handle it this way
    switch(data) {
        case "accountId":
        case "platformId":
        case "platformName":
        case "platformNameLong":
        case "epicUserHandle":
            return resp[data];

        case "stats_solo":
        case "stats_duo":
        case "stats_squads":
            {
                let stats = resp['stats'][handleStatType(data)];
                var r = { };
                for(let k in stats) {
                    r[k] = stats[k]['displayValue'];
                }
                return r;
            }
            break;

        case "stats_lifetime":
            {
                let stats = resp['lifeTimeStats'];
                var r = { };
                for(let k in stats) {
                    r[stats[k]['key']] = stats[k]['value'];
                }
                return r;
            }
            break;
    }
}

_client.on("ready", async () => {
  console.log(`${_client.user.username} est en ligne sur ${_client.guilds.size} serveurs!`);
  _client.user.setPresence({ game: { name: `[!stats] || connecté à ${_client.guilds.size} serveur || créé par TarKyo et DCH`}})

});

// MESSAGE
_client.on('message', async (message) => {
    // VALID MESSAGE
    if(message.type !== 'DEFAULT') return;

    // CHECK MESSAGE IS VALID USER
    if(message.author.bot) return;

    // CHECK MESSAGE STARTS WITH PREFIX
    if(message.content.indexOf(prefix) !== 0) return;

    // HANDLE MESSAGE
    else {
        // COMMAND ARGUMENTS
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const handler = message.member;
        const cmd = args.shift().toLowerCase();
        
        // HELP COMMAND
        if(['help', 'info', 'information'].indexOf(cmd) >= 0) {
            message.reply(`:blue_book: Commande disponible:\n- ${prefix}stats pc/psn/xbl **<Pseudo>**`);
        }

        // STATISTICS COMMAND
        if(['stats', 'stat', 'track', 'me'].indexOf(cmd) >= 0) {
            let channelType = getChannelType(message.channel);

            switch(channelType) {
                case "pc":
                    {
                        
                    }
                    break;
                case "psn":
                    {
                        
                    }
                    break;
                case "xbl":
                    {

                    }
                    break;
                default:
                    {
                        // ARGUMENT CHECK
                        if(args.length > 0) {
                            // USER DETAILS
                            let type = (args.length >= 2 ? args.shift() : channelType);
                            let username = args.join(" ").toLowerCase();

                            // CHECKS
                            if(type === null || TYPES.indexOf(type.toLowerCase()) !== 0) return checkUsage(message);

                            // GET API RESPONSE
                            var userHandle, lifetimeStats, soloStats, duoStats, squadStats, error = false;
                            const apiResponse = await getApiResponse(type, username, (resp) => {
                                // Check for error
                                if(resp.error) {
                                    error = true;
                                    return message.reply("Incapable de trouver l'Utilisateur Epic Games '**" + username + "**'.\nêtes-vous sûrs que vous utilisez ce nom d'utilisateur Epic Games ?")
                                }

                                // Handle Data
                                userId = handleApiData(resp, "accountId");
                                userHandle = handleApiData(resp, "epicUserHandle");
                                lifetimeStats = handleApiData(resp, "stats_lifetime");
                                soloStats = handleApiData(resp, "stats_solo");
                                duoStats = handleApiData(resp, "stats_duo");
                                squadStats = handleApiData(resp, "stats_squads");
                                console.log(lifetimeStats);
                            }).then(() => {
                                // Check error status
                                if(error) return;

                                // GET EMBED
                                var iconm = message.author.avatarURL
                                let ebd = new _discord.RichEmbed();
                                ebd.setAuthor(`Suivi de '${userHandle}'`, _client.user.avatarURL);
                                ebd.setThumbnail(_client.user.avatarURL);
                                ebd.addField("Stats", `Wins: **${lifetimeStats['Wins']}** - K/D: **${lifetimeStats['K/d']}** - Temps de jeux: **${lifetimeStats['Time Played']}**\nTop 3: **${lifetimeStats['Top 3s']}** - Top 5: **${lifetimeStats['Top 5s']}** - Top 6: **${lifetimeStats['Top 6s']}** - Top 12: **${lifetimeStats['Top 12s']}** - Top 25: **${lifetimeStats['Top 25s']}**`);
                                ebd.addField("Solo", `Wins: **${soloStats['top1']}** - K/D: **${soloStats['kd']}** - Temps de jeux: **${soloStats['minutesPlayed']}**`);
                                ebd.addField("Duo", `Wins: **${duoStats['top1']}** - K/D: **${duoStats['kd']}** - Temps de jeux: **${duoStats['minutesPlayed']}**`);
                                ebd.addField("Selection", `Wins: **${squadStats['top1']}** - K/D: **${squadStats['kd']}** - Temps de jeux: **${squadStats['minutesPlayed']}**`);
                                ebd.setFooter(`demander par: ${message.author.tag} |Créé par DCH#0001`, iconm);
                                message.channel.send({ embed: ebd });
                            });
                        }
                        else return checkUsage(message);
                    }
                    break;
            }
        }
    }
});

// READY
_client.on('ready', () => {
    _client.user.setUsername("FortniteStat-Bot");
  console.log(`BOT ${_client.user.tag} connecté!`);
});

// LOGIN
_client.login(process.env.TOKEN);
