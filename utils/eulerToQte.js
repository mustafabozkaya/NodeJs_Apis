exports.eulerToQuaternion= (euler) => {
    // Convert Euler angles to radians
    var x = euler.x * Math.PI / 180;
    var y = euler.y * Math.PI / 180;
    var z = euler.z * Math.PI / 180;
    
    // Calculate quaternion
    var c1 = Math.cos(z / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(x / 2);
    var s1 = Math.sin(z / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(x / 2);
  
    var quaternion = {
      w: c1 * c2 * c3 - s1 * s2 * s3,
      x: s1 * s2 * c3 + c1 * c2 * s3,
      y: c1 * s2 * c3 - s1 * c2 * s3,
      z: s1 * c2 * c3 + c1 * s2 * s3
    };
  
    return quaternion;
  }