
from socket import socket, AF_INET, SOCK_DGRAM
sock = socket(AF_INET, SOCK_DGRAM)

sock.bind(('localhost', 6667))

def receiveMSG():
    try:
        while True:
            msg, addr = sock.recvfrom(9999)
            print("%s:\n -> %s" % (addr, msg.decode('utf-8')))
    except KeyboardInterrupt:
        pass

receiveMSG()

