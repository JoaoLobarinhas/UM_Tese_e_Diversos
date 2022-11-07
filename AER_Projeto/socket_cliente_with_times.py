import time
import struct
import socket
import sys
import multiprocessing
import threading
import signal
import pickle
import time
import os
from concurrent.futures import ThreadPoolExecutor
from enum import Enum

MYTTL = 1
group = "FF02::1"
MYPORT = 9999
lifeSpan = 180
send_interval = 0.5
_timeBroadcast = 60
_jumps = 4
_max_Workers = 25

# Esta class serve para armazenar os dados como se fossem 
# entradas numa tabela
class Row:

    def __init__(self, name, neighbor, ipNeighbor, life):
        self.name = name
        self.neighbor = neighbor
        self.ipNeighbor = ipNeighbor
        self.life = life

class PassThroughObj:

    def __init__(self,ipv6,name):
        self.ipv6 = ipv6
        self.name = name

class Broadcast:

    def __init__(self, sender, message, lastPass):
        self.sender = sender
        self.passThrough = []
        self.message = message
        self.jumpsLeft = _jumps
        self.lastPass = lastPass
        self.lifeSpan = int(time.time())+_timeBroadcast

# Classe que armazena a informação de um incidente no transito
class InfoTransito:

    def __init__(self, lat, longi, info, state, destiny):
        self.lat = lat
        self.longi = longi
        self.info = info
        self.state = state
        self.origen =  None
        self.destiny = destiny
        self.date = time.time()

class NdnInfo:

     def __init__(self,lat,longi):
        self.lat = lat
        self.longi = longi

# Este enum existe para reduzir as redundancias, para ser mais facil
# compreender o codigo e para reduzir o espaço ocupado no array
class Flags(Enum):
    hello = 0
    route_request = 1
    route_request_backwards = 2
    get_info = 3
    resp_get_info = 4
    put_info = 5
    ndn_get_info = 6
    ndn_resp_get_info = 7

def sender(closeProcess, routingTabel):
    # Esta variavel é utiliza para trocar entre os diferentes protocolos
    # Que vão ser enviados
    switchBetweenProt = True

    addrinfo = socket.getaddrinfo(group, None)[0]

    #s = socket.socket(addrinfo[0], socket.SOCK_DGRAM)
    s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

    # --- set TTL
    ttl_bin = struct.pack('@i', MYTTL)
    s.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_MULTICAST_HOPS, ttl_bin)

    # get ipv6 of socket
    _ipv6 = socket.getaddrinfo(socket.gethostname(),MYPORT,socket.AF_INET6)
    _ipv6 = _ipv6[0][4][0]

    while not closeProcess.is_set():

        if(switchBetweenProt):
            # tabel_with_flag associa uma flag a tabela, essa flag é
            # definida pela class Flags, de forma a que quando os dados
            # forem recebidos o recvfrom possa reconhecer que tipo de request
            # foi feito. Neste caso é associada a Flags.Hello que indica que foi
            # apenas feito um hello a socket
            flag_with_table = [Flags.hello,routingTabel,socket.gethostname()]
            # Pickle é utilizado para se poder enviar o objeto
            data = pickle.dumps(flag_with_table)
            s.sendto(data, (addrinfo[4][0], MYPORT))
            switchBetweenProt = False
        else:
            broadcastMSG = Broadcast(_ipv6,"Hello I'm from Broadcast", _ipv6)
            broadcastMSG.passThrough.append(PassThroughObj(_ipv6,socket.gethostname()))
            flag_with_table = [Flags.route_request,broadcastMSG,socket.gethostname()]
            data = pickle.dumps(flag_with_table)
            s.sendto(data, (addrinfo[4][0], MYPORT))
            switchBetweenProt = True

        time.sleep(send_interval)

def sender_RR(broadcast, flag):

    addrinfo = socket.getaddrinfo(group, None)[0]

    s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

    # --- set TTL
    ttl_bin = struct.pack('@i', MYTTL)
    s.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_MULTICAST_HOPS, ttl_bin)
    
    flag_with_table = [flag,broadcast]
    
    data = pickle.dumps(flag_with_table)
    s.sendto(data, (addrinfo[4][0], MYPORT))

