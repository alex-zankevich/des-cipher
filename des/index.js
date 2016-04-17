'use strict';

class DES {
	constructor(sourceText, key) {
		this.sourceText = sourceText;
		this.key = key;

		this.blocks = [];

		this.initialTextLength = -1;

		this.BLOCK_SIZE = 64;

		this.transformInitialData();
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

		console.log(this.blocks.length);

		this.key = [].slice.call(new Buffer(this.key))
			.map(octet => ('00000000' + octet.toString(2)).slice(-8))
			.join('')
			.split('')
			.map(bit => +bit)
			.filter((bit, index) => (index + 1) % 8);
	}
}

module.exports = DES;