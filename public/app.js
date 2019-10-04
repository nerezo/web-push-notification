let userAgent = navigator.userAgent;

let applicationKey = "BAoasWXT60dNY7I5BAQyfrhLvsWsYC4EeUHoIJLWDmqRAEoiXtT1nFcx5cjGpbDP_o1E1CIqvxIk4cxLYZ9AVFs";

// Url Encryption
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Send request to database for add new subscriber.
function saveSubscription(subscription) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/subscriber"); // Put here API address
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState != 4) return;
        if (xmlHttp.status != 200 && xmlHttp.status != 304) {
            console.log('HTTP error ' + xmlHttp.status, null);
        } else {
            console.log("User subscribed to server");
        }
    };

    xmlHttp.send(JSON.stringify(Object.assign({userAgent: userAgent}, subscription.toJSON())));
}

const check = () => {
    if (!("serviceWorker" in navigator)) {
        throw new Error("No Service Worker support!");
    }
    if (!("PushManager" in window)) {
        throw new Error("No Push API Support!");
    }

    console.log('Service Worker and Push is supported');
};

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if (permission !== "granted") {
        throw new Error("Permission not granted for Notification");
    }
};

const registerServiceWorker = async () => {
    // Installing service worker
    navigator.serviceWorker.register('sw.js')
        .then(function (swRegistration) {
            console.log('Service worker registered');

            swRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    let isSubscribed = !(subscription === null);

                    if (isSubscribed) {
                        console.log('User is subscribed');
                    } else {
                        swRegistration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlB64ToUint8Array(applicationKey)
                        })
                            .then(function (subscription) {
                                console.log(subscription);
                                console.log('User is subscribed');

                                saveSubscription(subscription);

                                isSubscribed = true;
                            })
                            .catch(function (err) {
                                console.log('Failed to subscribe user: ', err);
                            })
                    }
                })
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
};

const triggerPush = document.querySelector('.trigger-push');
triggerPush.addEventListener('click', async () => {
    check();
    await requestNotificationPermission();
    await registerServiceWorker();
});
