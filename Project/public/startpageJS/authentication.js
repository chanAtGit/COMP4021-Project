const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    const signin = function(username, password, onSuccess, onError) {
        
        let login_usr = {
            username: username,
            password: password
        }
        
        fetch("/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(login_usr)
        })
        .then(response => response.json())
        .then(data => {
            
            if (data.status === "success") {
                user = data.user;
                onSuccess();
            }
            
            else if (onError) onError(data.error);
        })
    };
    const validate = function(onSuccess, onError) {

        fetch("/validate")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                onSuccess();
            }
            else if (onError) onError(data.error);
        })
    };
    const signout = function(onSuccess, onError) {
        fetch("/signout")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                user = null;
                onSuccess();
            }
            else if (onError) onError(data.error);
        });
    };

    return { getUser, signin, validate, signout };
})();
