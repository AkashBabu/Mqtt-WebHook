echo "#####################Removing all the files in folder --> ./ssl/"
rm -rf ./ssl/*
echo "#####################Please Enter in the following details to Generate your Self signed SSL Certificates"
openssl req -newkey rsa:2048 -nodes -keyout ./ssl/domain.key -x509 -days 365 -out ./ssl/domain.crt
echo "#####################Your SSL certificate are generated in folder --> ./ssl/"