!function() {

    var chars = [
        //'Ahsaka',
        'Aescarion',
        'Astranyth',
        'Blargenskull',
        'Cezsary',
        'Chao',
        //'Drogan',
        'Drulic',
        'Elita',
        //'Eumsm',
        //'Evokage',
        //'Felshady',
        'Grandkami',
        'Kanthal',
        //'Kko',
        //'Malhavoc',
        //'Marta',
        'Neito',
        //'Nexotic',
        //'Nexwrex',
        'Nexorcism',
        'Ockham',
        'P%C3%BCff',
        'Rakambo',
        'Spunkie', 
        'Sudac',
        'Taliendra',
        //'Tiggie',
        'Truwarr',
        //'Unnameable',
        'Uthion',
        'Yubero',
    ];

    const KEY_ILVL_MAP = {
        '0':  { loot: 681, crest: 'Carved (15)', dtrack:'Champion 1/8',  vault: 691, vtrack:'Champion 4/8' },
        '2':  { loot: 684, crest: 'Runed (10)', dtrack:'Champion 2/8', vault: 694, vtrack:'Hero 1/6' },
        '3':  { loot: 684, crest: 'Runed (12)', dtrack:'Champion 2/8', vault: 694, vtrack:'Hero 1/6' },
        '4':  { loot: 688, crest: 'Runed (14)',  dtrack:'Champion 3/8', vault: 697, vtrack:'Hero 2/6' },
        '5':  { loot: 691, crest: 'Runed (16)',  dtrack:'Champion 4/8', vault: 697, vtrack:'Hero 2/6' },
        '6':  { loot: 694, crest: 'Runed (18)',  dtrack:'Hero 1/6    ', vault: 701, vtrack:'Hero 3/6' },
        '7':  { loot: 695, crest: 'Gilded (10)', dtrack:'Hero 1/6    ', vault: 704, vtrack:'Hero 4/6' },
        '8':  { loot: 697, crest: 'Gilded (12)', dtrack:'Hero 2/6    ', vault: 704, vtrack:'Hero 4/6' },
        '9':  { loot: 697, crest: 'Gilded (14)', dtrack:'Hero 2/6    ', vault: 704, vtrack:'Hero 4/6' },
        '10': { loot: 701, crest: 'Gilded (16)', dtrack:'Hero 3/6    ', vault: 707, vtrack:'Myth 1/6' },
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
