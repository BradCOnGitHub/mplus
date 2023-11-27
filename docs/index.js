!function() {

    var chars = [
        'Ahsaka',
        'Astranyth',
        'Blargenskull',
        'Cezsary',
        'Chao',
        'Drakè',
        'Drogan',
        'Drulic',
        'Elita',
        'Eumsm',
        'Evokage',
        'Felshady',
        'Kanthal',
        'Kko',
        'Malhavoc',
        'Marta',
        'Neito',
        'Nexotic',
        'Nexwrex',
        'Ockham',
        'Sudac',
        'Taliendra',
        'Tiggie',
        'Trulegit',
        'Unnameable',
        'Uthion',
        'Yubero',
    ];

    const DUNGEONS = [
        "TOP",
        "MISTS",
        "SD",
        "NW",
        "HOA",
        "DOS",
        "PF",
        "SOA",
    ];

    const KEY_ILVL_MAP = {
        '2':  { loot: 441, dtrack:'Veteran' , vault: 454, vtrack:'Champion' },
        '3':  { loot: 444, dtrack:'Veteran' , vault: 457, vtrack:'Champion' },
        '4':  { loot: 444, dtrack:'Veteran' , vault: 460, vtrack:'Champion' },
        '5':  { loot: 447, dtrack:'Veteran' , vault: 460, vtrack:'Champion' },
        '6':  { loot: 447, dtrack:'Veteran' , vault: 463, vtrack:'Champion' },
        '7':  { loot: 450, dtrack:'Veteran' , vault: 463, vtrack:'Champion' },
        '8':  { loot: 450, dtrack:'Veteran' , vault: 467, vtrack:'Hero'     },
        '9':  { loot: 454, dtrack:'Champion', vault: 467, vtrack:'Hero'     },
        '10': { loot: 454, dtrack:'Champion', vault: 470, vtrack:'Hero'     },
        '11': { loot: 457, dtrack:'Champion', vault: 470, vtrack:'Hero'     },
        '12': { loot: 457, dtrack:'Champion', vault: 473, vtrack:'Hero'     },
        '13': { loot: 460, dtrack:'Champion', vault: 473, vtrack:'Hero'     },
        '14': { loot: 460, dtrack:'Champion', vault: 473, vtrack:'Hero'     },
        '15': { loot: 463, dtrack:'Champion', vault: 476, vtrack:'Hero'     },
        '16': { loot: 463, dtrack:'Champion', vault: 476, vtrack:'Hero'     },
        '17': { loot: 467, dtrack:'Hero'    , vault: 476, vtrack:'Hero'     },
        '18': { loot: 467, dtrack:'Hero'    , vault: 480, vtrack:'Myth'     },
        '19': { loot: 470, dtrack:'Hero'    , vault: 480, vtrack:'Myth'     },
        '20': { loot: 470, dtrack:'Hero'    , vault: 483, vtrack:'Myth'     },
    };

    const MAX_KEY_LEVEL = '20';
    const MAX_KEYS_NEEDED = 8;

    function rioDateToWowServerDate(input){
        return new Date(input).toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short'
        });
    }


    function processCharacter(vueChar) {

        $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=' + vueChar.server 
            + '&name=' + vueChar.name 
            + '&fields=mythic_plus_weekly_highest_level_runs,'
            + 'mythic_plus_previous_weekly_highest_level_runs,'
            + 'mythic_plus_scores_by_season:current,'
            + new Date() / 1, // this is a hack to prevent caching because cache control headers trigger CORS and their policy isn't configured
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                //data.mythic_plus_weekly_highest_level_runs = data.mythic_plus_previous_weekly_highest_level_runs;


                vueChar.rioData = data;
                vueChar.fullName = data.name;
                if (data.realm != 'Stormrage') {
                    vueChar.fullName = data.name + '-' + data.realm;
                }

                data.mythic_plus_previous_weekly_highest_level_runs.sort(function(a, b){
                    return (a.mythic_level - b.mythic_level) * -1;
                });

                if (data.mythic_plus_weekly_highest_level_runs.length < 1) {
                    return;
                }

                data.mythic_plus_weekly_highest_level_runs.sort(function(a, b){
                    return (a.mythic_level - b.mythic_level) * -1;
                });

                while (data.mythic_plus_weekly_highest_level_runs.length > MAX_KEYS_NEEDED) {
                    data.mythic_plus_weekly_highest_level_runs.pop();
                }
            }
        );
    }

    $(function() {
        
        chars.sort();
        DUNGEONS.sort();

        let vueData = {};
        vueData.allChars = [];
        vueData.allDungeons = DUNGEONS;
        vueData.KEY_ILVL_MAP = KEY_ILVL_MAP;
        vueData.MAX_KEY_LEVEL = MAX_KEY_LEVEL;
        vueData.MAX_KEYS_NEEDED = MAX_KEYS_NEEDED;
        
        $.each(chars, function(index, value){
            if (value.length){
                let vueChar = {
                    name: value,
                    fullName: value,
                    dungeonMap: {},
                    server: "Stormrage",
                    rioData: {
                        mythic_plus_weekly_highest_level_runs: [],
                        mythic_plus_previous_weekly_highest_level_runs: []
                    },
                };                
                if (vueChar.name.indexOf('-') > 0) {
                    var parts = vueChar.name.split('-');
                    vueChar.name = parts[0];
                    vueChar.server = parts[1].split("'").join('');
                    vueChar.fullName = value;
                }

                $.each(DUNGEONS, function(i, dungeon) {
                    vueChar.dungeonMap[dungeon] = '0';
                });
                vueData.allChars.push(vueChar);
                processCharacter(vueChar);
            }
        });

        var app = new Vue({
            el: '#vue',
            data: vueData
        });

        window.brad = vueData;

    });
}()
