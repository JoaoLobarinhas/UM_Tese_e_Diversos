import os, json, sys
import re
from numpy import mean
import datetime

path_to_files = "results_botometer/"

data_of_process = {}

json_scores = [pos_json for pos_json in os.listdir(path_to_files) if pos_json.endswith('.json')]

writerMetrics = open(f'Botometer_Metrics_{sys.argv[1]}.txt', 'w')
writerMetrics.write("Metrics for: "+str(sys.argv[1])+"\n")
writerMetrics.write("Started at: "+str(datetime.datetime.now())+"\n")
writerMetrics.write("Number of spreaders: "+str(len(json_scores))+"\n")

retweet_file = ''.join(['retweets_', sys.argv[1], '.txt'])
s_spreaders = set()
with open(retweet_file) as infile:
    for line in infile:
        l_spl = re.split(r'[,]', line.rstrip())
        s_spreaders.add(l_spl[1])

def avgCAP():

    aux_avg = []
    aux_echo_chamber = []
    aux_fake_followers = []
    aux_spammer = []
    aux_financial = []
    bot_accounts = []
    self_declared_bots = []
    echo_chamber_bots = []
    fake_followers_bots = []
    spammer_bots = []
    financial_bots = []

    for score in json_scores:
        with open(os.path.join(path_to_files, score)) as json_file:
            json_text = json.load(json_file)

            if not json_text.get('error'):

                aux_avg.append(float(json_text['cap']['universal']))
                aux_echo_chamber.append(float(json_text['raw_scores']['universal']['astroturf']))
                aux_fake_followers.append(float(json_text['raw_scores']['universal']['fake_follower']))
                aux_spammer.append(float(json_text['raw_scores']['universal']['spammer']))
                aux_financial.append(float(json_text['raw_scores']['universal']['financial']))

                if float(json_text['cap']['universal']) > 0.96:
                    bot_accounts.append(json_text['user']['user_data']['id_str'])

                    if float(json_text['raw_scores']['universal']['self_declared']) > 0.96:
                        self_declared_bots.append(json_text['user']['user_data']['id_str'])
                
                if float(json_text['raw_scores']['universal']['astroturf']) > 0.9:
                    echo_chamber_bots.append(json_text['user']['user_data']['id_str'])
                    
                if float(json_text['raw_scores']['universal']['fake_follower']) > 0.9:
                    fake_followers_bots.append(json_text['user']['user_data']['id_str'])
                    
                if float(json_text['raw_scores']['universal']['spammer']) > 0.9:
                    spammer_bots.append(json_text['user']['user_data']['id_str'])

                if float(json_text['raw_scores']['universal']['financial']) > 0.9:
                    financial_bots.append(json_text['user']['user_data']['id_str'])
    
    avg_cap_score = mean(aux_avg)
    avg_echo_chamber = mean(aux_echo_chamber)
    avg_fake_followers = mean(aux_fake_followers)
    avg_spammer = mean(aux_spammer)
    avg_financial = mean(aux_financial)

    writerMetrics.write("Average CAP score: "+str(round(avg_cap_score,5))+"\n")
    writerMetrics.write("Average echo chamber score: "+str(round(avg_echo_chamber,5))+"\n")
    writerMetrics.write("Average fake followers score: "+str(round(avg_fake_followers,5))+"\n")
    writerMetrics.write("Average spammer score: "+str(round(avg_spammer,5))+"\n")
    writerMetrics.write("Average financial score: "+str(round(avg_financial,5))+"\n")

    data_of_process.update({"avg_cap_score":avg_cap_score})
    data_of_process.update({"avg_echo_chamber":avg_echo_chamber})
    data_of_process.update({"avg_spammer":avg_spammer})
    data_of_process.update({"avg_fake_followers":avg_fake_followers})
    data_of_process.update({"avg_financial":avg_financial})

    bots_dict = {}

    raw_number_bots = len(bot_accounts)

    if raw_number_bots > 0:

        raw_bots_dict = {}

        min_number_bots = raw_number_bots*0.9
        number_bots = raw_number_bots*0.95

        writerMetrics.write("\n")
        writerMetrics.write("Bot Accounts Stats: \n")
        writerMetrics.write("Raw number of bot accounts: "+str(raw_number_bots)+"\n")
        writerMetrics.write("Min. number of bot accounts: "+str(min_number_bots)+"\n")
        writerMetrics.write("Number of bot accounts: "+str(number_bots)+"\n")

        raw_bots_dict.update({"raw_number_bots":raw_number_bots})
        raw_bots_dict.update({"min_number_bots":min_number_bots})
        raw_bots_dict.update({"number_bots":number_bots})

        writerMetrics.write("Twitter Ids of bot accounts:\n")
        for bots in bot_accounts:
            writerMetrics.write(f"\t -> {bots}\n")
        
        raw_bots_dict.update({"bot_accounts":bot_accounts})

        bots_dict.update({"raw_bots":raw_bots_dict})

        if len(self_declared_bots) > 0:

            self_declared_bots_dict = {}

            writerMetrics.write("Number of self declared bot accounts: "+str(len(self_declared_bots))+"\n")
            
            self_declared_bots_dict.update({"self_declared_bots":len(self_declared_bots)})

            bots_not_declared = [ bots for bots in bot_accounts if bots not in self_declared_bots]

            writerMetrics.write("Twitter Ids of self delcared bot accounts:\n")
            for bots in self_declared_bots:
                writerMetrics.write(f"\t -> {bots}\n")
            
            self_declared_bots_dict.update({"self_daclared_bots":self_declared_bots})

            if len(bots_not_declared) > 0:

                raw_not_declared_bots = len(bots_not_declared)
                min_not_declared_bots = raw_not_declared_bots*0.9
                not_declared_bots = raw_not_declared_bots*0.95

                writerMetrics.write("Raw number of not declared bot accounts: "+str(raw_not_declared_bots)+"\n")
                writerMetrics.write("Min. number of not declared bot accounts: "+str(min_not_declared_bots)+"\n")
                writerMetrics.write("Number of not declared bot accounts: "+str(not_declared_bots)+"\n")

                self_declared_bots_dict.update({"raw_not_declared_bots":raw_not_declared_bots})
                self_declared_bots_dict.update({"min_not_declared_bots":min_not_declared_bots})
                self_declared_bots_dict.update({"not_declared_bots":not_declared_bots})

                writerMetrics.write("Twitter Ids of not delcared bot accounts:\n")
                for bots in bots_not_declared:
                    writerMetrics.write(f"\t -> {bots}\n")
                
                self_declared_bots_dict.update({"bots_not_declared":bots_not_declared})
                bots_dict.update({"self_declared_bots":self_declared_bots_dict})

            else: writerMetrics.write("No self declared bot were detected\n")
        
        data_of_process.update({"bots_data":bots_dict})
        
    if len(echo_chamber_bots) > 0:
            
        echo_chamber_dict = writeStatsOfBots("echo_chamber", echo_chamber_bots)
        data_of_process.update({"echo_chamber":echo_chamber_dict})
        
    if len(fake_followers_bots) > 0:

        fake_followers_dict = writeStatsOfBots("fake_followers", fake_followers_bots)
        data_of_process.update({"fake_followers":fake_followers_dict})
        
    if len(spammer_bots) > 0:

        spammer_bots_dict = writeStatsOfBots("spammer", spammer_bots)
        data_of_process.update({"spammer_bots":spammer_bots_dict})

    if len(financial_bots) > 0:

        financial_bots_dict = writeStatsOfBots("financial", financial_bots)
        data_of_process.update({"financial_bots":financial_bots_dict})
        


