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

// -------------- //
// LIFF functions //
// -------------- //

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
