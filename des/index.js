'use strict';

let BlockEncoder = require('./block-encoder');

let permutationFunc = require('../utils/array-permutation');

let keyPermutations = require('../config/permutations/key-permutation');
let finalKeyPermutation = require('../config/permutations/final-key-permutation');
let encodingKeyshifts = require('../config/key-shifts');

class DES {
	constructor(sourceText, key) {
		this.sourceText = sourceText || '';
		this.key = key || '';

		this.blocks = [];
		this.encodingKeys = [];
		this.decodingKeys = [];

		this.initialTextLength = -1;

		this.BLOCK_SIZE = 64;
		this.STEPS = 16;
	}

	initData(sourceText, key) {debugger;
		this.sourceText = sourceText || this.sourceText;
		this.key = key || this.key;

		this.transformInitialData();
		this.generateEncodingKeys();
	}

	consoleData() {
		console.log(this.bitesToText(this.sourceText.join('')));
		console.log('');
		console.log(this.bitesToText(this.encodedData));
		console.log('');
		console.log(this.bitesToText(this.decodedData));
	}

	transformInitialData() {
		this.sourceText = [].slice.call(new Buffer(this.sourceText))
			.map(octet => ('00000000' + octet.toString(2)).slice(-8))
			.join('')
			.split('')
			.map(bit => +bit);

		this.initialTextLength = this.sourceText.length;

		this.sourceText = this.sourceText
			.concat((new Array(this.sourceText.length % this.BLOCK_SIZE ? this.BLOCK_SIZE - this.sourceText.length % this.BLOCK_SIZE : 0)).fill(1));

		this.blocks = this.sourceText
			.join('')
			.match(new RegExp(`.{1,${this.BLOCK_SIZE}}`, 'gim'))
			.map(block => block.split('').map(bit => +bit));

		this.key = [].slice.call(new Buffer(this.key))
			.map(octet => ('00000000' + octet.toString(2)).slice(-8))
			.join('')
			.split('')
			.map(bit => +bit)
			.filter((bit, index) => (index + 1) % 8);
	}

	generateEncodingKeys() {
		var addKeyBits = function() {
			var tempBiteCount = 0;
			for(var i = 0; i < this.key.length + 1; i++) {
				if(!((i + 1) % 8)) {
					if(tempBiteCount % 2) {
						this.key.splice(i, 0, 0);
					} else {
						this.key.splice(i, 0, 1);
					}
					tempBiteCount = 0;
				} else {
					tempBiteCount += this.key[i];
				}
			}
		}.bind(this);

		addKeyBits();

		var initKeys = function(direction) {
			var keys = [];

			var partC = keyPermutations.C;
			var partD = keyPermutations.D;

			for(var i = 0; i < this.STEPS; i++) {
				for(var j = 0; j < encodingKeyshifts[i]; j++) {
					if(direction) {
						partC.push(partC.shift());
						partD.push(partD.shift());
					} else {
						partC.unshift(partC.pop());
						partD.unshift(partD.pop());
					}
				}

				keys.push(permutationFunc(permutationFunc(this.key, partC)
						.concat(permutationFunc(this.key, partD)), finalKeyPermutation));
			}

			return keys;
		}.bind(this);

		this.encodingKeys = initKeys(true);

		this.decodingKeys = (new Array(this.encodingKeys.length))
				.fill([])
				.map((key, index, arr) => this.encodingKeys[this.encodingKeys.length - 1 - index]);
	}

	encodeData() {
		var blockEncoder = new BlockEncoder();

		this.encodedData = this.blocks.map(block => {
				blockEncoder.initBlock(block, this.encodingKeys);
				return blockEncoder.cryptBlock();
			})
			.map(block => block.join(''))
			.join('');
	}

	decodeData() {
		var blockEncoder = new BlockEncoder();
		
		this.decodedData = this.encodedData
			.match(/.{1,64}/gim)
			.map(block => block.split('').map(bite => +bite))
			.map(block => {
				blockEncoder.initBlock(block, this.decodingKeys);
				return blockEncoder.cryptBlock();
			})
			.map(block => block.join(''))
			.join('');
	}

	bitesToText(bites) {
		return bites
			.match(/.{1,8}/gim)
			.map(bite => String.fromCharCode(parseInt(bite, 2)))
			.join('');
	}
}

module.exports = DES;