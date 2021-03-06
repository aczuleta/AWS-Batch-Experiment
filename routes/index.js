'use strict';
const status = require('http-status');
var express = require('express');
var router = express.Router();

var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

//Configuración para descargar la Imagen
const download = require('image-downloader');
const destino = './public/images';

//Configuración de la librería para manejar la marca de agua
var watermark = require('dynamic-watermark');
var Uploader = require('s3-image-uploader');

//Configuración para usar S3
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

var uploader = new Uploader({
  aws : {
  }
});


/* GET home page. */
router.get('/', function(req, res, next) {
    
   console.log("el servidor está funcionando en orden");
   console.log("estoy en la ubicación correcta");
   
   gm('./public/images/foto_23.jpg')
    .resize(600, 600)
    .colors(128)
    .bitdepth(5)
    .compress("Group4")
    .noProfile()
    .write('./public/images/resize.png', function (err) {
      if (!err) console.log('done');
    });

    res.status(status.OK).json({
      code: 100,
      response: "hellow world"
    });
});

//Ruta para descargar imagen
router.post('/descargar', async function(req, res, next) {
    console.log("estamos descargando una imagen");
    //console.log(secret.accessKeyId);
    //console.log(secret.secretAccessKey);
    let imagen;
    try {
      imagen = await downloadIMG(req.body.urlImagen);
      console.log("./" + imagen);
    }catch(e){
      res.status(510).json({
        code: 103,
        message: e
      });
    }
    finally{
      let optionsImageWatermark = {
        type: "image",
        source: "./" +imagen,
        logo: "uniandes.jpeg", // This is optional if you have provided text Watermark
        destination: "output.png",
        position: {
            logoX : 100,
            logoY : 100,
            logoHeight: 50,
            logoWidth: 50
        }
      };

      watermark.embed(optionsImageWatermark, function(status) {
        //Do what you want to do here
        console.log("acabamos");
        console.log(status);
          uploader.upload({
            fileId : 'someUniqueIdentifier',
            bucket : 'tesis-aczuleta',
            source : 'output.png',
            name : imagen +  '-output.png'
          },
          function(data){ // success
            console.log('upload success:', data);
            // execute success code
          },
          function(errMsg, errObject){ //error
            console.error('unable to upload: ' + errMsg + ':', errObject);
            // execute error code
          });
      });

      res.status(status.OK).json({
        code: 100,
        message: "Upload successfull"
      })
    }
  });
   
  //Función que se encarga de descargar la imagen
  async function downloadIMG(urlImg) {
    let options = {
      url: urlImg,
      dest: destino                  
    }
    try {
      const { filename, image } = await download.image(options);
      //console.log(filename);
      return filename; // => /path/to/dest/image.jpg 
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
   
    
module.exports = router;
