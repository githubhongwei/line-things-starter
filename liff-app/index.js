// -------------- //
// On window load //
// -------------- //

window.onload = () => {
    initializeApp();
}

// ------------ //
// UI functions //
// ------------ //

function uiOverallGeneralMsg(message) {
    const element = document.getElementById("overallMsg");
    element.classList.remove("error");
    element.classList.add("success");
    element.classList.add("inactive");
    element.innerText = message;
}

function uiOverallErrorMsg(message) {
    const element = document.getElementById("overallMsg");
    element.classList.remove("success");
    element.classList.remove("inactive");
    element.classList.add("error");
    element.innerText = message;
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
    liff.init(
        () => initializeLiff(), 
        error => uiOverallErrorMsg(makeErrorMsg(error), false)
    );
}

function initializeLiff() {
    liff.initPlugins(['bluetooth']).then(() => {
        liffCheckAvailablityAndDo(() => {
            liffRequestDevice();
            liffRequestDevice2();
        });
    }).catch(error => {
        uiOverallErrorMsg(makeErrorMsg(error), false);
    });
}

function liffCheckAvailablityAndDo(callbackIfAvailable) {
    // Check Bluetooth availability
    uiOverallGeneralMsg("Checking Bluetooth availability...");
    liff.bluetooth.getAvailability().then(isAvailable => {
        if (isAvailable) {
            uiToggleDeviceConnected(false);
            uiToggleDeviceConnected2(false);
            callbackIfAvailable();
        } else {
            uiOverallErrorMsg("Bluetooth not available", true);
            setTimeout(() => liffCheckAvailablityAndDo(callbackIfAvailable), 10000);
        }
    }).catch(error => {
        uiOverallErrorMsg(makeErrorMsg(error), false);
    });
}