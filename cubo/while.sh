#!/bin/bash
while fuser /var/lib/dpkg/lock >/dev/null 2>&1; do 
    echo "Waiting while other process ends installs (dpkg/lock is locked)" 
    sleep 1
 done 
