// Regenerates the character buckets in docs/index.js from the Blizzard API.
//
//   node tools/roster.mjs            print the generated block to stdout
//   node tools/roster.mjs --write    splice it into docs/index.js between the markers
//
// Credentials: see CREDENTIALS_HELP just below.
//
// Run this once at the start of each season, alongside the KEY_ILVL_MAP update.
// Between runs the page promotes characters out of INACTIVE on its own, so a
// returning player does not require a re-run.

import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CREDS_FILE = join(homedir(), '.blizzard-api.json');

const CREDENTIALS_HELP = `
This script needs a Blizzard API client.

  1. Go to https://develop.battle.net and sign in with your Battle.net account.
  2. Create a client. The name and redirect URI do not matter - the
     client-credentials flow used here ignores them.
  3. Copy the client id and the client secret.

Then supply them either way:

  - Create ${CREDS_FILE} containing:
        {"id": "...", "secret": "..."}

  - Or set the environment variables BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET,
    which take precedence over the file.

The credentials only ever go to oauth.battle.net to mint a short-lived token. They
are never logged, written, or sent anywhere else. The token reads public data only.
`;

const REGION      = 'us';
const REALM_SLUG  = 'stormrage';
const GUILD_SLUG  = 'order-of-chaos';
const MIN_LEVEL   = 90;
const CONCURRENCY = 8;

const HOME_REALM = 'Stormrage';   // characters on this realm are emitted bare
const API        = `https://${REGION}.api.blizzard.com`;
const INDEX_JS   = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'index.js');
const BEGIN      = '    // --- BEGIN GENERATED ROSTER';
const END        = '    // --- END GENERATED ROSTER ---';

const log = (...a) => console.error(...a);

let CLIENT_ID = process.env.BLIZZARD_CLIENT_ID, CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
    try {
        const creds = JSON.parse(readFileSync(CREDS_FILE, 'utf8'));
        CLIENT_ID = creds.id; CLIENT_SECRET = creds.secret;
    } catch {
        log(CREDENTIALS_HELP);
        process.exit(1);
    }
}

async function getToken() {
    const res = await fetch('https://oauth.battle.net/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`);
    return (await res.json()).access_token;
}

// Parsed JSON, or null on 404. Retries 429 and 5xx with backoff.
async function get(token, path, attempt = 0) {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 404) return null;
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
        await new Promise(r => setTimeout(r, (res.status === 429 ? 2000 : 500) * (attempt + 1)));
        return get(token, path, attempt + 1);
    }
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return res.json();
}

async function pool(items, worker, label) {
    const out = new Array(items.length);
    let next = 0, done = 0;
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
        while (next < items.length) {
            const i = next++;
            out[i] = await worker(items[i]);
            if (++done % 25 === 0 || done === items.length) log(`  ${label}: ${done}/${items.length}`);
        }
    }));
    return out;
}

// The page builds RIO urls by concatenation, so non-ascii names must be pre-encoded,
// and off-realm characters carry a -Realm suffix the page splits back apart.
function emitName(c) {
    const realm = c.realm === REALM_SLUG ? '' : '-' + c.realm.replace(/(^|-)(\w)/g, (_, s, ch) => s + ch.toUpperCase());
    return encodeURIComponent(c.name) + realm;
}

const block = (season, active, inactive) => [
    `${BEGIN} - season ${season}, ${new Date().toISOString().slice(0, 10)} ---`,
    `    // Regenerate with: node tools/roster.mjs --write`,
    `    // ACTIVE   = ran a key in season ${season}.`,
    `    // INACTIVE = has M+ history but nothing yet this season. The page promotes`,
    `    //            these into the main table automatically once they post a score,`,
    `    //            so returning players do not need a regeneration.`,
    `    var ACTIVE_CHARS = [`,
    ...active.map(c => `        '${emitName(c)}',`),
    `    ];`,
    ``,
    `    var INACTIVE_CHARS = [`,
    ...inactive.map(c => `        '${emitName(c)}',`),
    `    ];`,
    END,
].join('\n');

(async () => {
    const token = await getToken();

    const season = (await get(token, `/data/wow/mythic-keystone/season/index?namespace=dynamic-${REGION}`)).current_season.id;
    log(`current season: ${season}`);

    const roster = await get(token, `/data/wow/guild/${REALM_SLUG}/${GUILD_SLUG}/roster?namespace=profile-${REGION}&locale=en_US`);
    const candidates = roster.members
        .map(m => ({ name: m.character.name, realm: m.character.realm.slug, level: m.character.level }))
        .filter(m => m.level >= MIN_LEVEL);
    log(`roster ${roster.members.length} -> level ${MIN_LEVEL}: ${candidates.length}`);

    log('fetching keystone profiles...');
    const chars = (await pool(candidates, async c => {
        const k = await get(token, `/profile/wow/character/${c.realm}/${encodeURIComponent(c.name.toLowerCase())}` +
                                   `/mythic-keystone-profile?namespace=profile-${REGION}&locale=en_US`);
        if (!k) return null;
        return { ...c, seasons: (k.seasons ?? []).map(s => s.id),
                 rating: k.current_mythic_rating ? Math.round(k.current_mythic_rating.rating) : 0 };
    }, 'keystone')).filter(Boolean);

    // current_mythic_rating is stale for anyone who has not logged in since the season
    // rolled, so membership is decided by the seasons list, never by the rating.
    const active   = chars.filter(c => c.seasons.includes(season)).sort((a, b) => b.rating - a.rating);
    const inactive = chars.filter(c => !c.seasons.includes(season) && c.seasons.length > 0)
                          .sort((a, b) => a.name.localeCompare(b.name));

    log(`  active (season ${season}): ${active.length}`);
    log(`  inactive (M+ history, no runs yet): ${inactive.length}`);
    log(`  dropped (no M+ history at all): ${chars.length - active.length - inactive.length}`);

    const out = block(season, active, inactive);

    if (!process.argv.includes('--write')) {
        console.log(out);
        log('\n(printed only - pass --write to splice into docs/index.js)');
        return;
    }

    const src = readFileSync(INDEX_JS, 'utf8');
    const start = src.indexOf(BEGIN), stop = src.indexOf(END);
    if (start < 0 || stop < 0) {
        log(`\nMarkers not found in ${INDEX_JS}.`);
        log(`Add these two lines around the generated arrays first:\n  ${BEGIN} ... ---\n  ${END}`);
        process.exit(1);
    }
    // docs/index.js is CRLF in the working tree; emit whatever it already uses so
    // the splice does not leave the file with mixed line endings.
    const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
    const eol = src.indexOf(CR + LF) >= 0 ? CR + LF : LF;
    writeFileSync(INDEX_JS, src.slice(0, start) + out.split(LF).join(eol) + src.slice(stop + END.length));
    log(`\nwrote ${INDEX_JS}`);
})().catch(e => { log('FAILED:', e.message); process.exit(1); });
