!function() {

    function addCharToTable(charName, table) {

        var row = $('<div>').addClass('pure-u-1').addClass('charrow').appendTo(table);

        $('<div>').addClass('pure-u-1 pure-u-md-5-24 charNameCell').text(charName).appendTo(row);
        var levelCell = $('<div>').addClass('pure-u-4-24 pure-u-md-1-24 levelCell').appendTo(row);
        var dungeonCell = $('<div>').addClass('pure-u-20-24 pure-u-md-11-24').appendTo(row);
        var timestampCell = $('<div>').addClass('pure-u-1 pure-u-md-7-24 timestampCell').appendTo(row);

        $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=stormrage&name=' + charName + '&fields=mythic_plus_weekly_highest_level_runs',
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {
                //console.log(data);

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
                if (bestRun.mythic_level >= 10) {
                    row.addClass('hasTenPlus');
                }
                levelCell.text('+' + bestRun.mythic_level)
                dungeonCell.text(bestRun.dungeon);
                timestampCell.text(bestRun.completed_at);
            }
        );
    }

    var chars = [
        'Neito',
        'Ockham',
        'Blargenskull',
        'Elita',
        'Drogan',
        'Nexwrex',
        'Malhavoc',
        'Thusia',
        'Tiggie',
        'Illaralock',
        'Felshady',
        'Astranyth',
        'Sudac',
        'Ceszary',
        'Drulic',
        'Asceline',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
    ]

    $(function() {

        var charTable = $('#charlist');
        charTable.html('');
        charTable.addClass('pure-g');
        var headerRow = $('<div>').addClass('pure-u-1').addClass('headerrow').appendTo(charTable);

        $('<div>').addClass('pure-u-5-24').text('Character').appendTo(headerRow);
        $('<div>').addClass('pure-u-12-24').text('Best Dungeon').appendTo(headerRow);
        $('<div>').addClass('pure-u-7-24').text('Timestamp').appendTo(headerRow);

        chars.sort();

        $.each(chars, function(index, value){
            if (value.length){
                addCharToTable(value, charTable);    
            }
        });

    });
}()
