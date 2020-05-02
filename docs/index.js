!function() {

    function addCharToTable(charName, table) {

        var row = $('<div>').addClass('pure-u-1').addClass('charrow').appendTo(table);

        var charNameCell = $('<div>').addClass('pure-u-1 pure-u-md-5-24 charNameCell').text(charName).appendTo(row);
        var levelCell = $('<div>').addClass('pure-u-4-24 pure-u-md-1-24 levelCell').appendTo(row);
        var dungeonCell = $('<div>').addClass('pure-u-20-24 pure-u-md-9-24').appendTo(row);
        var timestampCell = $('<div>').addClass('pure-u-1 pure-u-md-7-24 timestampCell').appendTo(row);
        var cloakLevelCell = $('<div>').addClass('pure-u-1 pure-u-md-2-24 cloak-level-cell').appendTo(row);

        var serverName = "Stormrage";
        if (charName.indexOf('-') > 0) {
            var parts = charName.split('-');
            var charName = parts[0];
            serverName = parts[1].split("'").join('');
        }

        $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=' + serverName 
            + '&name=' + charName 
            + '&fields=mythic_plus_weekly_highest_level_runs,gear,'
            + new Date() / 1, // this is a hack to prevent caching because cache control headers trigger CORS and their policy isn't configured
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                //console.log(data);

                charNameCell.html('');
                var charName = data.name;
                if (data.realm != 'Stormrage'){
                    charName += '-' + data.realm;
                }
                $('<a>').attr('href', data.profile_url).text(charName).appendTo(charNameCell);

                cloakLevelCell.text(data.gear.corruption.cloakRank);

                var plusRuns = data.mythic_plus_weekly_highest_level_runs;

                if (plusRuns.length < 1) {
                    dungeonCell.text('NONE');
                    return;
                }

                var bestRun = plusRuns[0];
                if (plusRuns.length > 1 && plusRuns[1].mythic_level > bestRun){
                    bestRun = plusRuns[1];
                }
                if (plusRuns.length > 2 && plusRuns[2].mythic_level > bestRun){
                    bestRun = plusRuns[2];
                }
                if (bestRun.mythic_level >= 15) {
                    row.addClass('has-15');
                } else if (bestRun.mythic_level >= 12) {
                    row.addClass('has-12');
                } else if (bestRun.mythic_level >= 10) {
                    row.addClass('has-10');
                }

                levelCell.text('[' + bestRun.mythic_level + ']')
                dungeonCell.text(bestRun.dungeon);
                timestampCell.text(new Date(bestRun.completed_at).toLocaleString('en-US', { 
                    timeZone: 'America/New_York',
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'short'
                }));
            }
        );
    }

    var chars = [
        'Ahsaka',
        'Asceline',
        'Astranyth',
        'Blargenskull',
        'Boggo',
        'Cazooiee',
        'Ceszary',
        'Chao',
        'Curseyöu-kelthuzad',
        'Deathkage',
        'Drulic',
        'Elita',
        'Felshady',
        'Karctacus-kelthuzad',
        'Kko',
        'Marta',
        'Neito',
        'Nexwrex',
        'Ockham',
        'Sudac',
        'Thusia',
        'Tiggie',
        'Trulo',
        'Uthion',
    ]

    var metaChars = [
        'Asceline',
        'Chao',
        'Drulic',
        'Elita',
        'Felshady',
        'Marta',
        'Nexterminate',
        'Ockham',
        'Sudac',
        'Thusia',
        'Tiggie',
        'Trulo',
        'Uthion',
    ]

    let allDungeons = [];

    function doMetaCheck(charName, table){
        var row = $('<div>').addClass('pure-u-1').addClass('charrow').appendTo(table);
        let serverName = "Stormrage";
        $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=' + serverName 
            + '&name=' + charName 
            + '&fields=mythic_plus_best_runs:all,'
            + new Date() / 1, // this is a hack to prevent caching because cache control headers trigger CORS and their policy isn't configured
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                // console.log(data);
                
                var charNameCell = $('<div>').addClass('pure-u-3-24').appendTo(row);
                $('<a>').attr('href', data.profile_url).text(data.name).appendTo(charNameCell);
                row.addClass('has-15');
                let dungeonListRow = $('<div>').addClass('pure-u-21-24').appendTo(row);
                let thisCharDungeons = sortDungeons(data.mythic_plus_best_runs);
                let dungeonMap = {}
                $.each(allDungeons, function(index, value) {
                    console.log(value);
                    dungeonMap[value] = 'need';
                });
                $.each(thisCharDungeons, function(index, value) {
                    if (value.num_keystone_upgrades === 0 || value.mythic_level < 15) {
                        dungeonMap[value.short_name] = 'need';
                        row.removeClass('has-15');
                    } else {
                        dungeonMap[value.short_name] = ' ';
                    }
                });
                $.each(allDungeons, function(index, value) {
                    $('<div>').addClass('pure-u-2-24').text(dungeonMap[value]).appendTo(dungeonListRow);
                });
            }
        );        
    }

    function sortDungeons(list){
        return list.sort((a, b) => (a.short_name > b.short_name) ? 1 : -1);
    }

    $(function() {

        var charTable = $('#charlist');
        charTable.html('');
        charTable.addClass('pure-g');
        var headerRow = $('<div>').addClass('pure-u-1').addClass('headerrow').appendTo(charTable);

        $('<div>').addClass('pure-u-5-24').text('Character').appendTo(headerRow);
        $('<div>').addClass('pure-u-10-24').text('Best Dungeon').appendTo(headerRow);
        $('<div>').addClass('pure-u-7-24').text('Timestamp').appendTo(headerRow);
        $('<div>').addClass('pure-u-2-24').text('Cloak').appendTo(headerRow);

        let metaTable = $('#metalist');
        metaTable.html('');
        metaTable.addClass('pure-g');
        var metaHeaderRow = $('<div>').addClass('pure-u-1').addClass('headerrow').appendTo(metaTable);
        $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=Stormrage'
            + '&name=Neito' //just using myself because I know I'm done
            + '&fields=mythic_plus_best_runs:all,'
            + new Date() / 1, // this is a hack to prevent caching because cache control headers trigger CORS and their policy isn't configured
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                $('<div>').addClass('pure-u-3-24').text('Character').appendTo(metaHeaderRow);
                let dungeonListRow = $('<div>').addClass('pure-u-21-24').addClass('headerrow').appendTo(metaHeaderRow);
                let dungeonList = sortDungeons(data.mythic_plus_best_runs);
                $.each(dungeonList, function(index, value){
                    allDungeons.push(value.short_name);
                    $('<div>').addClass('pure-u-2-24').text(value.short_name).appendTo(dungeonListRow);
                });
            }
        );     


        chars.sort();
        
        $.each(chars, function(index, value){
            if (value.length){
                addCharToTable(value, charTable);
            }
        });

        metaChars.sort();

        $.each(metaChars, function(index, value){
            if (value.length){
                doMetaCheck(value, metaTable);
            }
        });        

    });
}()