def receiver_tcp(closeProcess, messagesRecieved, lock_messages):

    s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    s.bind(('localhost',MYPORT))
    s.listen(1)

    # get ipv6 of socket
    _ipv6 = socket.getaddrinfo(socket.gethostname(),MYPORT,socket.AF_INET6)
    _ipv6 = _ipv6[0][4][0]

    # Impedir que em momentos em que o objecto routing table seja
    # rescrito acontençam problemas de "race"
    _lock = threading.RLock()

    with ThreadPoolExecutor(max_workers=_max_Workers) as executer:
        while not closeProcess.is_set():
            conn, addr = s.accept()
            future = []
            future.append(executer.submit(receiver_tcp_aux,conn,_ipv6,executer,_lock,socket.gethostname(),messagesRecieved, lock_messages))
    s.close()

# convem usar threads para a receção dos dados, porque é diferente
# a receção por udp. Esta função serve só como aux
def receiver_tcp_aux(conn, _ipv6, executer, lock, name, messagesRecieved, lock_messages):
    while True:
        future = []
        data = conn.recv(4096)
        if not data:break
        data = pickle.loads(data)

        if data[0] == Flags.resp_get_info or data[0] == Flags.ndn_resp_get_info:
            future.append(executer.submit(append_Info_Received,messagesRecieved,data[1],lock,lock_messages))    
        else:
            broadcastMSG = Broadcast(_ipv6,data[1],_ipv6)
            broadcastMSG.passThrough.append(PassThroughObj(_ipv6,name))
            future.append(executer.submit(sender_RR,broadcastMSG,data[0]))

    conn.close()

def append_Info_Received(messagesRecieved, info, lock, lock_messages):
    # Isto devia ser feito de melhor forma, mas não me está a aptecer muito fazer isto em condições
    lock_messages.acquire()
    with lock:
        for i in range(len(info) -1,-1,-1):
            notExist = True
            for x in range(len(messagesRecieved) -1,-1,-1):
                if(info[i].lat == messagesRecieved[x].lat and info[i].longi == messagesRecieved[x].longi and info[i].info == messagesRecieved[x].info
                and info[i].origen == messagesRecieved[x].origen and info[i].destiny == messagesRecieved[x].destiny and info[i].date == messagesRecieved[x].date):
                    notExist=False
            if notExist:
                messagesRecieved.append(info[i])
    lock_messages.release()

def send_msg_tcp(flag, infos, lock_messages=None):
    
    s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    s.connect(('localhost',MYPORT))

    if flag is Flags.put_info:
        infos.origen = socket.gethostname()
        put_info(messagesRecieved,infos,lock_messages)
    
    flag_with_table = [flag,infos]
    data = pickle.dumps(flag_with_table)

    s.send(data)
    s.close()

def update_RT_Broadcast(routingTabel, data, lock):
    with lock:
        for i in range(len(data) -1,-1,-1):
            if(i>0):
                notExist = True
                for x in range(len(routingTabel) -1,-1,-1):
                    if(data[i-1].ipv6 == routingTabel[x].ipNeighbor and data[i-1].name == routingTabel[x].neighbor and data[i].name == routingTabel[x].name):
                        routingTabel[x].life = int(time.time())
                        notExist=False
                if notExist:
                    routingTabel.append(Row(data[i].name,data[i-1].name,data[i-1].ipv6,int(time.time())))

def update_RT(routingTabel, data, name, ipsender, lock):
    # Thread lock, para apenas uma thread de cada vez aceder a isto
    with lock:
        # Se houver registos
        if len(routingTabel)>0:
            for row in data:
                notExist = True
                # Verifica se os vizinhos recebidos são de n1 do sender
                if row.name != row.neighbor:
                    notExist = False
                else:
                    notN1Exist = True
                    for i in range(len(routingTabel) -1,-1,-1):
                        # Verifica se já existe o registo recebido por aquele vizinho
                        if routingTabel[i].name == row.name:
                            if routingTabel[i].neighbor == name and routingTabel[i].ipNeighbor == ipsender:
                                notExist = False
                                routingTabel[i].life = int(time.time())
                        # Apenas em caso de não haver registos ou se for um vizinho de nivel 1
                        if routingTabel[i].name == name and routingTabel[i].neighbor == name and routingTabel[i].ipNeighbor == ipsender:
                            notN1Exist = False
                            routingTabel[i].life = int(time.time())
                    if notN1Exist == True:
                        notExist = False
                        routingTabel.append(Row(name,name,ipsender,int(time.time())))
                if notExist == True:
                    routingTabel.append(Row(row.name,name,ipsender,int(time.time())))
        # Se não existirem registos
        elif len(routingTabel) == 0:
            routingTabel.append(Row(name,name,ipsender,int(time.time())))

