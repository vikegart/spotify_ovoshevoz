# SpotiFly
This is a song information guessing game!

This will allow users to sign in with Spotify's Implicit Authentication Flow, select a playlist, and give them an opportunity to test their knowledge on their favorite songs by guessing the song's name, artist, and album.

**Important Note:** This only works for **Spotify Premium** users. (See: [Spotify Web Docs](https://developer.spotify.com/documentation/web-api/guides/using-connect-web-api/))

### Visit SpotiFly on GitHub Pages
- [Click here](https://vikegart.github.io/spotify_ovoshevoz/index.html) to visit and play.

### Start Player Locally
1. clone this repository
2. modify redirect url within the `auth()` js function to be `localhost:8000/main.html`
3. run `py -m http.server` from the root repository *--Or use an alternative method to host the page locally*
4. visit `localhost:8000/main.html` in a web browser (**Note:** I am currently only testing with Google Chrome)

### Resources
- Spotify Web API
  - [Spotify Web Player](https://developer.spotify.com/documentation/web-playback-sdk/quick-start/#)
  - [Spotify Implicit Auth](https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow)
- Code
  - HTML
  - JavaScript
  - CSS

