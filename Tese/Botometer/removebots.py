import csv
import sys
import json
import os

def removeBotsRetweets(reader, array_bots):

    rows_no_bots = set()
    rows_no_echo_chamber = set()
    rows_clean = set()

    for row in reader:
        if array_bots and row[1] not in array_bots:
            rows_no_bots.add(tuple(row))
        
        if array_echo_chamber and row[1] not in array_echo_chamber:
            rows_no_echo_chamber.add(tuple(row))
        
    rows_clean = rows_no_echo_chamber.intersection(rows_no_bots)

    writerFiles("no_bots", rows_no_bots, "retweets")
    writerFiles("echo_chamber", rows_no_echo_chamber, "retweets")
    writerFiles("clean", rows_clean, "retweets")

def removeBotsNetwork(reader, array_bots):

    rows_no_bots = set()
    rows_no_echo_chamber = set()
    rows_clean = set()

    for row in reader:
        if array_bots and row[0] not in array_bots and row[1] not in array_bots:
            rows_no_bots.add(tuple(row))
        
        if array_echo_chamber and row[0] not in array_echo_chamber and row[1] not in array_echo_chamber:
            rows_no_echo_chamber.add(tuple(row))
        
    rows_clean = rows_no_echo_chamber.intersection(rows_no_bots)

    writerFiles("no_bots", rows_no_bots, "network")
    writerFiles("echo_chamber", rows_no_echo_chamber, "network")
    writerFiles("clean", rows_clean, "network")

def writerFiles(type_, data, file_):

    with open (f"{type_}/{file_}_{id_of_news}.txt", "w") as fileCsv:
        writer = csv.writer(fileCsv)
        for row in data:
            writer.writerow(row)

if __name__=="__main__":
    
    if not os.path.exists("echo_chamber/"):
        os.makedirs("echo_chamber/")

    if not os.path.exists("clean/"):
        os.makedirs("clean/")

    if not os.path.exists("no_bots/"):
        os.makedirs("no_bots/")

    id_of_news = sys.argv[1]

    array_bots = []
    array_echo_chamber = []
    readerRetweets = csv.reader(open(f"retweets_{id_of_news}.txt", "r"))
    readerNetwork = csv.reader(open(f"network_{id_of_news}.txt", "r"))

    with open(f'Stats_of_{id_of_news}.json') as json_file:
        data = json.load(json_file)
        try:
            array_bots = data["bots_data"]["raw_bots"]["bot_accounts"]  
        except KeyError:
            array_bots = None
        try:
            array_echo_chamber = data["echo_chamber"]["echo_chamber_bots"] 
        except KeyError: 
            array_echo_chamber = None
    
    removeBotsRetweets(readerRetweets, array_bots)
    removeBotsNetwork(readerNetwork, array_bots)

    print("Done...")