# What is this?
This is an edit (or fork, if you must say so) of [nightbloo/nb3bot](https://github.com/nightbloo/nb3bot), a Dubtrack.FM BOT made for the nightblue3 room.

You will notice there is no "fork" warning on the repository page, that's because this is not a direct fork, but a copy of the repository.
~~That was done intentionally to allow for a "issues" tab on this repository (GitHub doesn't have Issue pages for forks).~~
GitHub in fact does! But you have to enable it from the repository settings. Problem is, the repository is already done ¯\\\_(ツ)_/¯ 

Below you'll find how to setup the BOT yourself, though it might be incomplete to how [nightbloo/nb3bot](https://github.com/nightbloo/nb3bot) has it, so I would recommend using that.

# Requirements to setup
[NodeJS](https://nodejs.org/en/download/) (recommended LTS)

[Redis](https://redis.io/download)

# Getting started
Couple of steps to get started and getting it working:

First of get the repo in a folder that you know how to get back to later on. Then open a NodeJS terminal there.
When you've opened the NodeJS terminal run ```npm install```.

After doing this you have to make a .env file in the main folder (no filename, just .env).
To do this, copy .env.sample and remove the '.sample' extension, then open it and fill it with the information required.

After doing all this you can just run `npm run bot` or `node dubbot.js` in your friendly neighborhood node terminal and all should be fine and dandy.
