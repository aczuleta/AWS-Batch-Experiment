#!/bin/bash
sudo mount /web_storage
sudo mount /dc_storage
cd /CDCol/cdcol_celery/
echo export execID=$execID >> /etc/environment
echo export algorithm=$algorithm >> /etc/environment
echo export version=$version >> /etc/environment
echo export output_expression=$output_expression >> /etc/environment
echo export product=$product >> /etc/environment
echo export min_lat=$min_lat >> /etc/environment
echo export min_long=$min_long >> /etc/environment
echo export time_ranges=$time_ranges >> /etc/environment
echo export kwargs=$kwargs >> /etc/environment
sudo -H -u ingestor /root/anaconda2/bin/python  -c "import test; test.generic_task($execID, $algorithm, $version, $output_expression, $product, $min_lat, $min_long, $time_ranges, $kwargs)"
