# cs-materials-react-webclient

# SETUP
### Requirements
[yarn](https://yarnpkg.com/)

## Install dependencies
```sh
$ yarn install
```

## Run the server
```sh
$ yarn start
```

## Optional environment variables
```sh
REACT_APP_API_URL=# URL used for api requests e.g. "https://cs-materials-api.herokuapp.com"
```

## Debian specific

In Debian, the apt package is call yarnpkg and the executable is also called yarnpkg. So you would run:

```sh
$ apt install yarnpkg
$ yarn install
$ export REACT_APP_API_URL="https://cs-materials-api.herokuapp.com"
$ yarn start
```
