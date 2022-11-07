
import time
import struct
import socket
import sys


def main():

    MYTTL = 1
    group = "FF02::1"
    MYPORT = 9999

    addrinfo = socket.getaddrinfo(group, None)[0]

    s = socket.socket(addrinfo[0], socket.SOCK_DGRAM)

    # --- set TTL
    ttl_bin = struct.pack('@i', MYTTL)
    s.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_MULTICAST_HOPS, ttl_bin)


    while True:
        data = repr(time.time())
        s.sendto("HELLO!", (addrinfo[4][0], MYPORT))
        time.sleep(1)

main()