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
        'Thusia',
        'Tiggie',
        'Uthion',
        'Astranyth',
        'Kko',
        'Nexpel',
        'Ockham',
        'Gimilbeep',
        'Taliendra',
        'Unnameable',
        'Illarramvp',
        'Belasha',
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
        '2':252,
        '3':252,
        '4':252,
        '5':255,
        '6':255,
        '7':259,
        '8':262,
        '9':262,
        '10':265,
        '11':268,
        '12':272,
        '13':272,
        '14':275,
    };

    const MAX_VAULT_ILVL = 278;

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
        vueData.MAX_VAULT_ILVL = MAX_VAULT_ILVL;
        vueData.MAX_KEYS_NEEDED = MAX_KEYS_NEEDED;
        
        $.each(chars, function(index, value){
            if (value.length){
                let vueChar = {
                    name: value,
                    fullName: value,
                    dungeonMap: {},
                    server: "Stormrage",
                    rioData: {
                        mythic_plus_weekly_highest_level_runs: []
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
