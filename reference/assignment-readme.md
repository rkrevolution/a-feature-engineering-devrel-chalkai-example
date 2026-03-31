## Chalk Quickstart

1. Install Chalk

   Install the [Chalk command line tool](https://docs.chalk.ai/cli).
   The Chalk CLI allows you to create, update, and manage your feature
   pipelines directly from your terminal.

   > curl -s -L https://api.chalk.ai/install.sh | sh

2. Login

   Login with Chalk directly from the command line using your Gmail account.
   The [`chalk login`](https://docs.chalk.ai/cli/login) command will
   open your browser and create an API token for your local development.

3. Deploy to a branch
   > git checkout -b parks
   > chalk apply --branch

5. Query some data!
   > chalk query --in park.id=yose --branch

## Chalk + Parks

The National Parks Service has an API that we're going to use to build
features about national parks!

### National Parks Features

We'll be using the National Parks API to model some features and resolvers.

We've set you up with a Chalk project, and you can login from the command line.

See https://docs.chalk.ai/cli/login for more details.

## National Parks API

You can use the following API token:

5QeA6ARYfLEdYl0c8jJiNQyd4J5UK4l5KR7Owcpg

The API for the parks service API is described here:

https://www.nps.gov/subjects/developer/api-documentation.htm#/campgrounds/getCampgrounds
