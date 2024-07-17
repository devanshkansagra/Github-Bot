# Git-Repo-Tracker-Bot

This a discord bot which tracks the Github Repository. It is built using Node.js, Github REST API, Discord.js API.

## Functions of this bot

- Track / Untrack the Github Repository
- Notifies Discord Server Members regarding the New Commits Merged, New Pull Requests, New Issue Raised, Notifies Latest Releases.
- Fetch the details like issues, PR's, Commits

## Commands for interaction

- `!settoken <github_personal_access_token>` Authorize the github
- `!track <github_repo_url>` Tracks the Repository
- `!getCommits <github_repo_name>` List down all the commits of the tracking repository
- `!getPullRequests <github_repo_name>` List down all the pull requests of the tracking repository.
- `!getIssues <github_repo_name>` List down all the issues of the tracking repository
- `!untrack <github_repo_name>` Untracks the github repository

## Prerequisites

- Nodejs (stable version)
- MongoDB

## Installation

- Clone the repository: `https://github.com/devanshkansagra/Git-Notifier`

- Install node packages: `npm install`

- Create an env file: `.env`

- Run this project: `npm start`

### Contents of `.env` file

- `RESET_TOKEN` (get it from discord developer portal)
- `CLIENT_ID` (get it from discord developer portal)
- `DATABASE` (mongodb atlas database link)
