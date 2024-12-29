# Github-Bot

![image](https://github.com/user-attachments/assets/a5390593-2528-44d2-af31-631754cef8ef)

### Demo Video
https://github.com/user-attachments/assets/9ad6326a-2717-4588-8f27-7e707fc256a3

This a discord bot which tracks the Github Repository. It is built using Node.js, Github REST API, Discord.js API.

## Functions of this bot

- Track / Untrack the Github Repository
- Notifies Discord Server Members regarding the New Commits Merged, New Pull Requests, New Issue Raised, Notifies Latest Releases.
- Fetch the details like issues, PR's, Commits
- Creates an issue in GitHub

## Commands for interaction

- `/authorize` Authorize the Github account.
- `/track` Tracks the GitHub Repository.
- `/commits` Fetches the overall commits of the repository.
- `/pulls` Fetches overall pull requests of the repository.
- `/issues` Fetches overall the issues of the repository.
- `/issue` Creates an issue in GitHub repository.
- `/untrack` Untracks the GitHub repository.

## Prerequisites

- Nodejs (stable version)
- MongoDB

## Installation

- Clone the repository: https://github.com/devanshkansagra/Github-Bot

- Install node packages: `npm install`

- Create an env file: `.env`

- Run this project: `npm start`

## Setup of this bot to your Discord Server for development

- Create your Discord Server

- Go to user settings in Discord -> Advanced -> Turn on Developer Mode

- Go to Discord developer portal (https://discord.com/developers/applications) -> Create new app (give name Github-Bot) -> Your application will be showed up

- Go to your application -> OAuth2 -> Copy client id

- Go Back -> Bot -> Copy Reset token

- To get GitHub Access Token, please follow: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

### Contents of `.env` file

- `RESET_TOKEN` (get it from discord developer portal)
- `CLIENT_ID` (get it from discord developer portal)
- `DATABASE` (mongodb atlas database link)
- `GUILD_ID` (discord server Guild ID)

## Contribution Guidlines

1. Fork this project

2. Clone your Fork

3. Create a branch

4. Make changes

5. Push the changes to that branch

6. Create a pull request
