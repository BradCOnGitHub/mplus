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
        'Trulo',
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
        '2':  { loot: 402, vault: 415 },
        '3':  { loot: 405, vault: 418 },
        '4':  { loot: 405, vault: 421 },
        '5':  { loot: 408, vault: 421 },
        '6':  { loot: 408, vault: 424 },
        '7':  { loot: 411, vault: 424 },
        '8':  { loot: 411, vault: 428 },
        '9':  { loot: 415, vault: 428 },
        '10': { loot: 415, vault: 431 },
        '11': { loot: 418, vault: 431 },
        '12': { loot: 418, vault: 434 },
        '13': { loot: 421, vault: 434 },
        '14': { loot: 421, vault: 437 },
        '15': { loot: 424, vault: 437 },
        '16': { loot: 424, vault: 441 },
        '17': { loot: 428, vault: 441 },
        '18': { loot: 428, vault: 444 },
        '19': { loot: 431, vault: 444 },
        '20': { loot: 431, vault: 447 },
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
