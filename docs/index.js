!function() {

    // --- BEGIN GENERATED ROSTER - season 18, 2026-09-29 ---
    // Regenerate with: node tools/roster.mjs --write
    // ACTIVE   = ran a key in season 18.
    // INACTIVE = has M+ history but nothing yet this season. The page promotes
    //            these into the main table automatically once they post a score,
    //            so returning players do not need a regeneration.
    var ACTIVE_CHARS = [
        'Yubero',
        'Melic',
        'Asceline',
        'Nexorcism',
        'Taliendra',
        'Astranyth',
        'Cezsary',
        'Sudac',
        'Rakambo',
        'Uthion',
        'Drulic',
        'Ockham',
        'Wrokk',
        'Spunkie',
        'Kaydon',
        'Monlic',
        'Astr%C3%A6lys',
        'Trulore',
        'Elita',
        'Truulegit',
        'Trill',
        'Pontias',
        'Truulorr',
        'Razenezot',
        'Marsan',
        'Dargomar',
        'Yuelai',
        'Trulorre',
        'Gimilbeep',
        'Aescarion',
    ];

    var INACTIVE_CHARS = [
        'Ang%C3%A9lebarthe',
        'Astphaartos',
        'Chao',
        'Cyndahle-Whisperwind',
        'Dhlic',
        'Estene',
        'Eumsm',
        'Evoklic',
        'Grandkami',
        'Iriea',
        'Jasuhn',
        'Kanthal',
        'Kko',
        'Marta',
        'Maugis',
        'Melchion',
        'Neito',
        'Nexterminate',
        'Northene',
        'Peppermints',
        'Ragekage',
        'Rebelyel',
        'Sammyjankis',
        'Tao',
        'Thundor',
        'Thusia',
        'Trulagit',
        'Trulord',
        'Truwarr',
    ];
    // --- END GENERATED ROSTER ---

    // Characters who are not on the guild roster - friends, or a main parked in
    // another guild. The generator never touches this list.
    var MANUAL_CHARS = [
        'P%C3%BCff',
    ];

    const KEY_ILVL_MAP = {
        '0':  { loot: 292, crest: 'Champion', dtrack:'Champion 2/6',  vault: 302, vtrack:'Champion 4/6' },
        '2':  { loot: 295, crest: 'Champion', dtrack:'Champion 2/6',  vault: 305, vtrack:'Hero 1/6' },
        '3':  { loot: 295, crest: 'Hero (8) ', dtrack:'Champion 2/6', vault: 305, vtrack:'Hero 1/6' },
        '4':  { loot: 298, crest: 'Hero (10)', dtrack:'Champion 3/6', vault: 308, vtrack:'Hero 2/6' },
        '5':  { loot: 302, crest: 'Hero (12)', dtrack:'Champion 4/6', vault: 308, vtrack:'Hero 2/6' },
        '6':  { loot: 305, crest: 'Hero (14)', dtrack:'Hero 1/6    ', vault: 311, vtrack:'Hero 3/6' },
        '7':  { loot: 305, crest: 'Hero (16)', dtrack:'Hero 1/6    ', vault: 315, vtrack:'Hero 4/6' },
        '8':  { loot: 308, crest: 'Hero (18)', dtrack:'Hero 2/6    ', vault: 315, vtrack:'Hero 4/6' },
        '9':  { loot: 308, crest: 'Myth (10)', dtrack:'Hero 2/6    ', vault: 315, vtrack:'Hero 4/6' },
        '10': { loot: 311, crest: 'Myth (12)', dtrack:'Hero 3/6    ', vault: 318, vtrack:'Myth 1/6' },
    };
    const MAX_KEY_LEVEL = '10';
    const MAX_KEYS_NEEDED = 8;

    // raider.io serves these responses with cache-control: max-age=300, so bucketing
    // the cache buster to the same window means everyone inside a five minute window
    // requests an identical url and gets a cache hit instead of a fresh origin request.
    // Blizzard's class colours. Nine are used exactly; Death Knight, Demon Hunter,
    // Shaman and Evoker are lightened the minimum needed to clear WCAG AA against
    // the dark row background.
    const CLASS_COLORS = {
        'Death Knight': '#d66275',
        'Demon Hunter': '#ba64d7',
        'Druid':        '#ff7c0a',
        'Evoker':       '#399683',
        'Hunter':       '#aad372',
        'Mage':         '#3fc7eb',
        'Monk':         '#00ff98',
        'Paladin':      '#f48cba',
        'Priest':       '#ffffff',
        'Rogue':        '#fff468',
        'Shaman':       '#2e8ae3',
        'Warlock':      '#8788ee',
        'Warrior':      '#c69b6d',
    };

    const CACHE_WINDOW_MS = 5 * 60 * 1000;

    const THEME_KEY = 'mplus.theme';

    function storedThemeIsDark() {
        try {
            return localStorage.getItem(THEME_KEY) !== 'classic';
        } catch (e) {
            return true;
        }
    }

    function setTheme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        try {
            localStorage.setItem(THEME_KEY, dark ? 'dark' : 'classic');
        } catch (e) {}
    }

    // applied while the document is still parsing so the page never paints the
    // wrong theme first and flashes
    document.documentElement.classList.toggle('dark', storedThemeIsDark());

    function rioDateToWowServerDate(input){
        return new Date(input).toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short'
        });
    }

    function seasonScore(vueChar) {
        var scores = vueChar.rioData.mythic_plus_scores_by_season;
        return scores && scores[0] ? scores[0].scores.all : 0;
    }

    // Which table a character lands in is decided by live raider.io data once it
    // arrives. The generated bucket is only the starting guess, which is what lets a
    // returning player move up on their own without the generator being re-run.
    function isActive(vueChar) {
        return vueChar.loaded ? seasonScore(vueChar) > 0 : vueChar.generatedActive;
    }

    function makeChar(value, generatedActive) {
        var vueChar = {
            name: value,
            fullName: value,
            server: "Stormrage",
            generatedActive: generatedActive,
            loaded: false,
            rioData: {
                mythic_plus_weekly_highest_level_runs: [],
                mythic_plus_previous_weekly_highest_level_runs: []
            },
        };
        if (vueChar.name.indexOf('-') > 0) {
            var parts = vueChar.name.split('-');
            vueChar.name = parts[0];
            vueChar.server = parts[1].split("'").join('');
            vueChar.fullName = parts[0];
        }
        return vueChar;
    }

    function processCharacter(vueChar) {

        return $.ajax({
            url: 'https://raider.io/api/v1/characters/profile?region=us&realm=' + vueChar.server 
            + '&name=' + vueChar.name 
            + '&fields=mythic_plus_weekly_highest_level_runs,'
            + 'mythic_plus_previous_weekly_highest_level_runs,'
            + 'mythic_plus_scores_by_season:current,'
            + Math.floor(Date.now() / CACHE_WINDOW_MS),
            dataType: 'json',
        }).done(
            function(data, textStatus, jqXHR) {

                vueChar.rioData = data;
                vueChar.loaded = true;
                vueChar.fullName = data.name;

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

        let vueData = {};
        vueData.allChars = [];
        vueData.showInactive = false;
        vueData.dark = document.documentElement.classList.contains('dark');
        vueData.lastUpdated = null;
        vueData.KEY_ILVL_MAP = KEY_ILVL_MAP;
        vueData.MAX_KEY_LEVEL = MAX_KEY_LEVEL;
        vueData.MAX_KEYS_NEEDED = MAX_KEYS_NEEDED;

        // The actives and the hand-kept list are fetched first so the main table
        // renders without waiting on the inactive bucket behind it.
        var firstWave = [], secondWave = [];

        $.each(ACTIVE_CHARS.concat(MANUAL_CHARS), function(index, value){
            if (value.length) {
                var vueChar = makeChar(value, true);
                vueData.allChars.push(vueChar);
                firstWave.push(vueChar);
            }
        });

        $.each(INACTIVE_CHARS, function(index, value){
            if (value.length) {
                var vueChar = makeChar(value, false);
                vueData.allChars.push(vueChar);
                secondWave.push(vueChar);
            }
        });

        // One alphabetical order across every bucket. activeChars and inactiveChars
        // filter this array, so a character promoted out of the inactive bucket lands
        // in its alphabetical place rather than after the generated actives.
        vueData.allChars.sort(function(a, b){
            return decodeURIComponent(a.name).localeCompare(decodeURIComponent(b.name));
        });

        Vue.component('char-row', {
            template: '#char-row',
            props: ['char', 'dark'],
            data: function() {
                return {
                    KEY_ILVL_MAP: KEY_ILVL_MAP,
                    MAX_KEY_LEVEL: MAX_KEY_LEVEL,
                    MAX_KEYS_NEEDED: MAX_KEYS_NEEDED,
                };
            },
            computed: {
                classColor: function() {
                    return this.dark ? (CLASS_COLORS[this.char.rioData.class] || '') : '';
                },
            },
        });

        var app = new Vue({
            el: '#vue',
            data: vueData,
            computed: {
                activeChars: function() {
                    return this.allChars.filter(isActive);
                },
                inactiveChars: function() {
                    return this.allChars.filter(function(vueChar){ return !isActive(vueChar); });
                },
            },
            methods: {
                toggleTheme: function() {
                    this.dark = !this.dark;
                    setTheme(this.dark);
                },
            },
        });

        $.when.apply($, firstWave.map(processCharacter)).always(function(){
            vueData.lastUpdated = new Date();
            $.each(secondWave, function(index, vueChar){ processCharacter(vueChar); });
        });

        window.brad = vueData;

    });
}()
