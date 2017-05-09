# MQTT-WebHooks

### Install Nodejs via nvm
> sudo apt-get update  
> sudo apt-get install build-essential libssl-dev  
> curl https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash


  Close and reopen the terminal
> source ~/.profile   
> nvm ls-remote 
> nvm install v7.9.0(Prefer the latest)  
> nvm default use v7.9.0

Check Installation
> node -v
> npm -v

<hr/>

### Install pm2  
> npm install pm2 -g

<hr/>

### Install Mongodb
> sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6  
> echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list  
> sudo apt-get update  
> sudo apt-get install -y mongodb-org  

Check Installation
> sudo service mongod start   
> mongo (Should open a mongo shell)  

<hr/>

### Install Nginx
> sudo apt-get install nginx  

Check installation by visiting the Server Ip on the browser for port 80

<hr/>

### Generate SSL Keys

> ${WORKSPACE_ROOT}/setup/firstTime/generateCert.sh  

The Above command will open up interactive shell prompt, which after filling should generate certificates

<hr/>

### Create a ADMIN user

> node ${WORKSPACE_ROOT}/setup/firstTime/createAdmin.js &lt;username&gt; &lt;password&gt; 

<hr/>

### Create Indexes on Mongodb

> node ${WORKSPACE_ROOT}/setup/firstTime/createIndexes.js  

<hr/>

## Repeat on Every Deployment

### Change config/config.json as per requirement

> nano ${WORKSPACE_ROOT}/config/config.json  

<hr/>

### Configure HTTPS on Nginx

> ${WORKSPACE_ROOT}/setup/everyTime/nginx/updateConf.sh

The above command will generate a new nginx.conf and rename the existing nginx.conf file in /etc/nginx to nginx_mqtt_hook_bkup.conf
and copy the newly generate file to /etc/nginx  

<hr/>

### Start App
> pm2 startOrRestart ${WORKSPACE_ROOT}/ecosystem.json  

Check logs
> pm2 logs  


** You may need to run all the commands only on the first deployment and on further deployments you must run only the command after `Repeat on every deployment`

<hr/>

### Adding New Hooks  

* Create an Account
* Login into your Account
* Create a new Hook
* Go to github.com on your browser
* Go to settings/webhooks
* Add new Hook
* Paste the URL given in the `Please note` section on the dashboard
* Change content-type --> application/json
* Disable SSL verfication as the certificates are self signed certificates