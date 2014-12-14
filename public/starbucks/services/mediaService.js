'use strict';

define(['angular', 'services'], function (angular, services) {
  /* Services */
  return services

    .service('MediaService', ['$http', '$upload', 'AuthService', function ($http, $upload, AuthService) {

      var urlBase = '/api/media';
      var self = this;

      this.createMedia = function ($files, updateProgressCallback, callback) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];
          //TODO save return to cancel uploads!
          var uploadStatus = $upload.upload({
            url: '/api/media/create', //upload.php script, node.js route, or servlet url
            method: 'POST',
            data: {token: AuthService.getToken()},
            file: file
          }).progress(function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            updateProgressCallback(parseInt(100.0 * evt.loaded / evt.total));
          }).success(function (data, status, headers, config) {
            // file is uploaded successfully
            console.log("Media uploaded: " + data.response);
            callback(data.response);
          });
        }
      }

      this.getMedia = function (mediaId, format, callback) {
        self.getBinary(mediaId, format, AuthService.getToken(), function (binary) {
          var dataURL = "data:image/jpeg;base64," + self.base64Encode(binary);
          callback(dataURL);
        });
      }

      this.getBinary = function (mediaId, format, token, callback) {
        var params = JSON.stringify({token: token});
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/api/media/get/' + format + '/' + mediaId, false);

        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        xhr.setRequestHeader("Content-length", params.length);
        xhr.setRequestHeader("Connection", "close");
        xhr.overrideMimeType("text/plain; charset=x-user-defined");

        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
          }
        }

        xhr.send(params);


      }
      this.base64Encode = function (str) {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "", i = 0, len = str.length, c1, c2, c3;
        while (i < len) {
          c1 = str.charCodeAt(i++) & 0xff;
          if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
          }
          c2 = str.charCodeAt(i++);
          if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
          }
          c3 = str.charCodeAt(i++);
          out += CHARS.charAt(c1 >> 2);
          out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
          out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
          out += CHARS.charAt(c3 & 0x3F);
        }
        return out;
      }

    }]);
});