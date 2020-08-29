# Express Images 🏙

Resize and crop your pictures directly with a link

## Installation 📌

`$ npm install express-images`

## Usage

```javascript
const express = require('express');
const expressImage = require('express-images');

const app = express();

expressImage(app, {
  folder: __dirname + '/images', // the images folder
  path: '/media', // the handle
  cache: __dirname + '/.cacheImages', // Store generated images
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 90, // image quality, 90 is perfect, 100 can be heavy
  expiration: 10000, // in ms | can be set as false (optional : default false)
  expirationInterval: 1500, // in ms (optional : default 1000)
});

// your code...
```
You must add the `__dirname` variable for the cache path and the folder path

Just `folder`, `path` and `cache` settings are required
