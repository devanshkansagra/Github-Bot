# Git-Repo-Tracker-Bot 

This a version control discord bot which tracks the Github Repository. It is built using Node.js and discord.js API for interaction between Nodejs and Discord bot.

## Functions of this bot

- Tracking the Github Repository
- Notifies Discord Server Members regarding the New Commits Merged, New Pull Requests, New Issue Raised, Notifies Latest Releases.
- Fetch the details like issues, PR's, Commits


## Commands for interaction

- `!track <github_repo_url>` Tracks the Repository
- `!getCommits <github_repo_name>` List down all the commits of the tracking repository 
- `!getPullRequests <github_repo_name>` List down all the pull requests of the tracking repository.
- `!getIssues <github_repo_name>` List down all the issues of the tracking repository
- `!untrack <github_repo_name>` List down all the issues of the tracking repository

## Prerequisites

- Nodejs (stable version)

## Installation

- Clone the repository: `https://github.com/devanshkansagra/Git-Notifier`

- Install node packages: `npm install`

- Create an env file: `.env`

- Run this project: `npm start`

### Contents of `.env` file
- `RESET_TOKEN` (get it from discord developer portal)
- `CLIENT_ID` (get it from discord developer portal) 
