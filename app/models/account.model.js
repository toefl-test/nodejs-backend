const sql = require("./db.js");
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const checkEmail = `Select Email FROM Accounts WHERE email = ?`;

// constructor
const Account = function(account) {
    this.name = account.name;
    this.surname = account.surname;
    this.email = account.email;
    this.password = md5(account.password.toString());
    this.role = account.role;
};

Account.register = (newAccount, result) => {
    sql.query(checkUsername, [newAccount.email], (err, res) => {
        if(res.length > 0){
            result({ message: "email_exist" }, null);
            return;
        }
        sql.query("INSERT INTO Accounts SET ?", newAccount, (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            let token = jwt.sign({ data: result }, 'secret')
            console.log("created account: ", { id: res.insertId, ...newAccount });
            result(null, { id: res.insertId, token: token, ...newAccount });
        });
    });
};


Account.login = (loginAccount, result) => {
    sql.query("SELECT * FROM Accounts WHERE email = ? AND password = ?", loginAccount, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        let token = jwt.sign({ data: result }, 'secret')
        console.log("created account: ", { id: res.insertId, ...loginAccount });
        result(null, { id: res.insertId, token: token, ...loginAccount });
    });
};
