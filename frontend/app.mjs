import { BlueNiceButton } from "./components/NiceButton.mjs";
import { PlayingScreen } from "./components/PlayingScreen.mjs";
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
