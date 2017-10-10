# ChickenBus-Backend

## Instructions
1. Clone repository
2. In project directory run npm install
3. Get Carolina Cloud Apps CLI tools installed on your machine: https://help.unc.edu/help/carolina-cloudapps-installing-the-command-line-cli-tools/
4. Run `oc login` to authenticate with cloudapps
5. Run `oc get pods` to get list of running pods and copy the mongodb pod name
6. Run `oc port-forward (mongodb pod name) 27017:27017` to start port forwarding to cloudapps db
7. Run `npm run dev`

Note: `npm start` is used for production and will not work on local machine
