# ![RealWorld Example App](logo.png)

> ### [Svelte](https://github.com/sveltejs/svelte) frontend with [Couchbase](https://www.couchbase.com) database using [Ottoman](https://ottomanjs.com) containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with SvelteKit including CRUD operations, authentication, routing, pagination, and more.  It also uses Couchbase to persist data and Ottoman as an ODM on the backend.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

## Development
The easiest way to start development would be to use devcontainers.  Either run it through [codespaces in Github](https://docs.github.com/en/codespaces) or locally using [Docker and Visual Studio Code](https://code.visualstudio.com/docs/devcontainers/tutorial)

### Running locally

#### Create `.env` file
After cloning the repo, add a `.env` file to the root of the project to contain the environment variables needed by the application.

1. Create a file named `.env` at the root of the project
2. Add the following variables in the file (the values below are only samples, replace them as needed):

```sh
COUCHBASE_SERVER=couchbase:localhost # do not replace if using the devcontainer
COUCHBASE_BUCKET=realworld
COUCHBASE_SCOPE=conduit
COUCHBASE_USER=cbuser
COUCHBASE_PASSWORD=cbPwd123!
COUCHBASE_ADMIN=cbadmin
COUCHBASE_ADMIN_PASSWORD=cbPwd1234!
ACCESS_TOKEN_SECRET=Sup3rSecre7 # Any random string may be used or generated
```

#### Generate a secret key
To generate a `ACCESS_TOKEN_SECRET`, `openssl` and `rand` can be used like so:

```sh
openssl rand -base64 32
```

#### Running on devcontainer
After installing `Docker` and the [Dev Containers extension for VS Code](vscode:extension/ms-vscode-remote.remote-containers) by following the tutorial above, run the application by:

1. Clone the repo and open it on Visual Studio Code
2. VS Code should automatically detect that there is a devcontainer configuration and will offer to `Reopen in Container`.  But if not, simply open the `Command Palette` by selecting `View` > `Command Palette` from the VS Code menu bar, then select `Dev Containers: Reopen in Container`.
3. Once it is open in the devcontainer, run the application by clicking the `Run and Debug` icon at the `Activity bar` of the VS Code window. Select `Show all automatic debug configurations` then click `Node js...` then finally click `Run Script: dev`
4. VS Code will automatically show another notification to `Open in Browser`, or alternatively, open your browser and go to: `http://localhost:5173`


### To build and start in prod mode:
Simply run the following commands: 
```bash
npm run build
npm run preview
```