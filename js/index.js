var authContext;
var user;

var loginButton;
var logoutButton;
var userName;
var apiResponse;
var appContent;

function init() {
    loginButton = document.getElementById('login_button');
    logoutButton = document.getElementById('logout_button');
    userName = document.getElementById('username');
    apiResponse =  document.getElementById('api_response');
    appContent = document.getElementById('app_content');

    loginButton.style.display = "none";
    logoutButton.style.display = "none";

    // Set up ADAL
    var applicationConfig = {
        clientID: "3e6680a9-fddb-4796-8641-0d0893c42c68",
        authority: "https://login.microsoftonline.com/common",
        graphScopes: ["user.read"],
        graphEndpoint: "https://graph.microsoft.com/v1.0/me"
    };

    window.Logging = {
        piiLoggingEnabled: true,
        level: 3,
        log: function (message) {
            console.log(message);
        }
    };

    authContext = new AuthenticationContext({
        clientId: applicationConfig.clientID,
        postLogoutRedirectUri: 'https://3papp.azurewebsites.net'
    });

    if (authContext.isCallback(window.location.hash)) {
        // Handle redirect after token requests
        authContext.handleWindowCallback();
        console.log("handled callback");
        var err = authContext.getLoginError();
        if (err) {
            apiResponse.textContent = 'ERROR:\n\n' + err;
        } else {
            loadContent();
        }
    } else {
        loadContent();
    }
}

function login() {
    authContext.login();
}

function logOut() {
    authContext.logOut();
}

function loadContent() {
    // If logged in, get access token and make an API request
    user = authContext.getCachedUser();
    console.log(JSON.stringify(user));
    if (user) {
        logoutButton.style.display = "block";
        userName.textContent = 'Signed in as: ' + user.userName;
        getInfo();
    } else {
        loginButton.style.display = "block";
        userName.textContent = 'Not signed in.';
        document.getElementById('api_response').textContent = '';
    }
}

function getInfo() {
    var resourceId = "https://graph.microsoft.com";

    apiResponse.textContent = "Acquiring access token...";

    authContext.acquireToken(resourceId, function (errorDesc, token, error) {
        console.log("getInfo error: " + errorDesc);
        apiResponse.textContent = error + ": " + errorDesc;

        if (error) { //acquire token failure
            // If using popup flows
            authContext.acquireTokenPopup(resourceId, null, null,  function (errorDesc, token, error) {});
        }
        else {
            //acquired token successfully
            loadUserProfile(token);
        }
    });    
}

function loadUserProfile(access_token) {
    var resourceId = "https://graph.microsoft.com/Calendars.Read";
    var xhr = new XMLHttpRequest();
    
    apiResponse.textContent = "Loading user profile...";

    // profile https://graph.microsoft.com/v1.0/me
    // calendar https://graph.microsoft.com/v1.0/me/calendar/events
    xhr.open('GET', 'https://graph.microsoft.com/v1.0/me', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            apiResponse.textContent = JSON.stringify(JSON.parse(xhr.responseText), null, '  ');
        } else {
            apiResponse.textContent = 'ERROR:\n\n' + xhr.responseText;
        }
    };

    xhr.send();
}

