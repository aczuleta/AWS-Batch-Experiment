FROM ubuntu:16.04

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    TERM=xterm
RUN echo "export > /etc/envvars" >> /root/.bashrc && \
    echo "export PS1='\e[1;31m\]\u@\h:\w\\$\[\e[0m\] '" | tee -a /root/.bashrc /etc/bash.bashrc && \
    echo "alias tcurrent='tail /var/log/*/current -f'" | tee -a /root/.bashrc /etc/bash.bashrc

RUN apt-get update
RUN apt-get install -y locales && locale-gen en_US en_US.UTF-8

# Runit
RUN apt-get install -y --no-install-recommends runit
CMD export > /etc/envvars && /usr/sbin/runsvdir-start

# Utilities
RUN apt-get install -y --no-install-recommends vim less net-tools inetutils-ping wget curl git telnet nmap socat dnsutils netcat tree htop unzip sudo software-properties-common jq psmisc iproute python ssh rsync

RUN wget -O - http://cdn.primatelabs.com/Geekbench-4.1.0-Linux.tar.gz | tar zx --strip-components=2
RUN mv Geek* /geekbench

# Instalamos VIM 
RUN apt-get update && \ 
    apt-get install vim

# Creamos el directorio donde se guardarán las llaves para acceder al respositorio 
RUN mkdir /root/.ssh/ 
#Definimos las variables de entorno a utilizar durante la instalación
ENV IPDB='192.168.1.31'
ENV IPNFS='192.168.1.82'
ENV USUARIO_CUBO="$(whoami)"
ENV PASSWORD_CUBO='ASDFADFASSDFA'
ENV ANACONDA_URL="https://repo.continuum.io/archive/Anaconda2-4.1.1-Linux-x86_64.sh"
ENV REPO="git@gitlab.virtual.uniandes.edu.co:datacube-ideam/agdc-v2.git"
ENV BRANCH="desacoplado"
#Copiamos nuestra llave pública dentro de la imágen para poder hacer clone
COPY id_rsa* /root/.ssh/
#Damos los permisos necesarios a las llaves para poder acceder
RUN chmod 700 /root/.ssh/id_rsa && \
    chmod 700 /root/.ssh/id_rsa.pub && \
    chown -R root:root /root/.ssh && \
    touch /root/.ssh/known_hosts && \
    ssh-keyscan -H gitlab.virtual.uniandes.edu.co >> /root/.ssh/known_hosts

#Empezamos a clonar y a bajarnos todo lo necesario para correr el cubo
RUN git clone git@gitlab.virtual.uniandes.edu.co:datacube-ideam/CDCol.git && \
    mv CDCol/* ~/ 

COPY while.sh /root/while.sh
RUN chmod 700 /root/while.sh
#Prerequisites installation: 
RUN  /root/while.sh  

RUN sudo apt install -y openssh-server postgresql-9.5 postgresql-client-9.5 postgresql-contrib-9.5 libgdal1-dev libhdf5-serial-dev libnetcdf-dev hdf5-tools netcdf-bin gdal-bin pgadmin3 libhdf5-doc netcdf-doc libgdal-doc git wget htop imagemagick ffmpeg|| exit 1

COPY condicional.sh /root/condicional.sh
RUN chmod 700 /root/while.sh 

RUN mkdir -p ~/instaladores && wget -c -P ~/instaladores $ANACONDA_URL && \
	bash ~/instaladores/Anaconda2-4.1.1-Linux-x86_64.sh -b -p $HOME/anaconda2 && \
	export PATH="$HOME/anaconda2/bin:$PATH" && \
	echo 'export PATH="$HOME/anaconda2/bin:$PATH"'>>$HOME/.bashrc && \
    conda install -y psycopg2 gdal libgdal hdf5 rasterio netcdf4 libnetcdf pandas shapely ipywidgets scipy numpy 
    
RUN yes Y | sudo apt-get install python-pip && \
    yes Y | curl 'https://bootstrap.pypa.io/get-pip.py' > get-pip.py && sudo python get-pip.py pip==9.0.2 

RUN pip install --upgrade pip==18.0  wheel==0.30.0 setuptools==28.8.0 && \
    #pip install -U pip && \
    pip install lcmap-pyccd  
    #pip install rasterio==1.0a9 --force-reinstall && \
    

RUN cd  ~ && \
    git clone $REPO

RUN  yes Y | sudo apt-get install -y python-setuptools && \
     yes Y | sudo apt-get build-dep python-gdal && \
     yes Y | pip install --upgrade setuptools 

RUN cd ~/agdc-v2 && \
    git checkout $BRANCH && \
    yes Y | sudo add-apt-repository -y ppa:ubuntugis/ppa && \
    yes Y | sudo apt update  && \
    yes Y | sudo apt upgrade && \
    yes Y | sudo apt install gdal-bin python-gdal python3-gdal && \
    sudo python setup.py install

RUN cd ~ && \
    sudo apt-get install nano 
    
COPY .datacube.conf  /root/

#RUN datacube -v system init



RUN pass=$(perl -e 'print crypt($ARGV[0], "password")' "uniandes") && \
    sudo groupadd ingesters && \
    sudo useradd  --no-create-home -G ingesters -p $pass ingestor --shell="/usr/sbin/nologin" --home /source_storage  -K UMASK=002  
    

RUN export PATH="$HOME/anaconda2/bin:$PATH" && \
	echo 'export PATH="$HOME/anaconda2/bin:$PATH"'>>$HOME/.bashrc && \
    yes Y | conda install -c conda-forge celery=3.1.23 && \
    sudo touch /etc/systemd/system/celery.service && \
    sudo chmod o+w /etc/systemd/system/celery.service 

COPY celery.service /etc/systemd/system/

RUN sudo chmod o-w /etc/systemd/system/celery.service

#Copiamos en archivo que contiene la configuración para el montaje del NFS
COPY fstab.txt /root/

#MOUNT NFS SERVER
RUN cd $HOME && \
    yes Y | sudo apt install nfs-common && \
    sudo chmod o+w /etc/fstab && \
    cat fstab.txt >>/etc/fstab

RUN sudo chmod o-w /etc/fstab && \
    sudo mkdir /dc_storage /web_storage /source_storage && \
    sudo chown cubo:root /dc_storage /web_storage /source_storage && \
    sudo mount /dc_storage && \
    #sudo mount /source_storage
    sudo mount /web_storage 

ARG BUILD_INFO
LABEL BUILD_INFO=$BUILD_INFO
