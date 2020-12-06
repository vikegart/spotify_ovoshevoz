const isLocalhost = window.location.host.includes('localhost');
console.log(window.location.host);

// const DEV_MODE = true;
const isSimpleMode = true; //don't allow user to manually answer
const SPACEBAR = 32;

const localUri = 'http://localhost:8080/index.html';
const productionUri = 'https://vikegart.github.io/spotify_ovoshevoz/index.html';

const clientId = '7ba7afd32f834ecfb4ec745445a309dc';


const redirectUri = isLocalhost ? localUri : productionUri;

const knowBtn = document.getElementById("knowBtn");
const album_guess = document.getElementById('album_guess');
const song_guess = document.getElementById('song_guess');
const artist_guess = document.getElementById("artist_guess");
const revealBtn = document.getElementById('revealBtn');
const pauseBtn = document.getElementById('pauseBtn');
const next_songBtn = document.getElementById('next_songBtn');


const handleKnowBtnClick = () => {
    knowBtn.classList.add("pressed");
    pause_song();

    setTimeout(() => {
        knowBtn.classList.remove("pressed");
    }, 1000);
}


knowBtn.addEventListener('click', () => handleKnowBtnClick());

revealBtn.addEventListener('click', () => {
    reveal_answers();
    revealBtn.blur();
})

pauseBtn.addEventListener('click', () => {
    pause_resume_song();
    pauseBtn.blur();
})

next_songBtn.addEventListener('click', () => {
    next_song();
    next_songBtn.blur();
})

window.addEventListener('keydown', function (e) {
    if (e.keyCode == 32 && e.target == document.body) {
        handleKnowBtnClick();
        e.preventDefault();
    }
});


if (isSimpleMode) {
    album_guess.disabled = true;
    song_guess.disabled = true;
    artist_guess.disabled = true;
}

