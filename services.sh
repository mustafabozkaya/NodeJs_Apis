# Set up a signal handler to terminate the background processes
trap "kill 0" SIGINT SIGTERM EXIT 

#start mongodb server
sudo service mongodb start &

#start roscore
roscore &
sleep 5

roslaunch rosbridge_server rosbridge_websocket.launch &

rosrun robot publish_robot_state.py &

roslaunch mir_simulation start_services.launch &

# Wait for any background process to terminate
wait
