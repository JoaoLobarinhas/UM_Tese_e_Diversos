import os, json, sys
import csv

# path_to_profile = '/home/joaolobarinhasfm/Aux_Repo/FakeNewsNet/code/fakenewsnet_dataset/user_profiles/'
# path_to_followers = '/home/joaolobarinhasfm/Aux_Repo/FakeNewsNet/code/fakenewsnet_dataset/user_followers/'
# path_to_following = '/home/joaolobarinhasfm/Aux_Repo/FakeNewsNet/code/fakenewsnet_dataset/user_following/'
# path_to_renetwork = '/home/joaolobarinhasfm/Aux_Repo/FakeNewsNet/code/fakenewsnet_dataset/politifact/'+sys.argv[1]+'/politifact'+sys.argv[2]

path_to_profile = 'user_profiles/'
path_to_followers = 'user_followers/'
path_to_following = 'user_following/'
path_to_renetwork = 'politifact/'+sys.argv[1]+'/politifact'+sys.argv[2]

def saveRetweets():

    profiles_ids = []

    json_files = [pos_json for pos_json in os.listdir(path_to_profile) if pos_json.endswith('.json')]

    writer = csv.writer(open(f"retweets_{sys.argv[1]}_{sys.argv[2]}.txt", "w"), lineterminator='\n')

    aux_index = 0

    for index,js in enumerate(json_files):
        with open(os.path.join(path_to_profile, js)) as json_file:
            json_text = json.load(json_file)

            ids = json_text['id']
            profiles_ids.append(ids)
            screen_name = json_text['screen_name']
            followers_count = json_text['followers_count']
            friends_count = json_text['friends_count']
            writer.writerow([index, ids, screen_name, followers_count, friends_count])
            json_file.close()
            aux_index = index

    return profiles_ids, aux_index

def saveNetworkFollowers(profiles_ids):

    writer = csv.writer(open(f"network_{sys.argv[1]}_{sys.argv[2]}.txt", "w"), lineterminator='\n')
    for ids in profiles_ids:
        json_followers = [pos_json for pos_json in os.listdir(path_to_followers) if pos_json.startswith(str(ids))]
        if json_followers:
            with open(os.path.join(path_to_followers, json_followers[0])) as json_file:
                json_text = json.load(json_file)
                for follower in json_text["followers"]:
                    writer.writerow([follower, ids])
                json_file.close()
    
def saveNetworkFollowing(profiles_ids):

    writer = csv.writer(open(f"network_{sys.argv[1]}_{sys.argv[2]}.txt", "a"), lineterminator='\n')

    for ids in profiles_ids:
        json_followers = [pos_json for pos_json in os.listdir(path_to_following) if pos_json.startswith(str(ids))]
        if json_followers:
            with open(os.path.join(path_to_following, json_followers[0])) as json_file:
                json_text = json.load(json_file)
                for follower in json_text["following"]:
                    writer.writerow([ids, follower])
                json_file.close()

def checkRetweets(index):

    json_files_tweets = [pos_json for pos_json in os.listdir(path_to_renetwork+"/tweets") if pos_json.endswith('.json')]
    
    writer = csv.writer(open(f"network_{sys.argv[1]}_{sys.argv[2]}.txt", "a"), lineterminator='\n')

    for jst in json_files_tweets:
        with open(os.path.join(path_to_renetwork+"/tweets", jst)) as json_file:
            json_text = json.load(json_file)
            user_id = json_text["user"]["id"]
            for mentions in json_text["entities"]["user_mentions"]:
                writer.writerow([user_id, mentions["id"]])
            with open(os.path.join(path_to_renetwork+"/retweets", jst)) as json_file_rt:
                json_text_rt = json.load(json_file_rt)
                if json_text_rt["retweets"]:
                    for rt in json_text_rt["retweets"]:
                        index = index+1
                        writer.writerow([rt["user"]["id"], user_id])
                json_file_rt.close()
    json_file.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        profiles_ids, index = saveRetweets()
        saveNetworkFollowers(profiles_ids)
        saveNetworkFollowing(profiles_ids)
        #checkRetweets(index)
        print("Done...")
    else:
        print("No news id was given as a argument")

