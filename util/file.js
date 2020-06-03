const fs = require('fs');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      // for prod : we don't want to break if image doesn't exists (deploy erase them)
      console.log('err', err);
      // throw (err);
    }
  });
}

exports.deleteFile = deleteFile;
