const rosnodejs = require('rosnodejs');
const { EventEmitter } = require('stream');
const robot_msgs = rosnodejs.require('robot').msg;
const Jimp = require('jimp');
const imageModel = require('../models/imageModel');
var ip = require('ip');
const { spawn } = require('child_process');
const { spawnSync } = require('child_process');

//listening  to the robotState topic
var lastestStatusMsg = {};
let child;
rosnodejs.initNode(process.env.ROSNODE).then(() => {
  const nh = rosnodejs.nh;
  const sub = nh.subscribe(
    process.env.RobotStateTopic,
    process.env.RobotStateType,
    (msg) => {
      // console.log(msg);
      lastestStatusMsg = msg;
    }
  );
});

var counter = 0;
exports.listenCommand = (req, res) => {
  console.log('My values');
  console.log(req.body.param);
  console.log(req.body.val);
  const { stringify } = require('querystring');

  rosnodejs
    .initNode(process.env.ROSNODE)
    .then(() => {
      const nh = rosnodejs.nh;
      const arslan = nh.setParam(String(req.body.param), req.body.val);
      arslan.then((result) => {
        console.log(result);
      });
      /////Subscriber and publisher//////////////
      const sub = nh.subscribe('/arslanTopic', 'std_msgs/String', (msg) => {
        console.log('Got msg on chatter: %j', msg);
      });

      const pub = nh.advertise('/arslanTopic', 'std_msgs/String');
      pub.publish(String(req.body.msg));

      res.status(200).json({
        status: 'success',
        data: {
          arslan: req.body,
        },
      });
    })
    .catch((err) => {
      rosnodejs.log.error(err.stack);
    });
};

exports.joystick = (req, res) => {
  const start = Date.now();
  rosnodejs.initNode(process.env.ROSNODE).then(() => {
    const endTime = Date.now();
    // console.log('Node Difference', endTime-start);
    const nh = rosnodejs.nh;
    const beforeAdvertise = Date.now();
    const pub = nh.advertise(
      process.env.JoystickTopic,
      process.env.JoystickType
    );
    const afterAdvertise = Date.now();
    // console.log('Advetise Difference', afterAdvertise-beforeAdvertise );

    // while(true){
    setTimeout(function () {
      pub.publish({
        linear: {
          x: req.body.x,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: req.body.z,
        },
      });
      counter++;
      console.log('Counter', counter, req.body);
      res.status(200).json({
        status: 'success',
        data: req.body,
      });
      EventEmitter.setMaxListeners(1000);
    }, 10);
    // }
    // console.log(pub)
  });
};

exports.batteryStatus = (req, res) => {
  var percent = lastestStatusMsg.battery_percentege;

  try {
    // console.log(lastestStatusMsg);
    // globalVar = 5;
    res.status(201).json({
      status: 'success',
      Battery: percent,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      data: {
        err,
      },
    });
  }
};

exports.robotStatus = (req, res) => {
  try {
    // console.log(lastestStatusMsg);
    // globalVar = 5;
    res.status(201).json({
      status: 'success',
      data: lastestStatusMsg,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.saveMap = async (req, res, next) => {
  try {
    // Initialize the ROS node
    await rosnodejs.initNode(process.env.ROSNODE);
    const nh = rosnodejs.nh;

    // Subscribe to the map topic and process the incoming message
    const sub = nh.subscribe(
      process.env.MapTopic,
      process.env.MapTopicType,
      async (msg) => {
        // Convert the occupancy grid message into an image
        const width = msg.info.width;
        const height = msg.info.height;
        const image = new Jimp(width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const value = msg.data[index];
            const invertedValue = value === 0 ? 255 : 0;
            image.setPixelColor(
              Jimp.rgbaToInt(invertedValue, invertedValue, invertedValue, 255),
              x,
              y
            );
          }
        }
        image.rotate(180);
        image.mirror(true, false);
        image.write(`images/map.jpg`);
        nh.unsubscribe('/map');

        // Generate the image URL and check if it already exists in the database
        const ipAddress = ip.address();
        const imageURL = `${req.protocol}://${ipAddress}:5050/map.jpg`;
        const existingImage = await imageModel.findOne({ link: imageURL });
        if (existingImage) {
          console.log('Image URL already exists in the database');
          res.status(200).json({
            Message: 'Image URL already exists in the database',
            link: imageURL,
          });
          return;
        }

        // If the image URL does not exist in the database, save the new image
        const newPicture = new imageModel({
          path: 'images/map.jpg',
          type: 'map',
          Date: Date.now(),
          link: imageURL,
        });
        await newPicture.save();

        // Return the response to the client
        // const object = {
        //   Status: 'success',
        //   Message: 'Image has been sent uploaded successfully',
        //   link: imageURL,
        // };
        res.status(200).json({
          Status: 'success',
          Message: 'Image has been sent uploaded successfully',
          link: imageURL,
        });
      }
    );
  } catch (err) {
    res.status(200).json({ err });
    console.log(err);
  }
};
exports.startServices = async (req, res) => {
  try {
    // start map
    child = spawn('roslaunch', ['mir_simulation', 'start_map.launch'], {
      shell: true,
      detached: true,
    });
    console.log(`Started roslaunch with PID: ${child.pid}`);
    res.status(200).json({
      Message: `Services started successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
exports.stopServices = async (req, res) => {
  try {
    // Find the name of the node that was created by the roslaunch command
    const output = spawnSync('rosnode', ['list']);
    const nodes = output.stdout.toString().split('\n');
    const mapNode = nodes.find((node) => node.startsWith('/static_map_server'));
    const rvizNode = nodes.find((node) => node.startsWith('/rviz'));

    if (mapNode) {
      // Kill the node
      spawn('rosnode', ['kill', mapNode, rvizNode], { shell: true });
    }
    res.status(200).json({
      Message: `nodes have been killed successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};
