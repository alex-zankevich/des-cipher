'use strict';

let BlockEncoder = require('./block-encoder');

let permutationFunc = require('../utils/array-permutation');

let keyPermutations = require('../config/permutations/key-permutation');
let finalKeyPermutation = require('../config/permutations/final-key-permutation');
let keyShifts = require('../config/key-shifts');

class DES {
	constructor(sourceText, key) {
		this.sourceText = sourceText;
		this.key = key;

		this.blocks = [];
		this.keys = [];

		this.initialTextLength = -1;

		this.BLOCK_SIZE = 64;
		this.STEPS = 16;

		this.transformInitialData();

		this.generateKeys();

		this.encodeData();
	}

	transformInitialData() {
		this.sourceText = [].slice.call(new Buffer(this.sourceText))
			.map(octet => ('00000000' + octet.toString(2)).slice(-8))
			.join('')
			.split('')
			.map(bit => +bit);

		this.initialTextLength = this.sourceText.length;

		this.sourceText = this.sourceText
			.concat((new Array(this.BLOCK_SIZE - this.sourceText.length % this.BLOCK_SIZE)).fill(1));

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

	generateKeys() {
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

		var partC = keyPermutations.C;
		var partD = keyPermutations.D;

		for(var i = 0; i < this.STEPS; i++) {
			for(var j = 0; j < keyShifts[i]; j++) {
				partC.push(partC.shift());
				partD.push(partD.shift());
			}

			this.keys.push(permutationFunc(permutationFunc(this.key, partC)
					.concat(permutationFunc(this.key, partD)), finalKeyPermutation));
		}
	}

	encodeData() {
		this.encodedData = this.blocks.map(block => (new BlockEncoder(block, this.keys)).encodeBlock())
			.map(block => block.join(''))
			.join('');
		
		console.log(this.encodedData);
	}
}

module.exports = DES;