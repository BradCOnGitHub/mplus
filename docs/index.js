!function() {

    var chars = [
        'Neito',
        'Blargenskull',
        'Ahsaka',
        'Cezsary',
        'Chao',
        'Drulic',
        'Elita',
        'Kanthal',
        'Malhavoc',
        'Sudac',
        'Tiggie',
        'Uthion',
        'Astranyth',
        'Kko',
        'Nexpel',
        'Nexwrex',
        'Ockham',
        'Taliendra',
        'Unnameable',
        'Marta',
        'Drogan',
        'Evokage',
        'Felshady',
        'Kozanasan',
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
        '2':  { loot: 376, vault: 382 },
        '3':  { loot: 376, vault: 385 },
        '4':  { loot: 379, vault: 385 },
        '5':  { loot: 379, vault: 389 },
        '6':  { loot: 382, vault: 389 },
        '7':  { loot: 385, vault: 392 },
        '8':  { loot: 385, vault: 395 },
        '9':  { loot: 389, vault: 395 },
        '10': { loot: 392, vault: 398 },
        '11': { loot: 392, vault: 402 },
        '12': { loot: 392, vault: 405 },
        '13': { loot: 392, vault: 408 },
        '14': { loot: 395, vault: 408 },
        '15': { loot: 398, vault: 411 },
        '16': { loot: 398, vault: 415 },
        '17': { loot: 402, vault: 415 },
        '18': { loot: 402, vault: 418 },
        '19': { loot: 405, vault: 418 },
        '20': { loot: 405, vault: 421 },
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
