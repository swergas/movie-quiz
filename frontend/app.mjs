import { BlueNiceButton } from "./components/NiceButton.mjs";
const relativeServerRootFolder = ".";

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

const GameLoadingStatus = {
  LOADING: "LOADING", // currently loading, not yet loaded
  LOADING_SUCCESS: "LOADING_SUCCESS", // successfully loaded
  LOADING_FAIL: "LOADING_FAIL" // loading failed, there was an error
};

const GameScreen = {
  LOADER: "LOADER", // loader screen, displaying either that it is currently loading, or that loading failed, or loading success and transitionning to HOME
  HOME: "HOME", // home screen with navigation menu
  PLAYING: "PLAYING" // in-game
};

function GameApp({}){
  const [gameLoadingStatus, setGameLoadingStatus] = React.useState(GameLoadingStatus.LOADING);
  const [gameCurrentScreen, setGameCurrentScreen] = React.useState(GameScreen.LOADER);
  const [gameDatabase, setGameDatabase] = React.useState([]);

  const processGameDatabase = (inputGameDatabaseData) => {
    console.log("Received database data:");
    console.log(inputGameDatabaseData);
    setGameDatabase(inputGameDatabaseData);
    setGameLoadingStatus(GameLoadingStatus.LOADING_SUCCESS);
    setGameCurrentScreen(GameScreen.HOME);
  };

  const loadGameDatabase = () => {
    fetch(`${relativeServerRootFolder}/data/database.json`).then(response => {
      if(!response.ok){
        setGameLoadingStatus(GameLoadingStatus.LOADING_FAIL);
      }
      else {
        response.json().then(processGameDatabase);
      }
    });
  };

  React.useEffect(() => {
    loadGameDatabase();
  }, []);

  if (gameCurrentScreen === GameScreen.LOADER){
    // Display Loading screen
    const titleMessage = gameLoadingStatus === GameLoadingStatus.LOADING ? "Loading..." : "Error: Could not load the game database.";

    return e(
      "div",
      {},
      titleMessage
    );
  } else if (gameCurrentScreen === GameScreen.HOME){
    // Display home screen
    console.log("home screen");
    const onClickPlay = () => {
      setGameCurrentScreen(GameScreen.PLAYING);
    };
    return e(
      "div",
      {
        className: "screen home"
      },
      e(
        "div",
        {
          className: "title"
        },
        "Movie Quiz"
      ),
      e(
        "div",
        {
          className: "spacer"
        }
      ),
      e(
        "div",
        {
          className: "play-button-container"
        },
        e(
          BlueNiceButton,
          {
            className: "play-button",
            label: "Play",
            onClick: onClickPlay
          }
        )
      ),
    );
  } else if (gameCurrentScreen === GameScreen.PLAYING){
    // Display Plaing screen (in-game)
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
  } else {
    return e("div", {}, "Error: Unknown game screen");
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
