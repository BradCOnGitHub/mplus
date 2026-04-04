!function() {

    var chars = [
        //'Ahsaka',
        'Aescarion',
        'Asceline',
        'Astranyth',
        'Blargenskull',
        'Cezsary',
        'Chao',
        //'Drogan',
        'Drulic',
        'Elita',
        'Eumsm',
        //'Evokage',
        //'Felshady',
        //'Grandkami',
        'Kanthal',
        //'Kko',
        //'Malhavoc',
        //'Marta',
        'Melic',
        'Neito',
        //'Nexotic',
        //'Nexwrex',
        'Nexorcism',
        'Ockham',
        'P%C3%BCff',
        'Ragekage',
        'Rakambo',
        'Spunkie', 
        'Sudac',
        'Taliendra',
        //'Tiggie',
        //'Truwarr',
        'Thusia',
        'Trulagit',
        //'Unnameable',
        'Uthion',
        'Yubero',
    ];

    const KEY_ILVL_MAP = {
        '0':  { loot: 246, crest: 'Champion (15)', dtrack:'Champion 1/6',  vault: 256, vtrack:'Champion 4/6' },
        '2':  { loot: 250, crest: 'Hero (6) ', dtrack:'Champion 2/6', vault: 259, vtrack:'Hero 1/6' },
        '3':  { loot: 250, crest: 'Hero (8) ', dtrack:'Champion 2/6', vault: 259, vtrack:'Hero 1/6' },
        '4':  { loot: 253, crest: 'Hero (10)', dtrack:'Champion 3/6', vault: 263, vtrack:'Hero 2/6' },
        '5':  { loot: 256, crest: 'Hero (12)', dtrack:'Champion 4/6', vault: 263, vtrack:'Hero 2/6' },
        '6':  { loot: 259, crest: 'Hero (14)', dtrack:'Hero 1/6    ', vault: 266, vtrack:'Hero 3/6' },
        '7':  { loot: 259, crest: 'Hero (16)', dtrack:'Hero 1/6    ', vault: 269, vtrack:'Hero 4/6' },
        '8':  { loot: 263, crest: 'Hero (18)', dtrack:'Hero 2/6    ', vault: 269, vtrack:'Hero 4/6' },
        '9':  { loot: 263, crest: 'Myth (10)', dtrack:'Hero 2/6    ', vault: 269, vtrack:'Hero 4/6' },
        '10': { loot: 266, crest: 'Myth (12)', dtrack:'Hero 3/6    ', vault: 272, vtrack:'Myth 1/6' },
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

        let vueData = {};
        vueData.allChars = [];
        vueData.KEY_ILVL_MAP = KEY_ILVL_MAP;
        vueData.MAX_KEY_LEVEL = MAX_KEY_LEVEL;
        vueData.MAX_KEYS_NEEDED = MAX_KEYS_NEEDED;
        
        $.each(chars, function(index, value){
            if (value.length){
                let vueChar = {
                    name: value,
                    fullName: value,
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
