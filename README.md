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

## Handle usage

To resize your image you can add : `_{width}x{height}` before your file extension like :
`cat_500x500.jpg`  
Height can be not defined -> `cat_500x.jpg`

You can resize and crop your image : `_{width}x{height}x{cropHorizontaly}x{cropVerticaly}`  
`cropHorizontaly` values are : `center` (default), `left` and `right`  
`cropVerticaly` values are : `center` (default), `top` and `bottom`  

`cropHorizontaly` or/and `cropVerticaly` values can be not defined

examples :

`cat_500x500xcenter.jpg`, `cat_500x500xcenterxbottom.jpg`, `cat_500x500xxcenter.jpg`
