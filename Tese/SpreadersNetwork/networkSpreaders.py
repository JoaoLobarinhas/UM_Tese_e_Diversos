import os, json, sys
import networkx as nx
import csv
import copy
from datetime import datetime, timedelta

from bokeh.io import output_file, save
from bokeh.models import (BoxZoomTool, Circle, HoverTool,
                          MultiLine, Plot, Range1d, ResetTool, 
                          WheelZoomTool)
from bokeh.palettes import Spectral4
from bokeh.plotting import from_networkx

path_to_tweets = f'politifact/{sys.argv[1]}/politifact{sys.argv[2]}/tweets'
path_to_retweets = f'politifact/{sys.argv[1]}/politifact{sys.argv[2]}/retweets'
path_to_profile = 'user_profiles/'
path_to_followers = 'user_followers/'
path_to_following = 'user_following/'
path_to_renetwork = 'politifact/'+sys.argv[1]+'/politifact'+sys.argv[2]

def saveRetweets():

    profiles_ids = []

    json_files = [pos_json for pos_json in os.listdir(path_to_profile) if pos_json.endswith('.json')]

    writer = csv.writer(open(f"retweets_{sys.argv[1]}_{sys.argv[2]}.txt", "w"), lineterminator='\n')

    for index,js in enumerate(json_files):
        with open(os.path.join(path_to_profile, js)) as json_file:
            json_text = json.load(json_file)

            ids = json_text['id']
            profiles_ids.append(json_text['id'])
            screen_name = json_text['screen_name']
            followers_count = json_text['followers_count']
            friends_count = json_text['friends_count']
            writer.writerow([index, ids, screen_name, followers_count, friends_count])
            json_file.close()
            
    return profiles_ids

def saveNetworkFollowers(profiles_ids):

    writer = csv.writer(open(f"network_{sys.argv[1]}_{sys.argv[2]}.txt", "w"), lineterminator='\n')
    
    for ids in profiles_ids:

        json_followers = [pos_json for pos_json in os.listdir(path_to_followers) if pos_json.startswith(str(ids))]
        
        if json_followers:
            
            with open(os.path.join(path_to_followers, json_followers[0])) as json_file:
                
                json_text = json.load(json_file)
                
                for follower in json_text["followers"]:
                    
                    if follower in profiles_ids:
                        
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
                    if follower in profiles_ids:
                        writer.writerow([ids, follower])
                json_file.close()

