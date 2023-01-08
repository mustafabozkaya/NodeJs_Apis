1- roscore
2- roslaunch rosbridge_server rosbridge_websocket.launch
3- rosrun robot publish_robot_state.py
// services
// inside catkin_ws/
4- roslaunch mir_simulation start_services.launch
5- rostopic echo /move_base_simple/goal

--- if you wanna use the previous service(for_arslan)
// Go to catkin_ws/src and type the following command
roslaunch for_arslan start.launch

-- To start map services
roslaunch mir_simulation start_map.launch
