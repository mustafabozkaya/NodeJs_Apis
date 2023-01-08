// mongod
const mongod = spawnSync('pgrep', ['mongod']);

if (mongod.status === 0) {
  console.log('mongod is already running');
} else {
  console.log('mongod is not running, starting it now');
  spawn('mongod', { shell: true });
}
//Robot Publish
const robot_publish = spawnSync('pgrep', ['rosrun']);

if (robot_publish.status === 0) {
  console.log('rosrun is already running');
} else {
  console.log('rosrun is not running, starting it now');
  spawn('rosrun', ['robot', 'publish_robot_state.py'], {
    shell: true,
    detached: true,
  });
}

// WebSocket
spawn('roslaunch', ['rosbridge_server', 'rosbridge_websocket.launch'], {
  shell: true,
  detached: true,
});
