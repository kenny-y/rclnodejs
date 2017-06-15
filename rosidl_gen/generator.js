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

const fs = require('mz/fs');
const mkdirp = require('mkdirp');
const path = require('path');

const message = require('../rosidl_gen/message.js');

const rosInstallPath = process.env.AMENT_PREFIX_PATH;
const basePath = rosInstallPath + '/share/';

fs.readdir(basePath).then((list) => {
  const msgs = list.filter((item) => {
    return item.substring(item.length - 5) == '_msgs' || item.substring(item.length - 18) === 'builtin_interfaces';
  });

  let all = [];
  msgs.forEach((item) => {
    const dir = basePath + item + '/msg';
    if (fs.existsSync(dir)) {
      fs.readdir(dir).then((list) => {
        list.forEach((name) => {
          const type = message.getMessageType(item, 'msg', name);
          if (message.existsSync(basePath, type)) {
            all.push(message.generateMessage(basePath, type));
          } else {
            console.log("");
          }
        });
      });
    } // fs.existsSync
  });

  // const srvs = list.filter((item) => {
  //   return item.substring(item.length - 5) == '_srvs';
  // });
  // // console.log(srvs);

  // srvs.forEach((item) => {
  //   const dir = basePath + item + '/srv';
  //   fs.readdir(dir).then((list) => {
  //     counter += list.length;
  //     // console.log(item + ':' + list);
  //     // console.log(counter);
  //     // console.log('');
  //   });
  // });

});
