const github = require('../config/dev');
const jsonServer = require('json-server');
const server = jsonServer.create();
const aws = require('aws-sdk');
const multer = require('multer');

const memorystorage = multer.memoryStorage();
const upload = multer({ storage: memorystorage });

server.post('/', upload.array('profile'), function(req, res, next) {
  req.files.forEach(function(fileObj, index) {
    //라우터에 Multer 객체를 연결하면 input name이 일치하는 파일 데이터를 자동으로 받아서 req.files를 통해 접근할 수 있게 처리해 줍니다.
    //메모리 버퍼에 저장하는 형태를 선택했으므로 fileObj는 다음과 같은 속성을 갖게 됩니다.

    //예) Buffer 객체
    fileObj.buffer;

    //예) abc.jpg
    fileObj.originalname;

    //예)'image/jpeg'
    fileObj.mimetype;

    //아마존 S3에 저장하려면 먼저 설정을 업데이트합니다.
    aws.config.region = 'ap-northeast-2'; //Seoul
    aws.config.update({
      accessKeyId: github.accessKeyId,
      secretAccessKey: github.secretAccessKey
    });

    var s3_params = {
      Bucket: 'mmrq',
      Key: fileObj.originalname,
      ACL: 'public-read',
      ContentType: fileObj.mimetype,
      limits: { fileSize: 5 * 1024 * 1024 }
    };

    var s3obj = new aws.S3({ params: s3_params });
    s3obj
      .upload({ Body: fileObj.buffer })
      .on('httpUploadProgress', function(evt) {
        console.log(evt);
      })
      .send(function(err, data) {
        //S3 File URL
        console.log('err', err);
        console.log('data', data);
        var url = data.Location;
        const status = 201;
        res.status(status).json({ status, url });
      });
  });
});

module.exports = server;
