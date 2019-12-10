// Data
const GattService = {
    DailyKnee: { UUID: '0273d730-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: 'E625601E-9E55-4597-A598-76018A0D293D' }   //TODO: usage?
}

const GattCharacteristic = {
    DK_Six_Dof: { UUID: '02730003-0736-42db-917a-0369eebd174d' },
    DK_Rotation_Vector: { UUID: '02730004-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: '26E2B12B-85F0-4F3F-9FDD-91D114270E6E' }   //TODO: usage?
}

// -------------- //
// On window load //
// -------------- //

window.onload = () => {
    initializeApp();
	// initializeApp2();
};

// ----------------- //
// Handler functions //
// ----------------- //

// ------------ //
// UI functions //
// ------------ //

function uiChangeStatusText(text) {
    const elStatus = document.getElementById("status");
    elStatus.innerText = text;
    elStatus.classList.remove("hidden");
}

function uiToggleDeviceConnected(connected) {
    const elStatus = document.getElementById("status");
    const elControls = document.getElementById("controls");

    elStatus.classList.remove("error");

    if (connected) {
        // Hide loading animation
        uiToggleLoadingAnimation(false);
        // Show status connected
        elStatus.classList.remove("inactive");
        elStatus.classList.add("success");
        elStatus.innerText = "Device connected";
        // Show controls
        elControls.classList.remove("hidden");
    } else {
        // Show loading animation
        uiToggleLoadingAnimation(true);
        // Show status disconnected
        elStatus.classList.remove("success");
        elStatus.classList.add("inactive");
        elStatus.innerText = "Device disconnected";
        // Hide controls
        elControls.classList.add("hidden");
    }
}

function uiToggleLoadingAnimation(isLoading) {
    const elLoading = document.getElementById("loading-animation");

    if (isLoading) {
        // Show loading animation
        elLoading.classList.remove("hidden");
    } else {
        // Hide loading animation
        elLoading.classList.add("hidden");
    }
}

function uiStatusError(message, showLoadingAnimation) {
    uiToggleLoadingAnimation(showLoadingAnimation);

    const elStatus = document.getElementById("status");
    const elControls = document.getElementById("controls");

    // Show status error
    elStatus.classList.remove("success");
    elStatus.classList.remove("inactive");
    elStatus.classList.add("error");
    elStatus.innerText = message;

    // Hide controls
    elControls.classList.add("hidden");
}

function makeErrorMsg(errorObj) {
    return "Error\n" + errorObj.code + "\n" + errorObj.message;
}

// -------------- //
// LIFF functions //
// -------------- //

function initializeApp() {
    liff.init(() => initializeLiff(), error => uiStatusError(makeErrorMsg(error), false));
}

function initializeLiff() {
    liff.initPlugins(['bluetooth']).then(() => {
        liffCheckAvailablityAndDo(() => liffRequestDevice());
        liffCheckAvailablityAndDo2(() => liffRequestDevice2());
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffCheckAvailablityAndDo(callbackIfAvailable) {
    alert("liffCheckAvailablityAndDo");
    // Check Bluetooth availability
    uiChangeStatusText("Checking Bluetooth availability...");
    liff.bluetooth.getAvailability().then(isAvailable => {
        if (isAvailable) {
            uiToggleDeviceConnected(false);
            callbackIfAvailable();
        } else {
            uiStatusError("Bluetooth not available", true);
            setTimeout(() => liffCheckAvailablityAndDo(callbackIfAvailable), 10000);
        }
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffRequestDevice() {
    uiChangeStatusText("Requesting device...");
    liff.bluetooth.requestDevice().then(device => {
        liffConnectToDevice(device);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffConnectToDevice(device) {
    uiChangeStatusText("Connecting device...");
    device.gatt.connect().then(() => {
        document.getElementById("device-name").innerText = device.name;
        document.getElementById("device-id").innerText = device.id;

        // Show status connected
        uiToggleDeviceConnected(true);

        // Get service
        device.gatt.getPrimaryService(GattService.DailyKnee.UUID).then(service => {
            liffGetUserService(service);
        }).catch(error => {
            uiStatusError(makeErrorMsg(error), false);
        });

        // Device disconnect callback
        const disconnectCallback = () => {
            // Show status disconnected
            uiToggleDeviceConnected(false);

            // Remove disconnect callback
            device.removeEventListener('gattserverdisconnected', disconnectCallback);

            // Reset data & UI

            // Try to reconnect
            initializeLiff();
        };

        device.addEventListener('gattserverdisconnected', disconnectCallback);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffGetUserService(service) {
    // [DailyKnee] 6-dof data
    service.getCharacteristic(GattCharacteristic.DK_Six_Dof.UUID).then(characteristic => {
        liffGetDkSixDofCharacteristic(characteristic);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffGetDkSixDofCharacteristic(characteristic) {
    var rawDataText = document.getElementById("device-raw-data");
    // Add notification hook
    characteristic.startNotifications().then(() => {
        characteristic.addEventListener('characteristicvaluechanged', e => {
            const bytes = new Uint8Array(e.target.value.buffer);
            rawDataText.innerText = bytes.map(v => v.toString()).join(', ');

            //TODO: real data not extracted yet.
        });
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}
