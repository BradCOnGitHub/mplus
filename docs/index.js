!function() {

    var chars = [
        'Asceline',
        'Astranyth',
        'Blargenskull',
        'Boggo',
        'Chao',
        'Drulic',
        'Elita',
        'Felshady',
        'Neito',
        'Nexwrex',
        'Ockham',
        'Sudac',
        'Thusia',
        'Tiggie',
        'Trulo',
        'Uthion',
        'Nexterminate',
        'Peppermints',
        'Ethene',
        'Astrælys',
        'Eumsm',
        'Finance',
        'Wrokkout',
    ];

    const DUNGEONS = [
        "AD",
        "FH",
        "KR",
        "ML",
        "SIEGE",
        "SOTS",
        "TD",
        "TOS",
        "UNDR",
        "WM",
        "WORK",
        "YARD"
    ];

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
            + '&fields=mythic_plus_weekly_highest_level_runs,gear,mythic_plus_best_runs:all,'
            + new Date() / 1, // this is a hack to prevent caching because cache control headers trigger CORS and their policy isn't configured
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                vueChar.rioData = data;
                vueChar.fullName = data.name;
                vueChar.needsMeta = false;
                if (data.realm != 'Stormrage') {
                    vueChar.fullName = data.name + '-' + data.realm;
                }

                if (data.mythic_plus_best_runs.length === 0){
                    vueChar.needsMeta = true;
                }
                $.each(data.mythic_plus_best_runs, function(index, value) {
                    if (value.num_keystone_upgrades >= 1 && value.mythic_level >= 15) {
                        vueChar.dungeonMap[value.short_name] = '';
                    } else {
                        vueChar.needsMeta = true;
                    }
                });                

                if (data.mythic_plus_weekly_highest_level_runs.length < 1) {
                    return;
                }

                var plusRuns = data.mythic_plus_weekly_highest_level_runs;
                var bestRun = plusRuns[0];
                if (plusRuns.length > 1 && plusRuns[1].mythic_level > bestRun){
                    bestRun = plusRuns[1];
                }
                if (plusRuns.length > 2 && plusRuns[2].mythic_level > bestRun){
                    bestRun = plusRuns[2];
                }
                if (bestRun.mythic_level >= 15) {
                    bestRun.rowClass = 'has-15';
                } else if (bestRun.mythic_level >= 12) {
                    bestRun.rowClass = 'has-12';
                } else if (bestRun.mythic_level >= 10) {
                    bestRun.rowClass = 'has-10';
                }

                vueChar.bestRun = {
                    dungeon: bestRun.dungeon,
                    level: bestRun.mythic_level,
                    timeStamp: rioDateToWowServerDate(bestRun.completed_at),
                    rowClass:bestRun.rowClass,
                };
            }
        );
    }

    $(function() {
        
        chars.sort();
        DUNGEONS.sort();

        let vueData = {};
        vueData.allChars = [];
        vueData.allDungeons = DUNGEONS;
        
        $.each(chars, function(index, value){
            if (value.length){
                let vueChar = {
                    name: value,
                    fullName: value,
                    dungeonMap: {},
                    server: "Stormrage",
                    bestRun: {},
                    needsMeta: true,
                };                
                if (vueChar.name.indexOf('-') > 0) {
                    var parts = vueChar.name.split('-');
                    vueChar.name = parts[0];
                    vueChar.server = parts[1].split("'").join('');
                    vueChar.fullName = value;
                }

                $.each(DUNGEONS, function(i, dungeon) {
                    vueChar.dungeonMap[dungeon] = dungeon;
                });
                vueData.allChars.push(vueChar);
                processCharacter(vueChar);
            }
        });

        var app = new Vue({
            el: '#vue',
            data: vueData
        });

    });
}()