def read_cd_file(cd_file):
    print('Reading communities from ', cd_file)
    clusters = {}
    with open(cd_file) as infile:
        i = 0
        for line in infile:
            l_spl = re.split(r'[,]', line.rstrip())
            node_set = set(l_spl)
            clusters[i] = node_set
            i+=1
    
    return clusters


def scoresForCommunity(clusters):

    writerMetrics.write(f"Number of communities: {len(clusters.keys())}\n")
    print('No. of clusters:', len(clusters.keys()))
    
    aux_dicts = []

    for index, cl in enumerate(clusters):

        aux_avg = []
        aux_echo_chamber = []
        aux_fake_followers = []
        aux_spammer = []
        aux_financial = []
        aux_bot_accounts = []

        stats_dict = {}

        echo_chamber_bots = []
        fake_followers_bots = []
        spammer_bots = []
        financial_bots = []
        self_declared_bots = []

        writerMetrics.write(f"Community: {index}\n")
        cluster_ = set(clusters[cl])
        writerMetrics.write(f"\t Users in community: {len(cluster_)}\n")
        infected_accounts = s_spreaders.intersection(cluster_)
        writerMetrics.write(f"\t Spreaders in community: {len(infected_accounts)}\n")

        stats_dict.update({"community":index})
        stats_dict.update({"users_in_community":len(cluster_)})
        stats_dict.update({"spreaders_in_community":len(infected_accounts)})

        for score in infected_accounts:
            with open(os.path.join(path_to_files, score+'.json')) as json_file:
                json_text = json.load(json_file)

                if not json_text.get('error'):

                    aux_avg.append(float(json_text['cap']['universal']))
                    aux_echo_chamber.append(float(json_text['raw_scores']['universal']['astroturf']))
                    aux_fake_followers.append(float(json_text['raw_scores']['universal']['fake_follower']))
                    aux_spammer.append(float(json_text['raw_scores']['universal']['spammer']))
                    aux_financial.append(float(json_text['raw_scores']['universal']['financial']))

                    if float(json_text['cap']['universal']) > 0.96:
                        aux_bot_accounts.append(json_text['user']['user_data']['id_str'])
                        if float(json_text['raw_scores']['universal']['self_declared']) > 0.96:
                            self_declared_bots.append(json_text['user']['user_data']['id_str'])
                    
                    if float(json_text['raw_scores']['universal']['astroturf']) > 0.9:
                        echo_chamber_bots.append(json_text['user']['user_data']['id_str'])
                    
                    if float(json_text['raw_scores']['universal']['fake_follower']) > 0.9:
                        fake_followers_bots.append(json_text['user']['user_data']['id_str'])
                    
                    if float(json_text['raw_scores']['universal']['spammer']) > 0.9:
                        spammer_bots.append(json_text['user']['user_data']['id_str'])

                    if float(json_text['raw_scores']['universal']['financial']) > 0.9:
                        financial_bots.append(json_text['user']['user_data']['id_str'])

        avg_cap_score = mean(aux_avg)
        avg_echo_chamber = mean(aux_echo_chamber)
        avg_fake_followers = mean(aux_fake_followers)
        avg_spammer = mean(aux_spammer)
        avg_financial = mean(aux_financial)
        
        writerMetrics.write("\t Average CAP score: "+str(round(avg_cap_score,5))+"\n")
        writerMetrics.write("\t Average echo chamber score: "+str(round(avg_echo_chamber,5))+"\n")
        writerMetrics.write("\t Average fake followers score: "+str(round(avg_fake_followers,5))+"\n")
        writerMetrics.write("\t Average spammer score: "+str(round(avg_spammer,5))+"\n")
        writerMetrics.write("\t Average financial score: "+str(round(avg_financial,5))+"\n")
        
        if len(aux_avg) > 0 :
            stats_dict.update({"avg_cap_score":avg_cap_score})
        if len(aux_echo_chamber) > 0 :
            stats_dict.update({"avg_echo_chamber":avg_echo_chamber})
        if len(aux_fake_followers) > 0 :
            stats_dict.update({"avg_fake_followers":avg_fake_followers})
        if len(aux_spammer) > 0:
            stats_dict.update({"avg_spammer":avg_spammer})
        if len(aux_financial) > 0:
            stats_dict.update({"avg_financial":avg_financial})

        bots_dict = {}


        if len(aux_bot_accounts) > 0:

            bots_dict = writeStatsOfBots("bots", aux_bot_accounts)
            stats_dict.update({"raw_bots":bots_dict})
            
            if len(self_declared_bots) > 0:

                self_declared_bots_dict = {}

                writerMetrics.write("\t Number of self declared bot accounts: "+str(len(self_declared_bots))+"\n")
                self_declared_bots_dict.update({"self_declared_bots":len(self_declared_bots)})
                bots_not_declared = [ bots for bots in aux_bot_accounts if bots not in self_declared_bots]

                writerMetrics.write("\t Twitter Ids of self delcared bot accounts:\n")
                for bots in self_declared_bots:
                    writerMetrics.write(f"\t -> {bots}\n")
                
                self_declared_bots_dict.update({"self_declared_bots":self_declared_bots})

                if len(bots_not_declared) > 0:
                    
                    raw_not_declared_bots = len(bots_not_declared)
                    min_not_declared_bots = raw_not_declared_bots*0.9
                    not_declared_bots = raw_not_declared_bots*0.95

                    writerMetrics.write("\t Raw number of not declared bot accounts: "+str(raw_not_declared_bots)+"\n")
                    writerMetrics.write("\t Min. number of not declared bot accounts: "+str(min_not_declared_bots)+"\n")
                    writerMetrics.write("\t Number of not declared bot accounts: "+str(not_declared_bots)+"\n")

                    self_declared_bots_dict.update({"raw_not_declared_bots":raw_not_declared_bots})
                    self_declared_bots_dict.update({"min_not_declared_bots":min_not_declared_bots})
                    self_declared_bots_dict.update({"not_declared_bots":not_declared_bots})

                    writerMetrics.write("\t Twitter Ids of not delcared bot accounts:\n")
                    for bots in bots_not_declared:
                        writerMetrics.write(f"\t\t -> {bots}\n")
                    
                    self_declared_bots_dict.update({"bots_not_declared":bots_not_declared})
                    stats_dict.update({"self_declared_bots":self_declared_bots_dict})
                    
            else: writerMetrics.write("\t No self declared bot were detected\n")
        
        if len(echo_chamber_bots) > 0:
            
            echo_chamber_dict = writeStatsOfBots("echo_chamber", echo_chamber_bots)
            stats_dict.update({"echo_chamber":echo_chamber_dict})
        
        if len(fake_followers_bots) > 0:

            fake_followers_dict = writeStatsOfBots("fake_followers", fake_followers_bots)
            stats_dict.update({"fake_followers":fake_followers_dict})
        
        if len(spammer_bots) > 0:

            spammer_bots_dict = writeStatsOfBots("spammer", spammer_bots)
            stats_dict.update({"spammer_bots":spammer_bots_dict})

        if len(financial_bots) > 0:

            financial_bots_dict = writeStatsOfBots("financial", financial_bots)
            stats_dict.update({"financial_bots":financial_bots_dict})

        aux_dicts.append(stats_dict)
    
    return aux_dicts

