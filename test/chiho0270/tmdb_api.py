import requests
import json

def fetch_movie_data(movie_id):
    api_key = "b457b7c18d8eb65b1bfc864d4b83ee11"
    base_url = "https://api.themoviedb.org/3/movie/"
    url = f"{base_url}{movie_id}"
    params = {
        "api_key": api_key,
        "language": "ko-KR"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

if __name__ == "__main__":
    movie_id = 986056 # Thunderbolts=986056
    movie_data = fetch_movie_data(movie_id)
    if movie_data:
        movie_name = movie_data.get("title", "unknown_movie").replace(" ", "",).replace(":", "").replace("*", "").replace("?", "").replace("<", "").replace(">", "").replace("|", "")
        file_name = f"{movie_name}.json"
        with open(file_name, "w", encoding="utf-8") as json_file:
            json.dump(movie_data, json_file, ensure_ascii=False, indent=4)