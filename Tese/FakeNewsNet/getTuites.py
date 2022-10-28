#from twython import Twython
import csv
import tweepy
import sys

path_dataset = "dataset/"

last_register = ""

news_type = str(sys.argv[2])
news_url = str(sys.argv[3])
news_title = str(sys.argv[4])
news_id = str(sys.argv[5])

_appKey = "9aVnsqdzGXH3j9P6vWADQSy8i"
_appSecret = "nLxyf69eMJf6hdVaFg4QwnyQcEXZbxLA2UaiEeyujV83e8YomP"
_accessToken = "1131646308547256320-yTOUy5jfolXvWJtgQuRM2KZYGOYhoy"
_accessTokenSecret = "r6QPvLlDVpBhGHNvkKU1oYDoYmcqismlz8st3fZBLO002"

auth = tweepy.OAuthHandler(_appKey, _appSecret)
auth.set_access_token(_accessToken, _accessTokenSecret)
main_api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

with open(f"{path_dataset}politifact_{news_type}.csv", "r") as csvfile:
    reader = csv.reader(csvfile)
    aux = 0
    
    for row in reader:
        aux += 1
        if aux == 2:
            last_register = row

if last_register != "":
    with open(f"{path_dataset}politifact_{news_type}_complete.csv", "a") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(row)

try:
    redirect_url = auth.get_authorization_url()
except tweepy.TweepError as error:
    print(error)
    print('Error! Failed to get request token.')

with open(f"{path_dataset}politifact_{news_type}.csv", "w") as filehandle:
    
    try:
        print(sys.argv[1])
        print(sys.argv[3])
        ids = ""
        writer = csv.writer(filehandle)
        if sys.argv[1] == "search":
            for page in tweepy.Cursor(main_api.search, q=news_url).items():
                print(page.id)
                if ids == "": ids += str(page.id)
                else: ids += '	'+str(page.id)
                
            writer.writerow(["id", "news_url", "title", "tweet_ids"])
            writer.writerow([news_id, news_url, news_title, ids])

        elif sys.argv[1] == "30_day":
            for page in tweepy.Cursor(main_api.search_30_day, environment_name="dev", query=news_url).items():
                print(page.id)
                if ids == "": ids += str(page.id)
                else: ids += '	'+str(page.id)

            writer.writerow(["id", "news_url", "title", "tweet_ids"])
            writer.writerow([news_id, "https://"+news_url, news_title, ids])

        elif sys.argv[1] == "full":
            for page in tweepy.Cursor(main_api.search_full_archive, environment_name="devs", query=news_url, fromDate="202012262315").items():
                print(page.id)
                if ids == "": ids += str(page.id)
                else: ids += '	'+str(page.id)
            
            writer.writerow(["id", "news_url", "title", "tweet_ids"])
            writer.writerow([news_id, "https://"+news_url, news_title, ids])

    except tweepy.TweepError as error:
        print(error)
        writer.writerow(["id", "news_url", "title", "tweet_ids"])
        writer.writerow([news_id, "https://"+news_url, news_title, ids])
        print('Could not access tweet. Skipping...')
        
print("Done...")