def update_delete_RT(routingTabel, lock):
    with lock:
        for i in range(len(routingTabel) -1,-1,-1):
            if routingTabel[i].life+lifeSpan < int(time.time()):
                del routingTabel[i]

def check_info_NDN(messagesRecieved,info):
    resp = []
    for msg in messagesRecieved:
        if msg.lat == info.message.lat and msg.longi == info.message.longi:
            resp.append(msg)

    # se a lista não estiver vazia
    if resp:
        sender_RR(info,Flags.ndn_get_info)
        info.message = resp
        info.jumpsLeft = _jumps - int(info.jumpsLeft)
        sender_RR(info, Flags.ndn_resp_get_info)
    else:
        sender_RR(info,Flags.ndn_get_info)

def receiver(closeProcess, routingTabel, messagesRecieved, lock_messages):

    # --- look for multicast group address and find ip vers
    addrinfo = socket.getaddrinfo(group, None)[0]

    # --- create socket
    s = socket.socket(socket.AF_INET6,socket.SOCK_DGRAM,socket.IPPROTO_UDP)

    # --- bind to MYPORT
    s.bind(('', MYPORT))

    group_bin = socket.inet_pton(addrinfo[0], addrinfo[4][0])
    
    # --- join group
    mreq = group_bin + struct.pack('@I', 0)

    # get ipv6 of socket
    _ipv6 = socket.getaddrinfo(socket.gethostname(),MYPORT,socket.AF_INET6)
    _ipv6 = _ipv6[0][4][0]

    # Sinceramente isto devia ser utilizado enves do _ipv6
    # E utilizado nos requests do cliente
    _name = socket.gethostname()

    s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEPORT, 1)
    s.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_JOIN_GROUP, mreq)

    # Impedir que em momentos em que o objecto routing table seja
    # rescrito acontençam problemas de "race"
    _lock = threading.RLock()
    _lockInfos = threading.Lock()

    #Tentativa de reduzir o número de threads
    _time = int(time.time())

    # --- print received data
    with ThreadPoolExecutor(max_workers=_max_Workers) as executer:
        while not closeProcess.is_set():
            future = []
            data, sender = s.recvfrom(4096)
            while data[-1:] == '\0': data = data[:-1] # --- remove data trailing
            data = pickle.loads(data)
            #Elimina dados da Routing Table
            if(_time+lifeSpan < int(time.time())):
                _time = int(time.time())
                future.append(executer.submit(update_delete_RT,routingTabel,_lock))
            #Obter o ip do sender
            sender = sender[0].split("%")
            sender = sender[0]
            # A lock impede que o objecto seja escrito por mais alguem
            if data[0] is Flags.hello:
                if(sender != _ipv6):
                    # Obtem o nome do sender
                    name = data[2]
                    future.append(executer.submit(update_RT,routingTabel,data[1],name,sender,_lock))
            elif data[0] is Flags.route_request:
                if(data[1].lifeSpan >= int(time.time())):
                    # Se uma socket recebe o pacote que acabou de enviar, não envia mais
                    if(data[1].lastPass != _ipv6):
                        data[1].lastPass = _ipv6
                        data[1].jumpsLeft = data[1].jumpsLeft-1
                        data[1].passThrough.append(PassThroughObj(_ipv6,socket.gethostname()))
                        if(data[1].jumpsLeft > 0):
                            future.append(executer.submit(sender_RR,data[1],Flags.route_request))
                        else:
                            data[1].jumpsLeft = _jumps
                            future.append(executer.submit(sender_RR,data[1],Flags.route_request_backwards))
            elif data[0] is Flags.route_request_backwards:
                if(data[1].lifeSpan >= int(time.time())):
                    data[1].jumpsLeft = data[1].jumpsLeft-1
                    if(data[1].sender == _ipv6 and data[1].passThrough[data[1].jumpsLeft].ipv6 == _ipv6):
                        future.append(executer.submit(update_RT_Broadcast,routingTabel,data[1].passThrough,_lock))
                    elif(data[1].passThrough[data[1].jumpsLeft].ipv6 == _ipv6 and data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].lastPass = _ipv6
                        future.append(executer.submit(sender_RR,data[1],Flags.route_request_backwards))
            elif data[0] is Flags.get_info:
                if(data[1].lifeSpan >= int(time.time())):
                    if(data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].jumpsLeft = data[1].jumpsLeft-1
                        data[1].lastPass = _ipv6
                        future.append(executer.submit(sender_RR,data[1],Flags.get_info))
            elif data[0] is Flags.put_info:
                if(data[1].lifeSpan >= int(time.time())):
                    if(data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].jumpsLeft = data[1].jumpsLeft-1
                        data[1].lastPass = _ipv6
                        future.append(executer.submit(sender_RR,data[1],Flags.put_info))
            elif data[0] is Flags.resp_get_info:
                if(data[1].lifeSpan >= int(time.time())):
                    # message é um objecto do tipo infoTransito
                    if(data[1].sender == _ipv6):
                        future.append(executer.submit(send_msg_tcp,Flags.resp_get_info,data[1].message))
                    elif(data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].jumpsLeft = data[1].jumpsLeft-1
                        data[1].lastPass = _ipv6
                        future.append(executer.submit(sender_RR,data[1],Flags.resp_get_info))
            elif data[0] is Flags.ndn_get_info:
                if(data[1].lifeSpan >= int(time.time())):
                    if(data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].jumpsLeft = data[1].jumpsLeft-1
                        data[1].passThrough.append(PassThroughObj(_ipv6,socket.gethostname()))
                        future.append(executer.submit(check_info_NDN,messagesRecieved,data[1]))
            elif data[0] is Flags.ndn_resp_get_info:
                if(data[1].lifeSpan >= int(time.time())):
                    data[1].jumpsLeft = data[1].jumpsLeft-1
                    if(data[1].sender == _ipv6 and data[1].passThrough[data[1].jumpsLeft].ipv6 == _ipv6):
                        future.append(executer.submit(send_msg_tcp,Flags.ndn_resp_get_info,data[1].message))
                    elif(data[1].passThrough[data[1].jumpsLeft].ipv6 == _ipv6 and data[1].lastPass != _ipv6 and data[1].jumpsLeft > 0):
                        data[1].lastPass = _ipv6
                        future.append(executer.submit(sender_RR,data[1],Flags.ndn_resp_get_info))