def connectBotsToUsers(profiles_ids, bots_accounts):
    
    data = []

    tweets_files = [pos_json for pos_json in os.listdir(path_to_tweets) if pos_json.endswith('.json')]
        
    for ids in profiles_ids:

        user_data= {}
        followers = None
        following = None
        bots_following = []
        bots_followers = []
        tweets_made = []
        count_bots_followers = 0
        count_bots_following = 0
            
        for js in tweets_files:
                
            tweets_data = {}

            with open(os.path.join(path_to_tweets, js)) as tweets_file:
                    
                tweets_text = json.load(tweets_file)

                if str(ids) == str(tweets_text["user"]["id_str"]):
                        
                    tweets_data.update({"id_tweet":tweets_text["id_str"]})
                    tweets_data.update({"date":tweets_text["created_at"]})
                    tweets_data.update({"favorites_count":tweets_text["favorite_count"]})
                    
                    if "retweeted_status" in tweets_text:
                        
                        tweets_data.update({"retweet":True})
                        tweets_data.update({"original_tweet":tweets_text["retweeted_status"]["id_str"]})
                        tweets_data.update({"user_id":tweets_text["retweeted_status"]["user"]["id_str"]})
                    
                    else:

                        tweets_data.update({"retweet":False})
                        tweets_data.update({"retweets_count":tweets_text["retweet_count"]})

                    if tweets_text["retweet_count"] > 0:
                            
                        retweets_data = []

                        with open(os.path.join(path_to_retweets, js)) as retweets_file:
                                
                            retweets_text = json.load(retweets_file)

                            for retweets in retweets_text["retweets"]:

                                if retweets["user"]["id"] in profiles_ids and ids != tweets_text["user"]["id"]:

                                    retweet = {}

                                    retweet.update({"user_id":retweets["user"]["id_str"]})
                                    retweet.update({"retweets_id":retweets["id_str"]})
                                    retweet.update({"date":retweets["created_at"]})
                                    retweet.update({"favorites":retweets["favorite_count"]})
                                    retweet.update({"retweets":retweets["retweet_count"]})

                                    if retweets_text["user"]["id_str"] in bots_accounts:
                                        retweet.update({"bot":True})
                                    else:
                                        retweet.update({"bot":False})

                                    retweets_data.append(retweet)
                                
                            tweets_data.update({"retweets":retweets_data})
                        
                        tweets_made.append(tweets_data)

        with open(str(path_to_profile)+str(ids)+".json") as json_file:

            json_text = json.load(json_file)

            followers = str(json_text["followers_count"])
            following = str(json_text["friends_count"])

        with open(f"network_{sys.argv[1]}_{sys.argv[2]}.txt", "r") as network:
            
            for line in network.readlines():
                
                aux = line.split(",")
                following_id = aux[1].replace("\n","")
                followers_id = aux[0]

                if str(ids) == following_id:

                    if followers_id in bots_accounts:

                        if followers_id not in bots_following:

                            count_bots_following = count_bots_following + 1
                            bots_following.append(followers_id)

                if str(ids) == followers_id: 

                    if following_id in bots_accounts:

                        if following_id not in bots_followers:

                            count_bots_followers = count_bots_followers + 1
                            bots_followers.append(following_id)

        user_data.update({"user_id":str(ids)})    
        user_data.update({"followers":followers})
        user_data.update({"following":following})
        if str(ids) in bots_accounts:
            user_data.update({"bot":True})
        else:
            user_data.update({"bot":False})
        user_data.update({"num_bots_following":count_bots_following})
        user_data.update({"num_bots_followers":count_bots_followers})
        user_data.update({"bots_following":bots_following})
        user_data.update({"bots_followers":bots_followers})
        user_data.update({"tweets":tweets_made})

        data.append(user_data)

    for users in data:

        for tweets in users["tweets"]:

            for other_users in data:

                for others_tweets in other_users["tweets"]:
                    
                    if "retweet" in others_tweets :

                        if others_tweets["retweet"] == True and tweets["id_tweet"] == others_tweets["original_tweet"]:

                            with open(os.path.join(path_to_tweets, others_tweets["id_tweet"]+".json")) as retweets_file:
                                    
                                retweets_text = json.load(retweets_file)

                                retweets = {}

                                retweets.update({"user_id":retweets_text["user"]["id_str"]})
                                retweets.update({"retweets_id":retweets_text["id_str"]})
                                retweets.update({"date":retweets_text["created_at"]})
                                retweets.update({"favorites":retweets_text["favorite_count"]})
                                retweets.update({"retweets":retweets_text["retweet_count"]})

                                if retweets_text["user"]["id_str"] in bots_accounts:
                                    retweets.update({"bot":True})
                                else:
                                    retweets.update({"bot":False})

                                tweets["retweets"].append(retweets)
            
    with open(f'Spreaders_Data_{sys.argv[1]}_{sys.argv[2]}.json', 'w') as fp:
        json.dump(data, fp, indent=2)

    return data

def loadIdsBots():

    json_text = json.load(open(f"Stats_of_{sys.argv[1]}_{sys.argv[2]}.json", "r"))

    bot_accounts = []

    if "bots_data" in json_text: bot_accounts = json_text["bots_data"]["raw_bots"]["bot_accounts"]

    return bot_accounts

def createTweetsGraph(data):

    G = nx.Graph()

    for users in data:

        for tweets in users["tweets"]:

            new_date = datetime.strftime(datetime.strptime(tweets["date"],'%a %b %d %H:%M:%S +0000 %Y'), '%Y-%m-%d %H:%M:%S')

            if tweets["retweet"]:

                G.add_node(tweets["id_tweet"], user_id = users["user_id"], bot = users["bot"], date = new_date)
            
            else:

                G.add_node(tweets["id_tweet"], user_id = users["user_id"], bot = users["bot"], date = new_date, retweets = tweets["retweets_count"])
    
    for users in data:

        for tweets in users["tweets"]:

            if not tweets["retweet"]:

                for retweets in tweets["retweets"]:

                    if retweets["bot"]:

                        G.add_edge(tweets["id_tweet"], retweets["retweets_id"], weight=1, edge_color="red")
                    
                    else:

                        G.add_edge(tweets["id_tweet"], retweets["retweets_id"], weight=1, edge_color="black")

    plot = Plot(plot_width=1260, plot_height=1024, x_range=Range1d(-1.1, 1.1), y_range=Range1d(-1.1, 1.1))
    
    plot.title.text = f"Graph Tweets {sys.argv[1]} {sys.argv[2]}"

    node_hover_tool = HoverTool(tooltips=[("user id", "@index"), ("bot", "@bot"), ("date", "@date"), ("retweets", "@retweets")])

    plot.add_tools(node_hover_tool, BoxZoomTool(), ResetTool(), WheelZoomTool())

    graph_renderer = from_networkx(G, nx.spring_layout, scale=1, center=(0, 0))

    graph_renderer.node_renderer.glyph = Circle(size=15, fill_color=Spectral4[0])
    graph_renderer.edge_renderer.glyph = MultiLine(line_color="edge_color", line_alpha=0.8, line_width=1)
    plot.renderers.append(graph_renderer)

    output_file(f"Graphs_Tweets_{sys.argv[1]}_{sys.argv[2]}.html", mode='inline')

    save(plot)