function Timer(callback, delay) {
    let timerId, start, remaining = delay;

    this.pause = function () {
        window.clearTimeout(timerId);
        remaining -= Date.now() - start;
    };

    this.resume = function () {
        start = Date.now();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.get_time_remaining = function () {
        return remaining;
    };

    this.reset_timer = function (delay) {
        remaining = delay;
        this.resume();
    };

    this.resume();
}

window.onSpotifyWebPlaybackSDKReady = async () => {
    let token = auth();
    let x = await start_player(token);
    console.log(x);
    await play_this_browser();  // sets to play automatically.
    console.log("playing this device");
    set_volume(30);
    set_shuffle(true);
};


guess_matches_enough = (guess, answer) => {
    guess = guess.toLowerCase();
    answer = answer.toLowerCase();

    if (guess.substr(0, 4) === "the ")
        guess = guess.substr(4);
    if (answer.substr(0, 4) === "the ")
        answer = answer.substr(4);

    //and substitution
    if (answer.includes("+") || answer.includes("&") || answer.includes("and")) {
        answer = answer.replace("+", "&");
        answer = answer.replace("&", " & ");
        answer = answer.replace("&", "and");
        answer = answer.replace(/\s+/g, ' ').trim();
        guess = guess.replace("+", "&");
        guess = guess.replace("&", " & ");
        guess = guess.replace("&", "and");
        guess = guess.replace(/\s+/g, ' ').trim();
    }
    if (guess === answer) {
        return true;
    } else {
        let correct = true;
        answer = answer.replace(/[^!@&#$?()/=% a-zA-Z0-9]/g, "*");
        let i;
        if (guess.length === answer.length) {
            for (i = 0; i < guess.length; i++) {
                if (!(guess[i] === answer[i] || answer[i] === "*")) {
                    correct = false;
                }
            }
        } else { return false; }
        return correct;
    }
};

clean_album_name = (album) => {
    let album_trimmed = album;
    if (album.includes('(') && album.includes(')')) {
        let pos_a = album.lastIndexOf('(');
        let pos_b = album.lastIndexOf(')');
        if (pos_b > pos_a) {
            album_trimmed = album.substr(0, pos_a - 1);
            tag_text = album.substr(pos_a + 1, (pos_b - 1) - pos_a); //TODO: Maybe verify its excessive?
        }
        return album_trimmed;
    }
    return album;
};

clean_song_name = (song) => {
    if (song.includes("(feat."))
        song = song.substring(0, song.indexOf("(feat.") - 1);
    if (song.includes("(ft."))
        song = song.substring(0, song.indexOf("(ft.") - 1);
    if (song.includes("(with.") && song.includes(")"))
        song = song.substring(0, song.indexOf("(with") - 1);
    return song;
};

guess_song = (event) => {
    let correct = false;
    let state_val = '';
    let answer = document.song;
    let x = event.code;
    if (x === "Backspace")
        state_val = '';
    else if (x === "Tab")
        return null;
    else if (x === "Enter") {
        let guess = song_guess.value;
        if (guess_matches_enough(guess, answer)) {
            correct = true;
        } else if (answer.includes('(') && answer.includes(')')) {
            let pos_a = answer.lastIndexOf('(');
            let pos_b = answer.lastIndexOf(')');
            if (pos_b < pos_a) {
                state_val = ':(';
            }
            let primary_ans = answer.substr(0, pos_a - 1);
            let secondary_ans = answer.substr(pos_a + 1, (pos_b - 1) - pos_a);
            if (guess_matches_enough(guess, primary_ans) || guess_matches_enough(guess, secondary_ans))
                correct = true;
            else
                state_val = ':(';
        } else if (answer.includes(' - ')) {
            let pos = answer.indexOf(' - ');
            let primary_ans = answer.substr(0, pos);
            let secondary_ans = answer.substr(pos + 3);
            console.log(primary_ans);
            console.log(secondary_ans);
            if (guess_matches_enough(guess, primary_ans) || guess_matches_enough(guess, secondary_ans)) {
                correct = true;
            } else
                state_val = ':(';
        } else
            state_val = ':(';
    }
    if (correct) {
        state_val = ':)';
        song_guess.value = answer;
        song_guess.disabled = true;
        artist_guess.focus();
    }

};

guess_artist = (event) => {
    let correct = false;
    let state_val = '';
    let answer = document.artists;
    let x = event.code;
    if (x === "Backspace")
        state_val = '';
    if (x === "Tab")
        return null;
    if (x === "Enter") {
        let guess = artist_guess.value;
        answer.forEach(artist => {
            if (guess_matches_enough(guess, artist)) {
                correct = true;
            }
        });
        if (!correct)
            state_val = ':(';
    }

    if (correct) {
        artist_guess.value = answer.join(', ');
        artist_guess.disabled = true;
        album_guess.focus();
        state_val = ':)';
    }
};

guess_album = (event) => {
    let correct = false;
    let state_val = '';
    // let answer = clean_album_name(document.album); //TODO: Do I want to remove excess tags here?
    let answer = [document.album, clean_album_name(document.album)];
    let x = event.code;
    if (x === "Backspace")
        state_val = '';
    if (x === "Tab")
        return null;
    if (x === "Enter") {
        let guess = album_guess.value;
        answer.forEach(accepted_album_name => {
            if (guess_matches_enough(guess, accepted_album_name)) {
                correct = true;
            } else if (accepted_album_name.includes(' - ')) {
                let pos = accepted_album_name.indexOf(' - ');
                let secondary_ans = accepted_album_name.substr(0, pos);
                console.log(secondary_ans);
                if (guess_matches_enough(guess, secondary_ans)) {
                    correct = true;
                } else
                    state_val = ':(';
            }
        });
        if (!correct)
            state_val = ':(';
    }

    if (correct) {
        album_guess.value = document.album;
        album_guess.disabled = true;
        state_val = ':)';
    }
};

get_player_name = () => {
    return "SpotiFly Game";
};

start_player = async (token) => {
    return new Promise((resolve, reject) => {
        const player = new Spotify.Player({
            name: get_player_name(),
            getOAuthToken: cb => { cb(token); }
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });

        // Playback status updates
        player.addListener('player_state_changed', state => {
            // console.log('state change: ', state);
            process_state_change(state);
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            document.player_id = device_id;
            resolve("Player Started :)");
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        // Connect to the player!
        player.connect();
    });
};

auth = () => {
    // Get the hash of the url
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce(function (initial, item) {
            if (item) {
                let parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});
    window.location.hash = ''; // 'https://benjaminhunt.github.io/benjaminhunt.github.io-SpotiFly/main.html';

    // Set token
    let _token = hash.access_token;
    //createCookie("spotify_token", _token, 2);

    const authEndpoint = 'https://accounts.spotify.com/authorize';

    // Replace with your app's client ID, redirect URI and desired scopes

    const permission_scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-currently-playing",
        //"playlist-read-private",
        "user-read-playback-state",
        "user-modify-playback-state"
    ];

    // If there is no token, redirect to Spotify authorization
    if (!_token) {
        window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${permission_scopes.join('%20')}&response_type=token&show_dialog=true`;
    }
    document.token = _token;
    return _token;
};

parse_artists = (artists, length) => {
    let names = [];
    for (let i = 0; i < length; i++) {
        names.push(artists[i].name);
    }
    return names;
};

get_artists_str = (artists) => {
    if (artists.length === 1) {
        return "artist: " + artists[0];
    } else {
        return "artists: " + artists.join(", ");
    }
};

send_simple_request = (method, url_param) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: url_param,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + document.token);
                //xhr.setRequestHeader("Accept", "application/json");
                //xhr.setRequestHeader("Content-Type", "application/json");
            }, success: function (data) {
                if (data)
                    resolve(data);
                else
                    resolve("simple request complete.");
            }
        });
    });
};

send_simple_request_with_pay = (method, url_param, payload) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: url_param,
            data: JSON.stringify(payload),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + document.token);
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
            }, success: function (data) {
                resolve(data);
            }
        });
    });
};



track_mismatch = () => {
    return (
        (song_guess.disabled
            && song_guess.value !== document.song)
        || (artist_guess.disabled
            && artist_guess.value !== document.artists.join(", "))
        || (album_guess.disabled
            && album_guess.value !== document.album)
    )
};

post_state_update = (data) => {
    let id = data.track_window.current_track.id;

    if (id === document.track_id)
        return;

    console.log("update >> ", data);

    let song = clean_song_name(data.track_window.current_track.name);
    let num_artists = data.track_window.current_track.artists.length;
    let artists = parse_artists(data.track_window.current_track.artists, num_artists);
    let album = clean_song_name(data.track_window.current_track.album.name); //to handle "ft." in singles, etc.

    document.track_id = id;
    document.pos = data.progress_ms;
    document.song = song;
    document.artists = artists;
    document.album = album;


    reset_guessing_fields();
};

pause_song = async () => {
    await send_simple_request("PUT", "https://api.spotify.com/v1/me/player/pause");
    pauseBtn.innerHTML = "Resume";
    if (document.update_timer) {
        document.update_timer.pause();
        console.log("Song and scheduled update paused.");
    }
};

resume_song = async () => {
    await send_simple_request("PUT", "https://api.spotify.com/v1/me/player/play");
    pauseBtn.innerHTML = "Pause";
    if (document.update_timer) {
        document.update_timer.resume();
        console.log("Song and scheduled update resumed.");
    }
};

pause_resume_song = () => {
    let text = pauseBtn.innerHTML;
    if (text === "Pause")
        pause_song();
    else
        resume_song();
};

next_song = () => {
    send_simple_request("POST", "https://api.spotify.com/v1/me/player/next");
    reset_guessing_fields();
};

set_volume = (vol) => {
    if (vol > 100) {
        vol = 100;
    } else if (vol < 0) {
        vol = 0;
    }
    setTimeout(async function () {
        await send_simple_request(
            "PUT",
            "https://api.spotify.com/v1/me/player/volume?volume_percent=" + vol
        );
        console.log("Volume set to " + vol + "%");
        document.volume = vol;
    }, 500);
};

shift_volume = async (diff) => {
    let vol = document.volume + diff;
    if (vol > 100) {
        vol = 100;
    } else if (vol < 0) {
        vol = 0;
    }
    await send_simple_request(
        "PUT",
        "https://api.spotify.com/v1/me/player/volume?volume_percent=" + vol
    );
    //set_volume(vol);
    console.log("Volume set to " + vol + "%");
    document.volume = vol;
};

set_shuffle = (shuffle_state) => {
    let state = '';
    if (shuffle_state)
        state = "true";
    else
        state = "false";

    setTimeout(function () {
        send_simple_request(
            "PUT",
            "https://api.spotify.com/v1/me/player/shuffle?state=" + state
        )
    }, 1000);
};

search_playlist = (event) => {
    if (event) {
        if (event.code !== "Enter") {
            return null;
        }
    }
    let input = document.getElementById("playlist_input").value;
    if (input === "" || input === null)
        return null;

    let url = "open.spotify.com";
    if (input.includes(url)) {
        let trim_index_a = input.indexOf(url) + url.length;
        input = "spotify" + input.substr(trim_index_a).replace(/\//g, ':');
        input = input.substr(0, input.lastIndexOf('?'));
    }

    send_simple_request_with_pay(
        "PUT",
        "https://api.spotify.com/v1/me/player/play",
        {
            "context_uri": input
        }
    );
    document.getElementById("playlist_input").value = '';
};

play_this_browser = () => {
    return new Promise(async (resolve, reject) => {
        const url_param = "https://api.spotify.com/v1/me/player";
        const payload = { "device_ids": [document.player_id], "play": true };

        await send_simple_request_with_pay("PUT", url_param, payload);
        resolve("playing in this browser!");
    });
};

reveal_answers = () => {
    song_guess.value = document.song;
    artist_guess.value = document.artists.join(", ");
    album_guess.value = document.album;
    song_guess.disabled = true;
    artist_guess.disabled = true;
    album_guess.disabled = true;
};

reset_guessing_fields = () => {
    const empty_str = "";
    song_guess.value = empty_str;
    artist_guess.value = empty_str;
    album_guess.value = empty_str;
    if (!isSimpleMode) {
        song_guess.disabled = false;
        artist_guess.disabled = false;
        album_guess.disabled = false;
    }
};

process_state_change = (state) => {
    let pos = state.position;
    document.pos = pos;
    let dur = state.duration;
    if (state.paused) {
        pauseBtn.innerHTML = "Resume";
    } else {
        pauseBtn.innerHTML = "Pause";
    }
    post_state_update(state);
};

schedule_update = (pos, dur) => {
    let time_ms = dur - pos;
    if (!document.update_timer) {
        document.update_timer = new Timer(() => {
            //update_track(); //removed
            console.log("Scheduled update created.");
        }, time_ms + 1000);
    }
    else {
        document.update_timer.reset_timer(time_ms + 1000);
        console.log("Update Timer Set.");
    }
};