def list_RT(routingTabel):
    #Lista a routing tabel
    print(" ___________________________________________ ")
    print("|  Name  |  Neighbor  |    Ip of Neighbor   |")
    print(" ___________________________________________ ")
    for row in routingTabel:
        print(str("|   "+row.name)+"   |     "+str(row.neighbor)+"    |  "+str(row.ipNeighbor)+" |")
        print(" ___________________________________________ ")

def put_info(messagesRecieved, data, lock):
    lock.acquire()
    messagesRecieved.append(data)
    lock.release()

def list_Infos(messagesRecieved):
    # Lista infos
    # A formatação está broken
    print(" _________________________________________________________________________ ")
    print("|  Lat  |  Long  |       Info      |   State   |   Origen   |   Destiny   |")
    print(" _________________________________________________________________________ ")
    for row in messagesRecieved:
        print(str("|   "+row.lat)+"   |    "+str(row.longi)+"   |  "+str(row.info)+"   |   "+str(row.state)+"   |   "+str(row.origen)+"   |   "+str(row.destiny)+" |")
        print(" _________________________________________________________________________ ")

def interface(closeProcess, routingTabel, messagesRecieved, lock_messages):

    menu = {}
    menu['1'] = "- Listar Routing Table"
    menu['2'] = "- Enviar Informação de Transito"
    menu['3'] = "- Obter Informação de Transito"
    menu['4'] = "- Listar Informação de Transito"
    menu['5'] = "- Obter Informação de Transito por NDN"
    menu['6'] = "- Limpar"
    menu['ctrl+c'] = "- Fechar o programa"

    while True:
        options = menu.keys()
        print("----------- Escolha uma Opção -----------")
        for entry in options:
            print(entry, menu[entry])
        opcao = input("Opção: ")
        if(opcao == "1"):
            list_RT(routingTabel)
        elif(opcao == "2"):
            print("----------- Informação de Transito -----------")
            print(">> Coordenadas")
            lat = input("Latitude: ")
            longi = input("Longitude: ")
            print(">> Outras infos")
            info = input("Mensagem: ")
            state = input("Estado: ")
            destiny = input("Servidor Destino: ")
            print(">> A enviar mensagem...")
            send_msg_tcp(Flags.put_info,InfoTransito(lat,longi,info,state,destiny),lock_messages)
            print(">> Mensagem enviada...")
        elif(opcao == "3"):
            print("----------- Pedir Informação de Transito -----------")
            destiny = input("Servidor Destino: ")
            print(">> A obter informação de transito ...")
            send_msg_tcp(Flags.get_info,destiny)
            print("* Pode demorar alguns segundos a receber a informação *")
        elif(opcao == "4"):
            list_Infos(messagesRecieved)
        elif(opcao == "5"):
            print("----------- Pedir Informação de Transito por NDN -----------")
            print(">> Coordenadas")
            lat = input("Latitude: ")
            longi = input("Longitude: ")
            send_msg_tcp(Flags.ndn_get_info,NdnInfo(lat,longi))
        elif(opcao == "6"):
            os.system("clear")
        else:
            print("Opcão invalida")

    closeProcess.set()
                
    time.sleep(1)

    sys.exit(0)

