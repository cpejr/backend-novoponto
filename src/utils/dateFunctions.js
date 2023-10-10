function mili2time(timeInMilis) {
	let pad = function (num, size) {
		return ("000" + num).slice(size * -1);
	};
	let time = parseFloat(timeInMilis);
	let hours = Math.floor(time / 1000 / 60 / 60);
	let minutes = Math.floor(time / 1000 / 60) % 60;
	if (hours < 100) return pad(hours, 2) + ":" + pad(minutes, 2);
	else return pad(hours, 3) + ":" + pad(minutes, 2);
}

function mili2timeWith4Digits(timeInMilis) {
  let pad = function (num, size) {
    return ("0000" + num).slice(size * -1);
  };
  let time = parseFloat(timeInMilis);
  let hours = Math.floor(time / 1000 / 60 / 60);
  let minutes = Math.floor(time / 1000 / 60) % 60;
  
  // Ajuste o número de dígitos para 4
  return pad(hours, 4) + ":" + pad(minutes, 2);
}

export { mili2time, mili2timeWith4Digits };
