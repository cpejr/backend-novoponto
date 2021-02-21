function mili2time(timeInMilis) {
  let pad = function (num, size) {
    return ("000" + num).slice(size * -1);
  };
  let time = parseFloat(timeInMilis);
  let hours = Math.floor(time / 1000 / 60 / 60);
  let minutes = Math.floor(time / 1000 / 60) % 60;

  return pad(hours, 2) + ":" + pad(minutes, 2);
}

export { mili2time };
