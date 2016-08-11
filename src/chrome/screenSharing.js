/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const defaultSources = ['screen', 'window', 'tab'];
var desktopMediaRequestId;

function getDesktopMedia(sources, sender, callback) {
    // https://developer.chrome.com/extensions/desktopCapture
    var tab = sender.tab;

    tab.url = sender.url;

    desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(sources, tab, function (streamId) {
        if (!streamId) {
            return callback({status: 'permission-denied'});
        }

        return callback({status: 'ok', streamId: streamId});
    });
}

function cancelDesktopMedia() {
    if (desktopMediaRequestId) {
        chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
        desktopMediaRequestId = undefined;
    }
}

chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case 'get-desktop-media':
            getDesktopMedia(message.sources || defaultSources, sender, function (response) {
                sendResponse(response);
            });
            return true;
            break;
        case 'cancel-desktop-media':
            cancelDesktopMedia();
            sendResponse({status: 'ok'});
            break;
        case 'version':
            sendResponse({status: 'ok', version: '%VERSION%'});
            break;
        default:
            sendResponse({status: 'failed', reason: 'Unsupported command'});
            break;
    }
});