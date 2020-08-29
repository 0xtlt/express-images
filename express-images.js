const fs = require('fs');
const Jimp = require('jimp');

module.exports = (app, config = {}) => {
  let tempJson = [];

  let configuration = {
    folder: false,
    path: false,
    cache: false,
    maxWidth: 1920,
    maxHeight: 1000,
    quality: 100,
    expiration: false,
    expirationInterval: 1000,
    ...config
  }

  if(!configuration.folder || !configuration.path || !configuration.cache) {
    throw new Error('minimal configuration is needed to work properly');
  }

  fs.access(cache, function(err) {
  if (err && err.code === 'ENOENT') {
    fs.mkdir(cache); //Create dir in case not found
  }
});

  function writeTemp() {
    fs.writeFileSync(configuration.cache + '/temp.json', JSON.stringify(tempJson));
  }

  if(!fs.existsSync(configuration.cache + '/temp.json')) {
    fs.writeFileSync(configuration.cache + '/temp.json', '[]');
  } else {
    tempJson = JSON.parse(fs.readFileSync(configuration.cache + '/temp.json')).map(item => ({
      ...item,
      'created_at': new Date(item.created_at)
    }));
  }

  if(configuration.expiration) {
    setInterval(() => {
      let removedItem = false;

      tempJson.forEach((item, index) => {
        if(new Date() - item.created_at > configuration.expiration) {
          fs.unlinkSync(configuration.cache + '/' + item.picture);
          removedItem = true;
          tempJson.splice(index, 1);
        }
      });

      if(removedItem) {
        writeTemp();
      }
    }, configuration.expirationInterval);
  }


  app.get(configuration.path + '/:path', function(req, res, next) {
    let parts = req.params.path.split('_');
    let end = parts[parts.length - 1];

    if(!end.includes('.')) {
        return res.status(404).send('image not found');
    }

    let ext = end.split('.');
    let dimensions = ext[0];
    ext = ext[ext.length - 1];

    let returnSettings = {
      height: null,
      width: null,
      cropModeX: null,
      cropModeY: null
    }

    if(dimensions.includes('x')) {
      let tmp = dimensions.split('x');

      if(tmp[0].length && !isNaN(tmp[0])) {
        returnSettings.width = +tmp[0];
      }

      if(tmp[1].length && !isNaN(tmp[1])) {
        returnSettings.height = +tmp[1];
      }

      if(tmp[2] && ['center', 'left', 'right'].includes(tmp[2])) {
        let tmp_2 = [Jimp.HORIZONTAL_ALIGN_CENTER, Jimp.HORIZONTAL_ALIGN_LEFT, Jimp.HORIZONTAL_ALIGN_RIGHT];
        returnSettings.cropModeX = tmp_2[['center', 'left', 'right'].indexOf(tmp[2])];
      }

      if(tmp[3] && ['center', 'top', 'bottom'].includes(tmp[3])) {
        let tmp_2 = [Jimp.VERTICAL_ALIGN_MIDDLE, Jimp.VERTICAL_ALIGN_TOP, Jimp.VERTICAL_ALIGN_BOTTOM];
        returnSettings.cropModeY = tmp_2[['center', 'top', 'bottom'].indexOf(tmp[3])];
      }
    }

    if(+returnSettings.height < 0) {
      returnSettings.height = null;
    }

    if(+returnSettings.width < 0) {
      returnSettings.width = null;
    }

    if(returnSettings.height || returnSettings.width) {
      console.log("1");
      if(!returnSettings.width){
        return res.status(404).send('error');
      }

      if(returnSettings.height && returnSettings.height > configuration.maxHeight) {
        return res.status(404).send('error');
      }

      if(returnSettings.width && returnSettings.width > configuration.maxWidth) {
        return res.status(404).send('error');
      }

      if(!returnSettings.height) {
        returnSettings.height = Jimp.AUTO;
      }

      let pathFile = `${parts.slice(0, parts.length - 1).join('_')}.${ext}`;

      if(!fs.existsSync(`${configuration.folder}/${pathFile}`)) {
          return res.status(404).send('image not found');
      }

      if(fs.existsSync(`${configuration.cache}/${req.params.path}`)) {
        return res.sendFile(`${configuration.cache}/${req.params.path}`);
      }

      console.log({returnSettings});

      if(!returnSettings.cropModeX && !returnSettings.cropModeY) {
        Jimp.read(`${configuration.folder}/${pathFile}`).then(img => {
          return img
            .scaleToFit(returnSettings.width, returnSettings.height) // resize
            .quality(configuration.quality) // set JPEG quality
            .write(`${configuration.cache}/${req.params.path}`, () => {
              tempJson.push({
                picture: req.params.path,
                'created_at': new Date()
              });
              writeTemp();
              res.sendFile(`${configuration.cache}/${req.params.path}`)
            }); // save
        }).catch(console.error);
      } else {
        console.log({
          width: returnSettings.width,
          height: returnSettings.height,
          x: returnSettings.cropModeX,
          y: returnSettings.cropModeY
        });
        Jimp.read(`${configuration.folder}/${pathFile}`).then(img => {
          return img
            .cover(returnSettings.width, returnSettings.height, returnSettings.cropModeY ? returnSettings.cropModeY : Jimp.VERTICAL_ALIGN_MIDDLE, returnSettings.cropModeX ? returnSettings.cropModeX : Jimp.HORIZONTAL_ALIGN_CENTER) // resize
            .quality(configuration.quality) // set JPEG quality
            .write(`${configuration.cache}/${req.params.path}`, () => {
              tempJson.push({
                picture: req.params.path,
                'created_at': new Date()
              });
              writeTemp();
              res.sendFile(`${configuration.cache}/${req.params.path}`)
            }); // save
        }).catch(console.error);
      }

    } else {
      if(!fs.existsSync(`${configuration.folder}/${req.params.path}`)) {
          return res.status(404).send('image not found');
      }

      res.sendFile(`${configuration.folder}/${req.params.path}`);

  }
})
}
