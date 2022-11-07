
import time
from socket import socket, AF_INET, SOCK_DGRAM
s = socket(AF_INET, SOCK_DGRAM)

def sendHello():
    try:
        while True:
            msg = str("Hello").encode("utf-8")
            
            s.sendto(msg, ('localhost', 6667))
            time.sleep(1)
    except KeyboardInterrupt:
        pass

sendHello()



