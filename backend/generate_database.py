import json
import os
from typing import Any, List, TypedDict

import tmdbsimple as tmdb


class GameDatabaseMovie(TypedDict):
    id: int
    poster_url: str
    actor: str


def generate_movies_database(tmdb_api_key: str, start_year: int = 1999, end_year: int = 2005, verbose: bool = False) -> List[GameDatabaseMovie]:
    """
    Generate a database of movies (containing movie id, poster url, main actor) as a list of objects.
    Generation of the database is done by calling TMDB API v3, and by querying, for each year between
    start_year and end_year, the list of most popular movies which were released on this year.
    Year start_year is included but end_year is not included.
    """
    tmdb.API_KEY = tmdb_api_key
    tmdb.REQUESTS_TIMEOUT = 5
    movies: List[GameDatabaseMovie] = []
    discover = tmdb.Discover()
    for year in range(start_year, end_year): # start_year is included but end_year is not included
        if verbose:
            print(f"Generating for year {year}...")
        response = discover.movie(sort_by='popularity.desc', primary_release_year=year)
        for movie in response['results']:
            id = movie['id']
            if verbose:
                print(f"Generating for movie id {id}...")
            poster_partial_url = movie['poster_path']
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_partial_url}"
            movie = tmdb.Movies(id)
            credits = movie.credits()
            actor = credits['cast'][0]['name']
            movie_entry = GameDatabaseMovie(id=id, poster_url=poster_url, actor=actor)
            movies.append(movie_entry)
    return movies

def main() -> int:
    verbose = os.environ.get("VERBOSE", False)
    if verbose:
        print("Going to generate database of movies and their main actors using TMDB API...")

    tmdb_api_key = os.environ.get("TMDB_API_KEY")
    if not tmdb_api_key:
        print("Error: Please provide a TMDB API key v3, by setting your TMDB_API_KEY environment variable")
        exit(1)

    movies = generate_movies_database(tmdb_api_key, 1999, 2005, verbose)
    if verbose:
        print("Database has been generated! Here it is:")
    print(json.dumps(movies))
    return 0

if __name__ == "__main__":
    exit(main())
