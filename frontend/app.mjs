const relativeServerRootFolder = ".";

function randomIntFromInterval(min, max) {
  /*
  Generate a random integer between min and max (min and max are included, they can be selected)
  */
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateUniqueNumbersFromInterval(min, max, amount) {
  /*
  Generate an array of length `amount`, where each element is different and has been randomly selected
  between min and max (min and max are included, they can be selected)
  */
  let arr = [];
  while(arr.length < amount){
    let r = randomIntFromInterval(min, max);
    if(arr.indexOf(r) === -1){
      arr.push(r);
    }
  }
  return arr;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function GameApp({}){
  const [gameLoadingStatus, setGameLoadingStatus] = React.useState(0); // 0: not yet loaded. 1: loaded with success. 2: loaded with error.
  const [gameDatabase, setGameDatabase] = React.useState([]);

  const processGameDatabase = (inputGameDatabaseData) => {
    console.log("Received database data:");
    console.log(inputGameDatabaseData);
    setGameDatabase(inputGameDatabaseData);
    setGameLoadingStatus(1);
  };

  const loadGameDatabase = () => {
    fetch(`${relativeServerRootFolder}/data/database.json`).then(response => {
      if(!response.ok){
        setGameLoadingStatus(2);
      }
      else {
        response.json().then(processGameDatabase);
      }
    });
  };

  React.useEffect(() => {
    loadGameDatabase();
  }, []);

  if(gameLoadingStatus === 0 || gameLoadingStatus === 2){
    const titleMessage = gameLoadingStatus === 0 ? "Loading..." : "Error: Could not load the game database.";

    return e(
      "div",
      {},
      titleMessage
    );
  } else {

    const randomMovieIndexes = generateUniqueNumbersFromInterval(0, gameDatabase.length - 1, 4);
    console.log("randomMovieIndexes:", randomMovieIndexes);
    const correctMovieIndex = randomMovieIndexes[0];
    const correctMovie = gameDatabase[correctMovieIndex];
    console.log("correctMovie:", correctMovie);
    const correctMoviePosterUrl = correctMovie["poster_url"];
    const correctMovieActor = correctMovie["actor"];
    console.log("correctMovieActor: ", correctMovieActor);
    let movieActors = [
      correctMovieActor,
      gameDatabase[randomMovieIndexes[1]]["actor"],
      gameDatabase[randomMovieIndexes[2]]["actor"],
      gameDatabase[randomMovieIndexes[3]]["actor"],
    ];
    shuffleArray(movieActors);

    const renderedMovieActorsButtons = movieActors.map(
      movieActor => {
        return e(
          "button",
          {},
          movieActor
        );
      }
    );

    return e(
      "div",
      {
        className: "game-app"
      },
      e(
        "div",
        {},
        e(
          "img",
          {
            src: correctMoviePosterUrl
          }
        ),
        ...renderedMovieActorsButtons
      )
    );
  }
}

function main() {
  const container = document.querySelector("#game-app");
  container.innerHTML = "Loading...";
  ReactDOM.render(
    e(
      GameApp,
    ),
    container
  );
}


main();