def writeStatsOfBots (typeData, dataArray):

    bots_dict = {}

    raw_data = len(dataArray)
    min_data = len(dataArray)*0.9
    number_data = len(dataArray)*0.95

    writerMetrics.write("\n")
    writerMetrics.write(f"\t {typeData} Stats: \n")
    writerMetrics.write(f"\t Raw number of {typeData} accounts: "+str(raw_data)+"\n")
    writerMetrics.write(f"\t Min. number of {typeData} accounts: "+str(min_data)+"\n")
    writerMetrics.write(f"\t Number of {typeData} accounts: "+str(number_data)+"\n")

    bots_dict.update({f"raw_{typeData}":raw_data})
    bots_dict.update({f"min_{typeData}":min_data})
    bots_dict.update({f"number_{typeData}":number_data})

    writerMetrics.write(f"\t Twitter Ids of {typeData} accounts:\n")
    for bots in dataArray:
        writerMetrics.write(f"\t\t -> {bots}\n")
            
    bots_dict.update({f"{typeData}_bots":dataArray})

    return bots_dict

if __name__=="__main__":
    print("Strated avgCap: "+str(datetime.datetime.now()))
    avgCAP()
    print("Ended Avg cap: "+str(datetime.datetime.now()))
    cd_list = ['louvain_', 'infomap_', 'label_propagation_']
    for cd in cd_list:
        writerMetrics.write("\n")
        writerMetrics.write(f"Bot Accounts Stats for {cd}: \n")
        cd_file = cd+str(sys.argv[1])+'.txt'
        print(cd+" started: "+str(datetime.datetime.now()))
        clusters = read_cd_file(cd_file)
        statsOfCommunity = scoresForCommunity(clusters)
        data_of_process.update({f"Stats_of_{cd}":statsOfCommunity})
    
    with open(f'Stats_of_{sys.argv[1]}.json', 'w') as fp:
        json.dump(data_of_process, fp, indent=2)
    
    print("Done... "+str(datetime.datetime.now()))