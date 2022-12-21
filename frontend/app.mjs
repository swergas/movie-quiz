import { BlueNiceButton } from "./components/NiceButton.mjs";
import { PlayingScreen } from "./components/PlayingScreen.mjs";
import { getHighScores } from "./util.mjs";
const relativeServerRootFolder = ".";

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

function HighScores({}) {
  const highscoresSort = (a,b) => {
    if (a["score"] === b["score"]){
      return a["duration"] - b["duration"];
    }
    return b["score"] - a["score"];
  };
  const renderedHighScores = getHighScores().sort(highscoresSort).map(entry => {
    let d = new Date(entry["timestamp"]);
    let s = d.toLocaleString();
    return e(
      "tr",
      {},
      e("td",{}, entry["player"]),
      e("td",{}, entry["score"]),
      e("td",{}, `${entry["duration"]} sec`),
      e("td",{}, s),
    );
  });
  return e(
    "table",
    {
      className:"highscores"
    },
    e(
      "tr",
      {},
      e("th",{},"Player"),
      e("th",{},"Score"),
      e("th",{},"Duration"),
      e("th",{},"Date"),
    ),
    ...renderedHighScores
  );
}

function GameApp({}) {
  const [gameLoadingStatus, setGameLoadingStatus] = React.useState(GameLoadingStatus.LOADING);
  const [gameCurrentScreen, setGameCurrentScreen] = React.useState(GameScreen.LOADER);
  const [gameDatabase, setGameDatabase] = React.useState([]);

  const processGameDatabase = (inputGameDatabaseData) => {
    console.log("Received database data:");
    console.log(inputGameDatabaseData);
    setGameLoadingStatus(GameLoadingStatus.LOADING_SUCCESS);
    setGameDatabase(inputGameDatabaseData);
    setGameCurrentScreen(GameScreen.HOME);
  };

  const loadGameDatabase = () => {
    fetch(`${relativeServerRootFolder}/data/database.json`).then(response => {
      if (!response.ok) {
        setGameLoadingStatus(GameLoadingStatus.LOADING_FAIL);
      }
      else {
        response.json().then(processGameDatabase);
      }
    });
  };

  React.useEffect(() => {
    if (gameLoadingStatus === GameLoadingStatus.LOADING) {
      loadGameDatabase();
    }
  }, [gameDatabase]);

  const onLeave = () => {
    setGameCurrentScreen(GameScreen.HOME);
  }


  if (gameCurrentScreen === GameScreen.LOADER) {
    // Display Loading screen
    const titleMessage = gameLoadingStatus === GameLoadingStatus.LOADING ? "Loading..." : "Error: Could not load the game database.";

    return e(
      "div",
      {},
      titleMessage
    );
  } else if (gameCurrentScreen === GameScreen.HOME) {
    // Display home screen
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
      e(
        "div",
        {
          className: "highscores-section"
        },
        e(
          "div",
          {
            className: "highscores-title"
          },
          "Highscores",
        ),
        e(
          HighScores
        )
      )
    );
  } else if (gameCurrentScreen === GameScreen.PLAYING) {
    // Display Playing screen (in-game)
    return e(
      PlayingScreen,
      {
        gameDatabase,
        onLeave
      }
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
