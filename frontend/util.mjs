/**
 * Generate a random integer between min and max (min and max are included, they can be selected)
 */
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  /**
   * Generate an array of length `amount`, where each element is different and has been randomly selected
   * between min and max (min and max are included, they can be selected)
   */
  function generateUniqueNumbersFromInterval(min, max, amount) {
    let arr = [];
    while(arr.length < amount){
      let r = randomIntFromInterval(min, max);
      if(arr.indexOf(r) === -1){
        arr.push(r);
      }
    }
    return arr;
  }

  /**
   * Randomize array in-place using Durstenfeld shuffle algorithm
   */
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  }

export { randomIntFromInterval, generateUniqueNumbersFromInterval, shuffleArray };
export default shuffleArray;