if __name__ == "__main__":
 
    # Define uma authkey para todos os processos, ela está aqui porque de
    # outra forma sempre que era iniciado um programa diferente era gerada uma key diferente
    # Até aqui não há problema só que ao enviar a tabela como o objeto enviado é uma
    # multiprocessing.Manager().list([]) este objecto é protegido pela key, e como a key seria
    # diferente de um processo para o outro e para aceder ao objecto ela é obtida utilizando
    # multiprocessing.current_process().authkey
    multiprocessing.current_process().authkey = b'12345'

    # Define um evento que indica o processo para fechar,
    # basicamente em vez de nos processo ter o while True
    # tem while not closeProcess.is_set() assim que ele for True, aka
    # o evento é definido, processo fecha de forma correta 
    closeProcess = multiprocessing.Event()

    # Esta lock existe dado que tanto o processo "mãe" como o processo "filho"
    # pReceiver partilham o obejcto messagesRecieved, então ele está aqui para
    # evitar problemas de race 
    lock_messages = multiprocessing.Lock()

    # Objecto partilhado entre os dois processos
    # Isto é feito para que o objecto enviado seja o mesmo que é
    # Atualizado quando recebe uma mensagem
    routingTabel = multiprocessing.Manager().list([])
    messagesRecieved = multiprocessing.Manager().list([])

    # Set processes
    pReceiverTCP = multiprocessing.Process(target=receiver_tcp, args=[closeProcess,messagesRecieved,lock_messages])
    pSender = multiprocessing.Process(target=sender, args=[closeProcess,routingTabel])
    pReceiver = multiprocessing.Process(target=receiver, args=[closeProcess,routingTabel,messagesRecieved,lock_messages])

    # O handler para fechar o programa,
    # o crtl+c estava a dar-me problemas no sentido em que
    # não fazia o que eu queria por isso modifiquei o signal
    def close_handler(signal, frame):
        print("Closing the program...")

        closeProcess.set()
            
        time.sleep(1)

        sys.exit(0)
    
    signal.signal(signal.SIGINT , close_handler)

    # Running Processes
    pReceiverTCP.start()
    pSender.start()
    pReceiver.start()

    interface(closeProcess,routingTabel,messagesRecieved,lock_messages)
    
    # Wait for processes to finish, this should never happen
    # but it's here just in case
    pReceiverTCP.join()
    pSender.join()
    pReceiver.join()

    


    

            


    