'use strict';

let permutationFunction = require('../utils/array-permutation');

let extensionPermutationArr = require('../config/permutations/extension-permutation');
let blockPermutationsArr = require('../config/permutations/block-permutations');
let feistelPermutationArr = require('../config/permutations/feistel-permutation');

var feistelFunction = function(block, key) {
	var SUB_BLOCK_SIZE = 6;

	block = permutationFunction(block, extensionPermutationArr)
		.map((bite, index) => bite ^ key[index]);

	var subBlocks = block.join('')
		.match(new RegExp(`.{1,${SUB_BLOCK_SIZE}}`, 'gim'))
		.map(block => block.split(''));
	
	var sPermutation = function(block, sPerm) {
		var line = parseInt(block[0] + block[SUB_BLOCK_SIZE - 1], 2);
		var collumn = parseInt(block.slice(1, -1), 2);

		return ('0000' + (sPerm[line][collumn])
			.toString(2))
			.slice(-4)
			.split('')
			.map(bite => +bite);
	}

	return permutationFunction(subBlocks.map((block, index) => sPermutation(block, blockPermutationsArr[index])
		.join('')).join('')
		.split('').map(bite => +bite), feistelPermutationArr);
}

module.exports = feistelFunction;