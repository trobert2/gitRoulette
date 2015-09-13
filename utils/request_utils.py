import requests

def get_languages_from_repos(user, token):
    # This is not used anymore because the user may not know all the languages in all of his repos.
    headers = {'Authorization': 'token ' + token}
    repos_url = 'https://api.github.com/users/' + user + '/repos'
    repos = requests.get(repos_url, headers=headers)
    total_languages = []
    for i in repos.json():
        languages_url = i["languages_url"]
        languages = requests.get(languages_url, headers=headers)

        for language in languages.json().keys():
            if language not in total_languages:
                total_languages.append(language)
    return total_languages
