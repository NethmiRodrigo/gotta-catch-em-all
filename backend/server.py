import threading
from simple_websocket_server import WebSocketServer, WebSocket
import json
from datetime import datetime
import configparser

import csv 
import serial
import time
from io import StringIO
from PyQt5.Qt import *

DATA_COLUMNS_NAMES = ["type", "id", "mac", "rssi", "rate", "sig_mode", "mcs", "bandwidth", "smoothing", "not_sounding", "aggregation", "stbc", "fec_coding",
                      "sgi", "noise_floor", "ampdu_cnt", "channel", "secondary_channel", "local_timestamp", "ant", "sig_len", "rx_state", "len", "first_word", "data"]
HEADER_NAMES = ["timestamp", "rssi", "csi", "voxel_no", "inter_voxel_no", "activity"]

def open_training_data_file(activity, voxel_no):
    global save_file_fd
    global csv_writer
    global saving_mode_on
    global file_name

    saving_mode_on = True
    folder_name = '../training-data/Voxel-' + str(voxel_no) + '/'
    time_stamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    file_name = folder_name + activity + '-' + time_stamp + '.csv'
    save_file_fd = open(file_name, 'w')
    csv_writer = csv.writer(save_file_fd)
    csv_writer.writerow(HEADER_NAMES)
    print("CSV FILE OPENED FOR training voxel " + str(voxel_no) + " with activity " + activity)
    print("CSV file name - ", file_name)

def open_testing_data_file():
    global save_file_fd
    global csv_writer
    global saving_mode_on

    saving_mode_on = True
    time_stamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    save_file_fd = open('../testing-data/' + time_stamp + '.csv', 'w')
    csv_writer= csv.writer(save_file_fd)
    csv_writer.writerow(HEADER_NAMES)
    print("CSV FILE OPENED for testing data")

def close_csv_file():
    # global variables
    global save_file_fd
    global saving_mode_on
    # saving mode is turned off
    saving_mode_on = False
    try:
        save_file_fd.close()
        print("CSV file closed")
    except:
        print("No CSV file to close")


def csi_data_read_parse(port: str):
    # global variables
    global saving_mode_on
    global csv_writer
    global csi_raw_data
    global voxel_no
    global inter_voxel_no

    ser = serial.Serial(port=port, baudrate=921600,
                        bytesize=8, parity='N', stopbits=1)
    if ser.isOpen():
        print("open success")
    else:
        print("open failed")
        return

    while True:
        strings = str(ser.readline())
        if not strings:
            break

        strings = strings.lstrip('b\'').rstrip('\\r\\n\'')
        index = strings.find('CSI_DATA')

        if index == -1:
            continue

        csv_reader = csv.reader(StringIO(strings))
        csi_data = next(csv_reader)

        if(csi_data[0] == "CSI_DATA"): 
            del csi_data[0]

        if len(csi_data) != len(DATA_COLUMNS_NAMES):
            print("----- number of elements are not equal to the number of data column names -----")
            continue

        # Remove brackets
        data_str = csi_data[-1].strip('[]')

        # Split the string by spaces
        data_list = data_str.split()

        # Convert each element to integer
        csi_raw_data = [int(element) for element in data_list]

        if len(csi_raw_data) != 128 and len(csi_raw_data) != 256 and len(csi_raw_data) != 384:
            print(f"Number of csi elements does not much the expected. Number of elements received: {len(csi_raw_data)}")
            continue

        # writing to CSV file only if in the saving mode
        if saving_mode_on:
            write_row = []
            write_row.append(csi_data[18])
            write_row.append(csi_data[3])
            write_row.append(csi_raw_data)
            write_row.append(voxel_no)
            write_row.append(inter_voxel_no)
            write_row.append(activity)
            csv_writer.writerow(write_row)

    ser.close()
    time.sleep(0.5)
    return


class SubThread (QThread):
    def __init__(self, serial_port, save_file_name):
        super().__init__()
        self.serial_port = serial_port

    def run(self):
        csi_data_read_parse(self.serial_port)

    def __del__(self):
        self.wait()


###############################################################################################

class Simplesock(WebSocket):
    def handle(self):
        global activity
        global voxel_no
        global inter_voxel_no

        # Taking information sent by the web client
        if len(self.data)==0:
            # no data from the web client
            pass
        else:
            # received data from the web client
            json_data = json.loads(self.data)

            voxel_no = json_data["voxel"]
            inter_voxel_no = json_data["interVoxel"]
            action = json_data["mode"]
            activity = json_data["activity"]

            if action == "test":
                if saving_mode_on == False:
                    open_testing_data_file()
            elif action == "train":
                if activity != "none":
                    self.activity = activity
                    if saving_mode_on == False:
                        open_training_data_file(activity, voxel_no)
                        #start a timer for 50 seconds and close the web socket
                        print("Starting timer for 30 seconds")
                        timer = threading.Timer(30, self.close)
                        timer.start()   
                else:
                    close_csv_file()
            else:
                close_csv_file()

    def connected(self):
        print(self.address, 'connected')

    def handle_close(self):
        if(saving_mode_on): close_csv_file()
        print(self.address, 'closed')
	
###############################################################################################

# Reading the config file
config = configparser.ConfigParser()
config.read('config.ini')
serverHost = config['SERVER']['serverHost']		
serverPort = config['SERVER']['serverPort']		
serialPort = config['SERIAL']['serialPort']
csvFileName = config['SERIAL']['csvFileName']

# file descriptor for the CSV file
save_file_fd = 0
# csv file writer object
csv_writer = 0
# is in saving mode?
saving_mode_on = False
# voxel
voxel_no = 0
# inter voxel no (the position within the voxel)
inter_voxel_no = 0
# current activity
activity = "None"

# Starting serial port reading thread
subthread = SubThread(serialPort, csvFileName)
subthread.start()

# Starting websocket server
server = WebSocketServer(serverHost, serverPort, Simplesock)
print("Server started...")
server.serve_forever()
print("If this is printed, the server is not started due to some error")

