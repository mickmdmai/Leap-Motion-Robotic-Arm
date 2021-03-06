/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2014, Decoded Ltd dev@decoded.com
 */

// Map a servo to a single hand, single axis

// grab the leap data
var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    // mm range of leap motion to use, see leap-range.js to find
    leap_range = [-100,100], // x of right hand
    frame, palm;

// parse the data and respond
board.on('ready', function() {
    // setup a servo on pin 9
    // base left and right
    servo = new five.Servo({
      pin: 9,
      range: [0, 179] // dependent on servo
    });

    //right servo
    servo1 = new five.Servo({
      pin: 10,
      range: [0, 179] // dependent on servo
    });

    //left servo - up and down
    servo2 = new five.Servo({
      pin: 11,
      range: [60, 800] // dependent on servo
    });

    // set to midpoint
    servo.to(90);

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        // if only one hand is present
        if (frame.hands && frame.hands.length == 1) {
            // extract centre palm position in mm [x,y,z]
            palm = frame.hands[0].palmPosition;
            // map x position of leap to servo
            //console.log("input",palm[0]);
            console.log("output", palm[0].map())

            console.log("test position: ", palm[1]);
            servo.to(palm[0].map());
            servo1.to(palm[2].map());
            servo2.to(179 - palm[1].map() * 3);
        }
    });
});

// map two  ranges, adapted from SO: 10756313
Number.prototype.map = function () {
  var output = Math.round((this - leap_range[0]) * (servo.range[1] - servo.range[0]) / (leap_range[1] - leap_range[0]) + servo.range[0]);

  // check output is within range, or cap
  output = (output > servo.range[1]) ? servo.range[1] : output;
  output = (output < servo.range[0]) ? servo.range[0] : output;
  // is the servo range reversed? uncomment below
  output = servo.range[1] - output;
  return output;
}