def createUsersGraph(profiles_ids, bot_accounts, data):

    G = nx.Graph()
    # H -> Graph with followers
    H = None
    array_followers = []
    userTweets = []

    for ids in profiles_ids:

        with open(os.path.join(path_to_profile, str(ids)+".json")) as json_file:

            json_text = json.load(json_file)

            if json_text["id_str"] in bot_accounts:

                G.add_node(json_text["id_str"], bot = True, followers = json_text["followers_count"], following = json_text["friends_count"])
            
            else:

                G.add_node(json_text["id_str"], bot = False, followers = json_text["followers_count"], following = json_text["friends_count"])
    
    for ids in profiles_ids:

        with open(os.path.join(path_to_followers, str(ids)+".json")) as json_file:

            json_text = json.load(json_file)

            for follower in json_text["followers"]:

                if follower in profiles_ids:

                    array_followers.append((str(ids), str(follower)))
    
    for users in data:

        user_data = {}
        tweets_array = []
        colors = []

        users_influenced = 0
        followers_influenced = 0
        followers_bot_influenced = 0
        non_followers_influenced = 0
        non_followers_bot_influenced = 0

        for tweets in users["tweets"]:

            tweets_data = {}
            followers_tweets = []
            followers_bot_tweets = []
            non_followers_tweets = []
            non_followers_bot_tweets = []

            if not tweets["retweet"]:

                if G.nodes[users["user_id"]]:

                    G.nodes[users["user_id"]]["retweet"] = False

                for retweets in tweets["retweets"]:

                    for user_tuple, follower_tuple in array_followers:

                        if user_tuple == users["user_id"] and follower_tuple == retweets["user_id"]:

                            if retweets["bot"]: 
                                
                                G.add_edge(user_tuple, follower_tuple, weight=1, edge_color="red")
                                followers_bot_tweets.append(follower_tuple)

                            else: 
                                
                                G.add_edge(user_tuple, follower_tuple, weight=1, edge_color="blue")
                                followers_tweets.append(follower_tuple)
                        
                for retweets in tweets["retweets"]:

                    if not G.has_edge(users["user_id"], retweets["user_id"]):

                        if retweets["bot"]: 
                            
                            G.add_edge(users["user_id"], retweets["user_id"], weight=1, edge_color="green")
                            non_followers_bot_tweets.append(retweets["user_id"])

                        else: 
                            
                            G.add_edge(users["user_id"], retweets["user_id"], weight=1, edge_color="black")
                            non_followers_tweets.append(retweets["user_id"])

                tweets_data.update({"id_tweet":tweets["id_tweet"]})
                tweets_data.update({"number_retweets":tweets["retweets_count"]})
                number_public_tweets = len(followers_tweets)+len(followers_bot_tweets)+len(non_followers_tweets)+len(non_followers_bot_tweets)
                tweets_data.update({"number_retweets_public":number_public_tweets})
                
                tweets_data.update({"number_non_followers_bot_tweets":len(non_followers_bot_tweets)})
                tweets_data.update({"number_non_followers_tweets":len(non_followers_tweets)})
                tweets_data.update({"number_followers_bot_tweets":len(followers_bot_tweets)})
                tweets_data.update({"number_followers_tweets":len(followers_tweets)})

                tweets_data.update({"non_followers_bot_tweets":non_followers_bot_tweets})
                tweets_data.update({"non_followers_tweets":non_followers_tweets})
                tweets_data.update({"followers_bot_tweets":followers_bot_tweets})
                tweets_data.update({"followers_tweets":followers_tweets})

                tweets_array.append(tweets_data)

                users_influenced = users_influenced + tweets["retweets_count"]
                non_followers_influenced = non_followers_influenced + len(non_followers_tweets)
                non_followers_bot_influenced = non_followers_bot_influenced + len(non_followers_bot_tweets)
                followers_influenced = followers_influenced + len(followers_tweets)
                followers_bot_influenced = followers_bot_influenced + len(followers_bot_tweets)

            elif G.nodes[users["user_id"]] and "retweet" not in G.nodes[users["user_id"]]:

                G.nodes[users["user_id"]]["retweet"] = True


        if users_influenced > 0:

            user_data.update({"user_id":users["user_id"]})
            user_data.update({"followers":users["followers"]})
            user_data.update({"following":users["following"]})
            user_data.update({"bot":users["bot"]})
            user_data.update({"users_influenced":users_influenced})
            user_data.update({"followers_influenced":followers_influenced})
            user_data.update({"followers_bot_influenced":followers_bot_influenced})
            user_data.update({"non_followers_influenced":non_followers_influenced})
            user_data.update({"non_followers_bot_influenced":non_followers_bot_influenced})
            user_data.update({"tweets":tweets_array})

            userTweets.append(user_data)

    for node in G:
        
        if G.nodes[node]['bot'] == True:

            if "retweet" in G.nodes[node]:

                if G.nodes[node]["retweet"]: colors.append("tomato")

                else: colors.append("crimson")
            
            else: colors.append("tomato")

        else: 

            if "retweet" in G.nodes[node]: 
                
                if G.nodes[node]["retweet"]: colors.append("lightskyblue")

                else: colors.append("royalblue")
            
            else: colors.append("lightskyblue")
    
    H = G.copy()

    for user_tuple, follower_tuple in array_followers:

        if not H.has_edge(user_tuple, follower_tuple):

            H.add_edge(user_tuple, follower_tuple, weight=1, edge_color="blueviolet")

    saveUsersGraph(G, colors, f"Graphs_Users_{sys.argv[1]}_{sys.argv[2]}.html")
    saveUsersGraph(H, colors, f"Graphs_Users_Followers_{sys.argv[1]}_{sys.argv[2]}.html")

    with open(f'Users_Influence_{sys.argv[1]}_{sys.argv[2]}.json', 'w') as fp:
        json.dump(userTweets, fp, indent=2)

    return userTweets

