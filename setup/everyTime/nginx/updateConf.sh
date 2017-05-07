echo "Updating nginx.conf locally"
node createConf.js
echo "Taking backup of nginx.conf in /etc/nginx"
sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx_mqtt_hook_bkup.conf
echo "Copying local nginx.conf to /etc/nginx"
sudo cp ./nginx.conf /etc/nginx/
echo "Validating nginx.conf"
sudo nginx -t
echo "Restarting nginx"
sudo service nginx restart