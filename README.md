# Connectify 
Live link - https://connectify-prod.vercel.app/login

**_Built using React JS, Redux, Firebase & Styled-Components_** within a week.

## Features and Fuctionality

-   Login using Google (Firebase Authentication)
-   Create a new post or delete existing post
-   Share photos and videos (React player for videos)
-   Like , comment , save posts
-   Realtime update likes , comments and posts
-   Notification about every connection interaction
-   Real time chatting without Plug-inns
-   Auto authenticate user on refresh
-   Sign Out

## How to build your own..?

1. Clone this repo
1. Install all the dependencies
    ```bash
    npm i
    ```
1. Setup Firebase

    - Create Firebase account
    - Create a new project
    - Create a web app for that
    - Copy your config from there

        - Select config option
        - Paste those config inside firebase/config.js file

    - Setup authentication using Google

1. Tweak code as you like
1. Let's build the optimized version

    ```bash
    npm run build
    ```

1. **Now for hosting on Firebase lets config Firebase locally**

    - Install Firebase CLI
    - Login to Firebase

        ```bash
        firebase login
        ```

    - Initialize Firebase

        ```bash
        firebase init
        ```

    - Select hosting in the menu
    - Select your respective project from the list
    - Select 'build' as your hosting directory and other options as you want
    - Let's deploy our clone and make it live

        ```bash
        firebase deploy
        ```

**That's it our clone is up and running share it now**

## Future Plans

-   Might add more login methods
-   Goups chatting
-   waiting room for connection requests

**_NOTE: PLEASE LET ME KNOW IF YOU DISCOVERED ANY BUG OR YOU HAVE ANY SUGGESTIONS_**
