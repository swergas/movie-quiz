import { addHighScore, randomIntFromInterval, shuffleArray } from "../util.mjs";
import { WhiteNiceButton } from "./NiceButton.mjs";

function TimerDisplay({ startTime }) {
    const [secondsSinceStart, setSecondsSinceStart] = React.useState(0);

    React.useEffect(() => {
        if (startTime != null) {
            let timerInterval = setInterval(
                () => {
                    setSecondsSinceStart(Math.trunc((Date.now() - startTime) / 1000));
                },
                1000
            );
            return () => {
                clearInterval(timerInterval);
            };
        }
    }, [startTime]);
    return e(
        "span",
        {},
        `${secondsSinceStart} sec`
    );
}

const pickNextQuestion = (shuffledGameDatabase, currentMovieIndex) => {
    const currentMovie = shuffledGameDatabase[currentMovieIndex];
    const currentMoviePosterUrl = currentMovie["poster_url"];
    const currentMovieActor = currentMovie["actor"];
    let otherMovieIndex = 0;
    do {
        otherMovieIndex = randomIntFromInterval(0, shuffledGameDatabase.length - 1);
    } while (otherMovieIndex === currentMovieIndex);
    const otherMovie = shuffledGameDatabase[otherMovieIndex];
    const otherMovieActor = otherMovie["actor"];
    let movieActors = [currentMovieActor, otherMovieActor];
    shuffleArray(movieActors);
    return {
        "moviePosterUrl": currentMoviePosterUrl,
        "movieActorsChoices": movieActors,
        "correctMovieActor": currentMovieActor,
    };
};

