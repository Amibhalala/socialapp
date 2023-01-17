aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 962511025598.dkr.ecr.ap-south-1.amazonaws.com 2> /dev/null
sudo docker container stop api-gateway
sudo docker container rm api-gateway
sudo docker pull 962511025598.dkr.ecr.ap-south-1.amazonaws.com/api-gateway:1.0.0
sudo docker container run --restart always --env-file .env --name api-gateway -p 5003:5003 -d 962511025598.dkr.ecr.ap-south-1.amazonaws.com/api-gateway:1.0.0