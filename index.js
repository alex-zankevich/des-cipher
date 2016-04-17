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

readInputData('./input/text.txt', './input/key.txt')
	.then((data) => {
		var desCipher = new DES(data.openText, data.key);
	});