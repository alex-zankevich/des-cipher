'use strict';

let DES = require('./des');
let fs = require('fs');

function readInputData(textFileName, keyFileName) {
	return new Promise((resolve, reject) => {
		fs.readFile(textFileName, 'utf8', (err, text) => {
			if(err) reject(err);
			fs.readFile(keyFileName, 'utf8', (err, key) => {
				if(err) reject(err);
				resolve({
					openText: text,
					key: key
				});
			});
		});
	});
}

let writeFileData = function(cipher, encodedTextPath, decodedTextPath) {
	fs.writeFileSync(encodedTextPath, cipher.encodedText);
	fs.writeFileSync(decodedTextPath, cipher.decodedText);
}
readInputData('./input/text.txt', './input/key.txt')
	.then((data) => {
		var desCipher = new DES();
		
		desCipher.initData(data.openText, data.key);
		desCipher.encodeData();
		desCipher.decodeData();

		desCipher.consoleData();

		writeFileData(desCipher, './output/encoded.txt', './output/decoded.txt');
	});
