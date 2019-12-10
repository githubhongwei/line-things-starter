// Data
const GattService2 = {
    DailyKnee: { UUID: '0273d730-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: 'E625601E-9E55-4597-A598-76018A0D293D' }   //TODO: usage?
}

const GattCharacteristic2 = {
    DK_Six_Dof: { UUID: '02730003-0736-42db-917a-0369eebd174d' },
    DK_Rotation_Vector: { UUID: '02730004-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: '26E2B12B-85F0-4F3F-9FDD-91D114270E6E' }   //TODO: usage?
}

// -------------- //
// On window load //
// -------------- //

// ----------------- //
// Handler functions //
// ----------------- //

// ------------ //
// UI functions //
// ------------ //


function uiChangeStatusText2(text) {
    const elStatus = document.getElementById("status2");
    elStatus.innerText = text;
    elStatus.classList.remove("hidden");
}

function uiToggleDeviceConnected2(connected) {
    const elStatus = document.getElementById("status2");
    const elControls = document.getElementById("controls2");

    elStatus.classList.remove("error");

    if (connected) {
        // Hide loading animation
        uiToggleLoadingAnimation2(false);
        // Show status connected
        elStatus.classList.remove("inactive");
        elStatus.classList.add("success");
        elStatus.innerText = "Device connected";
        // Show controls
        elControls.classList.remove("hidden");
    } else {
        // Show loading animation
        uiToggleLoadingAnimation2(true);
        // Show status disconnected
        elStatus.classList.remove("success");
        elStatus.classList.add("inactive");
        elStatus.innerText = "Device disconnected";
        // Hide controls
        elControls.classList.add("hidden");
    }
}

function uiToggleLoadingAnimation2(isLoading) {
    const elLoading = document.getElementById("loading-animation2");

    if (isLoading) {
        // Show loading animation
        elLoading.classList.remove("hidden");
    } else {
        // Hide loading animation
        elLoading.classList.add("hidden");
    }
}

function uiStatusError2(message, showLoadingAnimation) {
    uiToggleLoadingAnimation2(showLoadingAnimation);

    const elStatus = document.getElementById("status2");
    const elControls = document.getElementById("controls2");

    // Show status error
    elStatus.classList.remove("success");
    elStatus.classList.remove("inactive");
    elStatus.classList.add("error");
    elStatus.innerText = message;

    // Hide controls
    elControls.classList.add("hidden");
}

function makeErrorMsg2(errorObj) {
    return "Error\n" + errorObj.code + "\n" + errorObj.message;
}

// -------------- //
// LIFF functions //
// -------------- //

function liffCheckAvailablityAndDo2(callbackIfAvailable2) {
    // Check Bluetooth availability
    uiChangeStatusText2("Checking Bluetooth availability...");
    liff.bluetooth.getAvailability().then(isAvailable => {
        if (isAvailable) {
            uiToggleDeviceConnected2(false);
            callbackIfAvailable2();
        } else {
            uiStatusError2("Bluetooth not available", true);
            setTimeout(() => liffCheckAvailablityAndDo2(callbackIfAvailable2), 10000);
        }
    }).catch(error => {
        uiStatusError2(makeErrorMsg2(error), false);
    });
}

function liffRequestDevice2() {
    uiChangeStatusText2("Requesting device...");
    liff.bluetooth.requestDevice().then(device => {
        liffConnectToDevice2(device);
    }).catch(error => {
        uiStatusError2(makeErrorMsg2(error), false);
    });
}

function liffConnectToDevice2(device) {
    uiChangeStatusText2("Connecting device...");
    device.gatt.connect().then(() => {
        document.getElementById("device-name2").innerText = device.name;
        document.getElementById("device-id2").innerText = device.id;

        // Show status connected
        uiToggleDeviceConnected2(true);

        // Get service
        device.gatt.getPrimaryService(GattService2.DailyKnee.UUID).then(service => {
            liffGetUserService2(service);
        }).catch(error => {
            uiStatusError2(makeErrorMsg2(error), false);
        });

        // Device disconnect callback
        const disconnectCallback2 = () => {
            // Show status disconnected
            uiToggleDeviceConnected2(false);

            // Remove disconnect callback
            device.removeEventListener('gattserverdisconnected', disconnectCallback2);

            // Reset data & UI

            // Try to reconnect
            initializeLiff2();
        };

        device.addEventListener('gattserverdisconnected', disconnectCallback2);
    }).catch(error => {
        uiStatusError2(makeErrorMsg2(error), false);
    });
}

function liffGetUserService2(service) {
    // [DailyKnee] 6-dof data
    service.getCharacteristic(GattCharacteristic2.DK_Six_Dof.UUID).then(characteristic => {
        liffGetDkSixDofCharacteristic2(characteristic);
    }).catch(error => {
        uiStatusError2(makeErrorMsg2(error), false);
    });
}

function liffGetDkSixDofCharacteristic2(characteristic) {
    var rawDataText = document.getElementById("device-raw-data2");
    // Add notification hook
    characteristic.startNotifications().then(() => {
        characteristic.addEventListener('characteristicvaluechanged', e => {
            const bytes = new Uint8Array(e.target.value.buffer);
            rawDataText.innerText = bytes.map(v => v.toString()).join(', ');

            //TODO: real data not extracted yet.
        });
    }).catch(error => {
        uiStatusError2(makeErrorMsg2(error), false);
    });
}