def saveUsersGraph(G, colors, filename):

    plot = Plot(plot_width=1260, plot_height=1024, x_range=Range1d(-1.1, 1.1), y_range=Range1d(-1.1, 1.1))
    
    plot.title.text = f"Graph Users {sys.argv[1]} {sys.argv[2]}"

    node_hover_tool = HoverTool(tooltips=[("user id", "@index"), ("bot", "@bot"), ("followers", "@followers"), ("following", "@following")])

    plot.add_tools(node_hover_tool, BoxZoomTool(), ResetTool(), WheelZoomTool())

    graph_renderer = from_networkx(G, nx.spring_layout, scale=1, center=(0, 0))

    graph_renderer.node_renderer.data_source.data['colors'] = colors
    graph_renderer.node_renderer.glyph = Circle(size=15, fill_color='colors')
    graph_renderer.edge_renderer.glyph = MultiLine(line_color="edge_color", line_alpha=0.8, line_width=1)
    plot.renderers.append(graph_renderer)

    output_file(filename, mode='inline')

    save(plot)

def fullUserInfluence(userTweets, data):
    
    for users in data:

        in_contact_users = 0

        retweet_users = []

        followers_user = set()

        in_contact_users = in_contact_users + int(users["followers"])

        for usersTweet in userTweets:

            if users["user_id"] == usersTweet["user_id"]:

                for tweets in users["tweets"]:

                    if tweets["retweet"] == False:

                        in_contact_users = in_contact_users + int(tweets["retweets_count"])
                        in_contact_users = in_contact_users + int(tweets["favorites_count"])

                        for retweets in tweets["retweets"]:

                            in_contact_users = in_contact_users + int(retweets["favorites"])

                            retweet_users.append(retweets["user_id"])
        
        for retweet_user in retweet_users:

            with open(os.path.join(path_to_followers, retweet_user+".json")) as json_file:

                json_text = json.load(json_file)

                for user in json_text["followers"]:

                    followers_user.add(user)

        in_contact_users = in_contact_users + len(followers_user)

        for usersTweet in userTweets:

            if users["user_id"] == usersTweet["user_id"]:

                usersTweet.update({"reached_users":in_contact_users})


    with open(f'Users_Influence_{sys.argv[1]}_{sys.argv[2]}.json', 'w') as fp:
        json.dump(userTweets, fp, indent=2)              

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print("saveRetweets...")
        profiles_ids = saveRetweets()
        print("saveNetworkFollowers...")
        saveNetworkFollowers(profiles_ids)
        print("saveNetworkFollowing...")
        saveNetworkFollowing(profiles_ids)
        print("loadIdsBots...")
        bot_accounts = loadIdsBots()
        print("connectBotsToUsers...")
        data = connectBotsToUsers(profiles_ids, bot_accounts)
        print("createTweetsGraph")
        createTweetsGraph(data)
        print("createUsersGraph")
        userTweets = createUsersGraph(profiles_ids, bot_accounts, data)
        print("fullUserInfluence...")
        fullUserInfluence(userTweets, data)
        print("Done...")
    else:
        print("No news id was given as a argument")