function PlayingScreen({ gameDatabase, onLeave }) {
    const [gameScore, setGameScore] = React.useState(0);
    const [gameStartTime, setGameStartTime] = React.useState(null);
    const [gameEndTime, setGameEndTime] = React.useState(null);
    const [shuffledGameDatabase, setShuffledGameDatabase] = React.useState(null);
    const [movieIndex, setMovieIndex] = React.useState(0);
    const [moviePosterUrl, setMoviePosterUrl] = React.useState(null);
    const [movieActorsChoices, setMovieActorsChoices] = React.useState([]);
    const [correctMovieActor, setCorrectMovieActor] = React.useState(null);
    const [selectedWrongChoice, setSelectedWrongChoice] = React.useState(null);
    const [lastSuccessTime, setLastSucessTime] = React.useState(null);

    const moveToNextQuestion = (db) => {
        if (db && db.length > 0) {
            const result = pickNextQuestion(db, movieIndex);
            setMoviePosterUrl(result["moviePosterUrl"]);
            setMovieActorsChoices(result["movieActorsChoices"]);
            setCorrectMovieActor(result["correctMovieActor"]);
        }
    };

    const initPlayingScreen = () => {
        setGameScore(0);
        setGameStartTime(Date.now());
        setMovieIndex(0);
        setGameEndTime(null);
        setSelectedWrongChoice(null);
        // Shuffle data received from JSON database, so that each game played is really different
        let myShuffledGameDatabase = [...gameDatabase];
        shuffleArray(myShuffledGameDatabase);
        setShuffledGameDatabase(myShuffledGameDatabase);
        moveToNextQuestion(myShuffledGameDatabase);
    };

    React.useEffect(() => {
        if (gameStartTime === null) {
            initPlayingScreen();
        }
    });

    React.useEffect(() => {
        if (shuffledGameDatabase && shuffledGameDatabase.length > 0) {
            moveToNextQuestion(shuffledGameDatabase);
        }
    }, [movieIndex]);

    let renderedModal = null;
    let renderedTimer = null;
    if (selectedWrongChoice !== null) {
        renderedTimer = e(
            "span",
            {},
            Math.trunc((gameEndTime - gameStartTime) / 1000),
            " sec"
        );
        let renderedSaveHighScore = null;
        if (gameScore > 0){
            renderedSaveHighScore = e(
                "div",
                null,
                e(
                    WhiteNiceButton,
                    {
                        className: "modal-button-save-highscore",
                        onClick: () => {
                            const player_name = prompt("Please type your player name");
                            addHighScore(player_name, gameScore, Math.trunc((gameEndTime - gameStartTime) / 1000), gameEndTime);
                            onLeave();
                        },
                        label: "Save highscore"
                    }
                ),
            );
        }
        renderedModal = e(
            "div",
            {
                className: "modal"
            },
            e(
                "div", { className: "modal-title" }, "GAME OVER!"
            ),
            e(
                "div", { className: "modal-sentence" }, `It was not ${selectedWrongChoice} but ${correctMovieActor}.`,
            ),
            e(
                "div", { className: "modal-sentence" }, `You scored ${gameScore} points in `, renderedTimer, "."
            ),
            renderedSaveHighScore,
            e(
                "div",
                null,
                e(
                    WhiteNiceButton,
                    {
                        className: "modal-button-play-again",
                        onClick: () => {
                            initPlayingScreen();
                        },
                        label: "Play again"
                    }
                ),
            ),
            e(
                "div",
                null,
                e(
                    WhiteNiceButton,
                    {
                        className: "modal-button-exit",
                        onClick: () => {
                            onLeave();
                        },
                        label: "Leave"
                    }
                )
            )
        );
    }
    else {
        renderedTimer = e(
            TimerDisplay,
            {
                startTime: gameStartTime
            }
        )
    }

    const successMessageId = "success-message";
    const renderedSuccessMessage = e(
        "div",
        {
            id: successMessageId
        }
    );
    React.useEffect(() => {
        if (lastSuccessTime && (Date.now() - lastSuccessTime) < 1000) {
            let success = document.getElementById(successMessageId);
            success.textContent = "Correct!";
            setTimeout(() => {
                if (lastSuccessTime && (Date.now() - lastSuccessTime) >= 1000) {
                    success.textContent = "";
                }
            }, 1000);
        }
    }, [lastSuccessTime]);

    const renderedMovieActorsButtons = movieActorsChoices.map(
        movieActor => {
            return e(
                WhiteNiceButton,
                {
                    onClick: () => {
                        if (selectedWrongChoice !== null) {
                            // If user tries to click on an answer button while the Game over modal is displayed, do nothing.
                            return;
                        }
                        if (movieActor === correctMovieActor) {
                            console.log("Correct!");
                            setLastSucessTime(Date.now());
                            setGameScore(gameScore + 1);
                            if (movieIndex >= shuffledGameDatabase.length - 2) {
                                alert("You have successfully answered to all questions. End of the game.");
                                // TODO: Display it on screen and enable player to click on return home button or play again
                            }
                            else {
                                setMovieIndex(movieIndex + 1);
                            }
                        }
                        else {
                            setSelectedWrongChoice(movieActor);
                            setGameEndTime(Date.now());
                        }
                    },
                    label: movieActor
                },
            );
        }
    );

    return e(
        "div",
        {
            className: "screen playing"
        },
        e(
            "div",
            {
                className: "top-bar"
            },
            e(
                "div",
                {
                    className: "current-score"
                },
                `⭐ ${gameScore}`
            ),
            e(
                "div",
                {
                    className: "current-timer"
                },
                "⏱ ",
                renderedTimer
            ),
        ),
        e(
            "div",
            {
                className: "card"
            },
            e(
                "img",
                {
                    src: moviePosterUrl,
                    className: "poster"
                }
            ),
            e(
                "div",
                {
                    className: "question"
                },
                "Which actor appears in this movie?",
            ),
            e(
                "div",
                {
                    className: "choices"
                },
                ...renderedMovieActorsButtons
            )
        ),
        renderedSuccessMessage,
        renderedModal
    );
}
export { PlayingScreen, TimerDisplay };
export default PlayingScreen;