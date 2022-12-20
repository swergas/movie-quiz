Welcome to this quiz game about movie actors!

The game consists in looking at a movie poster and guessing which actor appears in this movie, among 4 propositions.


# Installation

## (Optional) Regenerate the game database

First, get an API key version 3 of TMDB from their website.

Then, open a terminal and cd to the folder where this README file sits. Execute the following script, by replacing the value of environment variable TMDB_API_KEY by your key.

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p ../frontend/data
TMDB_API_KEY=abc python generate_database.py > ../frontend/data/database.json
cd ..
```

## Execute a web server to access the game webpage

Open a terminal and cd to the folder where this README file sits. Execute the following script.

```
cd frontend
python3 -m http.server 8000
```

Then open your web browser, and go to http://0.0.0.0:8000/index_without_npm.html



