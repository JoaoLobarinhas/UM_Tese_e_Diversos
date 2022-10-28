import networkx as nx
import sys
import datetime
import sys
from cdlib import algorithms, readwrite, NodeClustering, utils
from wurlitzer import pipes
import infomap as imp
import fileinput
from _collections import defaultdict

import community as community_louvain

def get_label_propagation(G):

    coms = algorithms.label_propagation(G)
    readwrite.write_community_csv(coms, f"/home/joaolobarinhasfm/Aux_Repo/Vulnerability-Metrics-master/label_propagation_{sys.argv[1]}.txt", ",")


def get_infoMap(G):

    coms = algorithms.infomap(G)
    readwrite.write_community_csv(coms, f"/home/joaolobarinhasfm/Aux_Repo/Vulnerability-Metrics-master/infomap_{sys.argv[1]}.txt", ",")

def get_louvain(G):

    g = utils.convert_graph_formats(G, nx.Graph)

    partition = community_louvain.best_partition(G)

    # Reshaping the results
    coms_to_node = defaultdict(list)
    for n, c in partition.items():
        coms_to_node[c].append(n)

    coms_louvain = [list(c) for c in coms_to_node.values()]
    coms = NodeClustering(coms_louvain, g, "Louvain",
                          method_parameters={"weight": "weight", "resolution": 1.,
                                             "randomize": False})
    
    readwrite.write_community_csv(coms, f"/home/joaolobarinhasfm/Aux_Repo/Vulnerability-Metrics-master/louvain_{sys.argv[1]}.txt", ",")

if __name__=="__main__":
    if len(sys.argv)!=2:
        print ("Usage: detect_communities <inputfile> <outputfile>")
        print ("Inputfile : Contains represenation of the graph")
        print ("ID : Files identication")
        exit(-1)

    with fileinput.FileInput(f"network_{sys.argv[1]}.txt", inplace=True) as file:
        for line in file:
            print(line.replace(",", "\t"), end='')

    start_program = datetime.datetime.now()
    start_date = datetime.datetime.now()
    print("Start Louvain Best Partition: "+str(start_date))
    G = nx.read_edgelist(f"network_{sys.argv[1]}.txt")
    get_louvain(G)
    end_date = datetime.datetime.now()
    print("Ended Louvain Best Partition: "+str(end_date))
    print("Louvain Best Partition Duration: "+str((end_date - start_date).total_seconds()))
    start_date = datetime.datetime.now()
    print("Start Label Propagation: "+str(start_date))
    get_label_propagation(G)
    end_date = datetime.datetime.now()
    print("Ended Label Propagation: "+str(end_date))
    print("Label Propagation Duration: "+str((end_date - start_date).total_seconds()))
    start_date = datetime.datetime.now()
    print("Start Infomap: "+str(start_date))
    get_infoMap(G)
    end_date = datetime.datetime.now()
    print("Ended Infomap: "+str(end_date))
    print("Infomap Duration: "+str((end_date - start_date).total_seconds()))
    print("Program Duration: "+str((end_date - start_program).total_seconds()))
    
