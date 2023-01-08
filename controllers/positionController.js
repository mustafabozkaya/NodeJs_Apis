const rosnodejs = require("rosnodejs");
const Position = require("../models/rosModel");
const eulerToQte = require("../utils/eulerToQte");
const PositionMarkerNavigateSrv =
  rosnodejs.require("mir_navigation").srv.PositionMarkerNavigate;

exports.createPositionMarker = async (req, res) => {
  try {
    const newMarker = await Position.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        Position: newMarker,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      data: {
        err,
      },
    });
    console.log(err);
  }
};

exports.getAllPositionMarkers = async (req, res) => {
  try {
    const newMarker = await Position.find();
    res.status(201).json({
      status: "success",
      data: {
        Position: newMarker,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getPositionMarker = async (req, res) => {
  try {
    const newMarker = await Position.findById(req.params.id);
    res.status(201).json({
      status: "success",
      data: {
        Position: newMarker,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deletePositionMarker = async (req, res) => {
  try {
    const newMarker = await Position.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: {
        Position: null,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.sendGoal = async (req, res) => {
  var request = new PositionMarkerNavigateSrv.Request();

  const marker = await Position.findById(req.params.id);

  const rotationArray = { x: 0, y: 0, z: marker.rotation };
  const rotationROS = eulerToQte.eulerToQuaternion(rotationArray);
  console.log(rotationROS);
  request.goal = {
    position: {
      x: marker.x,
      y: marker.y,
      z: 0,
    },
    orientation: {
      // here
      w: rotationROS.w,
      x: rotationROS.x,
      y: rotationROS.y,
      z: rotationROS.z,
    },
  };
  //   request.marker_name = marker.name;

  rosnodejs.initNode(process.env.ROSNODE).then(() => {
    const nh = rosnodejs.nh;
    const client = nh.serviceClient(
      process.env.ServiceClientName,
      process.env.ServiceClientType
    );
    client.call(request);
    res.status(200).json({
      Status: "success",
      Message: `Goal has been sent to ROS `,
      Destination: `${marker.name}`,
      Coordinates: ` x: ${marker.x}  y: ${marker.y}`,
    });
  });
};
