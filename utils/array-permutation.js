var arrayPermutation = function(arr, permutation) {
	var newArr = [];

	if(permutation.length <= arr.length) {
		newArr = arr.slice();
	} else {
		newArr = arr.concat((new Array(permutation.length - arr.length)).fill(1));
	}

	for(var i = 0; i < permutation.length; i++) {
		newArr[i] = arr[permutation[i] - 1];
	}

	return newArr.slice(0, permutation.length);
}

module.exports = arrayPermutation;