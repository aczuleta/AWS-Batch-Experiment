#!/bin/bash
if ! hash "conda" > /dev/null; then 
        mkdir -p ~/instaladores && wget -c -P ~/instaladores $ANACONDA_URL 
        bash ~/instaladores/Anaconda2-4.1.1-Linux-x86_64.sh -b -p $HOME/anaconda2 
        export PATH="$HOME/anaconda2/bin:$PATH" 
        echo 'export PATH="$HOME/anaconda2/bin:$PATH"'>>$HOME/.bashrc  
fi 
