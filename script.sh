#!/bin/bash

PATH="/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/local/sbin"
BASENAME="${0##*/}"


printenv BATCH_PATH

npm start

curl -d '{"urlImagen":"'$BATCH_PATH'"}' -H "Content-Type: application/json" -X POST http://localhost:4040/descargar
export BATCH_PATH="https://s3.amazonaws.com/tesis-aczuleta/Students2017_lowres.jpg"
