
import time
import struct
import socket
import sys


def main():

    group = "FF02::1"
    MYPORT = 9999

    # --- look for multicast group address and find ip vers
    addrinfo = socket.getaddrinfo(group, None)[0]

    # --- create socket
    s = socket.socket(addrinfo[0], socket.SOCK_DGRAM)

    # --- bind to MYPORT
    s.bind(('', MYPORT))

    group_bin = socket.inet_pton(addrinfo[0], addrinfo[4][0])
    # --- join group
    mreq = group_bin + struct.pack('@I', 0)
    s.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_JOIN_GROUP, mreq)

    # --- print received data
    while True:
        data, sender = s.recvfrom(1500)
        while data[-1:] == '\0': data = data[:-1] # --- remove data trailing
        print (str(sender) + '  ' + repr(data.decode('utf-8')))

main()
