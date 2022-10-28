import botometer 
import csv
import sys
import json
import time
import datetime
import os

results_file = "results_botometer/"

if not os.path.exists(results_file):
    os.makedirs(results_file)

rapidapi_key = ""

twitter_app_auth = {
    'consumer_key': '',
    'consumer_secret': '',
    'access_token': '',
    'access_token_secret': '',
  }

bom = botometer.Botometer(wait_on_ratelimit=True,
                          rapidapi_key=rapidapi_key,
                          **twitter_app_auth)

csvFile = csv.reader(open(f"retweets_{sys.argv[1]}.txt", "r"),delimiter=',')

users_ids = []

for row in csvFile:
    users_ids.append(row[1])

users_ids = list(dict.fromkeys(users_ids))

# Check a sequence of accounts
aux = 0
try:  
  for ids, result in bom.check_accounts_in(users_ids):
    print("results for: "+str(ids))
    with open(f"{results_file}{ids}.json", 'w') as fp:  
      json.dump(result,fp,indent=2)
    aux = aux+1
    if(aux == 2000):
      print("Max requests for the day reached "+ str(datetime.datetime.now()))
      time.sleep(86400)
      aux = 0
  print("Done...")

except Exception as e:
  print(str(e))