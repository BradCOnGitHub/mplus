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
        '0':  { loot: 493, dtrack:'Champion 1/8', vault: 506, vtrack:'Hero 1/6' },
        '2':  { loot: 496, dtrack:'Champion 2/8', vault: 509, vtrack:'Hero 2/6' },
        '3':  { loot: 499, dtrack:'Champion 3/8', vault: 509, vtrack:'Hero 2/6' },
        '4':  { loot: 499, dtrack:'Champion 3/8', vault: 512, vtrack:'Hero 3/6' },
        '5':  { loot: 502, dtrack:'Champion 4/8', vault: 512, vtrack:'Hero 3/6' },
        '6':  { loot: 502, dtrack:'Champion 4/8', vault: 515, vtrack:'Hero 4/6' },
        '7':  { loot: 506, dtrack:'Hero 1/6    ', vault: 515, vtrack:'Hero 4/6' },
        '8':  { loot: 506, dtrack:'Hero 1/6    ', vault: 519, vtrack:'Myth 1/4' },
        '9':  { loot: 509, dtrack:'Hero 2/6    ', vault: 519, vtrack:'Myth 1/4' },
        '10': { loot: 509, dtrack:'Hero 2/6    ', vault: 522, vtrack:'Myth 2/4' },
    };

    const MAX_KEY_LEVEL = '10';
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
