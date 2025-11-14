// const { json } = require("body-parser");
// const { fstat } = require("fs");

const Registration = (function() {
    
    
    const register = function(username, avatar, name, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
        let user = {
            username: username,
            avatar: avatar,
            name: name,
            password: password
        }
        
        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then((json) => {
            if (json.status === "success") onSuccess();
            else if (onError) onError(json.error);
        })
    };

    return { register };
})();
