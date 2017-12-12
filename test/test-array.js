// Copyright (c) 2017 Intel Corporation. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const childProcess = require('child_process');
const rclnodejs = require('../index.js');
const translator = require('../lib/message_translator.js');

function isTypedArray(v) {
  return ArrayBuffer.isView(v) && !(v instanceof DataView)
}

describe('rclnodejs message communication', function() {
  this.timeout(60 * 1000);

  before(function() {
    return rclnodejs.init();
  });

  after(function() {
    rclnodejs.shutdown();
  });

  it('should support array type', function(done) {
    var node = rclnodejs.createNode('array_message_subscription');
    const JointState = 'sensor_msgs/msg/JointState';
    var publisher = childProcess.fork(`${__dirname}/publisher_array_setup.js`);
    var destroy = false;
    var subscription = node.createSubscription(JointState, 'JointState', (state) => {
      assert.deepStrictEqual(state.header.stamp.sec, 123456);
      assert.deepStrictEqual(state.header.stamp.nanosec, 789);
      assert.deepStrictEqual(state.header.frame_id, 'main frame');
      assert.deepStrictEqual(state.name, ['Tom', 'Jerry']);
      assert.deepStrictEqual(state.position, Float64Array.from([1, 2]));
      assert.deepStrictEqual(state.velocity, Float64Array.from([2, 3]));
      assert.deepStrictEqual(state.effort, Float64Array.from([4, 5, 6]));

      if (!destroy) {
        publisher.kill('SIGINT');
        node.destroy();
        destroy = true;
        done();
      }
    });
    rclnodejs.spin(node);
  });


  /* eslint-disable camelcase */
  /* eslint-disable key-spacing */
  /* eslint-disable comma-spacing */

  const layout = {
    dim: [
      {label: 'height',  size: 10, stride: 600},
      {label: 'width',   size: 20, stride: 60},
    ],
    data_offset: 0,
  };

  [
    {
      pkg: 'std_msgs', type: 'Int8MultiArray',
      values: [
        {layout: layout, data: [-10, 1, 2, 3, 8, 6, 0, -25] }, // Provide data via Array
        {layout: layout, data: Int8Array.from([-10, 1, 2, 3, 8, 6, 0, -25]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'Int16MultiArray',
      values: [
        {layout: layout, data: [-10, 1, 2, 3, 8, 6, 0, -25] }, // Provide data via Array
        {layout: layout, data: Int16Array.from([-10, 1, 2, 3, 8, 6, 0, -25]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'Int32MultiArray',
      values: [
        {layout: layout, data: [-10, 1, 2, 3, 8, 6, 0, -25] }, // Provide data via Array
        {layout: layout, data: Int32Array.from([-10, 1, 2, 3, 8, 6, 0, -25]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'Int64MultiArray',
      values: [
        {layout: layout, data: [-111, 1, 2, 3, 8, 6, 0, -25, Number.MAX_SAFE_INTEGER] }, // Provide data via Array
      ]
    },
    {
      pkg: 'std_msgs', type: 'UInt8MultiArray',
      values: [
        {layout: layout, data: [0, 1, 2, 3, 8, 6, 0, 255] }, // Provide data via Array
        {layout: layout, data: Uint8Array.from([0, 1, 2, 3, 8, 6, 0, 255]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'UInt16MultiArray',
      values: [
        {layout: layout, data: [0, 1, 2, 3, 8, 6, 0, 255] }, // Provide data via Array
        {layout: layout, data: Uint16Array.from([0, 1, 2, 3, 8, 6, 0, 255]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'UInt32MultiArray',
      values: [
        {layout: layout, data: [0, 1, 2, 3, 8, 6, 0, 255] }, // Provide data via Array
        {layout: layout, data: Uint32Array.from([0, 1, 2, 3, 8, 6, 0, 255]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'UInt64MultiArray',
      values: [
        {layout: layout, data: [0, 1, 2, 3, 8, 6, 0, 255, Number.MAX_SAFE_INTEGER] }, // Provide data via Array
      ]
    },
    {
      pkg: 'std_msgs', type: 'Float32MultiArray',
      values: [
        {layout: layout, data: [-10, 1, 2, 3, 8, 6, 0, -25] }, // Provide data via Array
        {layout: layout, data: Float32Array.from([-10, 1, 2, 3, 8, 6, 0, -25]) }, // Provide data via TypedArray
      ]
    },
    {
      pkg: 'std_msgs', type: 'Float64MultiArray',
      values: [
        {layout: layout, data: [-10, 1, 2, 3, 8, 6, 0, -25] }, // Provide data via Array
        {layout: layout, data: Float64Array.from([-10, 1, 2, 3, 8, 6, 0, -25]) }, // Provide data via TypedArray
      ]
    },
  /* eslint-enable camelcase */
  /* eslint-enable key-spacing */
  /* eslint-enable comma-spacing */
  ].forEach((testData) => {
    const topic = testData.topic || 'topic' + testData.type;
    testData.values.forEach((v, i) => {
      it('Test ' + testData.type + '.copy()' +  ', case ' + i, function() {
        const MessageType = rclnodejs.require(testData.pkg + '/msg/' + testData.type);
        const msg1 = translator.toROSMessage(MessageType, v);
        const msg2 = new MessageType();
        msg2.copy(msg1);

        function checkMessage(msg) {
          assert(typeof msg.layout === 'object');

          assert(Array.isArray(msg.layout.dim.data));
          // First element
          assert(typeof msg.layout.dim.data[0] === 'object');
          assert(msg.layout.dim.data[0].label === v.layout.dim[0].label);
          assert(msg.layout.dim.data[0].size === v.layout.dim[0].size);
          assert(msg.layout.dim.data[0].stride === v.layout.dim[0].stride);
          // Second element
          assert(typeof msg.layout.dim.data[1] === 'object');
          assert(msg.layout.dim.data[1].label === v.layout.dim[1].label);
          assert(msg.layout.dim.data[1].size === v.layout.dim[1].size);
          assert(msg.layout.dim.data[1].stride === v.layout.dim[1].stride);

          assert(msg.layout.data_offset === v.layout.data_offset);

          assert(msg.data);
          if (isTypedArray(v.data)) {
            assert.deepStrictEqual(msg.data, v.data);
          } else {
            assert.deepEqual(msg.data, v.data);
          }
        }

        checkMessage(msg1);
        checkMessage(msg2);

        const o = v.data[0];
        assert(msg2.data[0] == o);
        const r = Math.round(Math.random() * 100);
        msg1.data[0] = r;
        assert(msg1.data[0] == r);
        console.log(r, msg1.data[0], msg2.data[0], o);
        assert(msg2.data[0] == o);
      });
    });
  });
});
