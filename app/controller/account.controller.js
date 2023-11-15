// const Account = require("../models/account.model.js");
const con = require("../models/db.js");
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const path = require('path');
const uploadPath = path.join(__dirname, '..', '..', 'upload');
const fs = require('fs');
const uuid = require('uuid');
const {sendingMail} = require('./mailing.controller');

// Create and Save a new Tutorial
exports.register = (req, res, next) => {
    try {
        let { name, surname, email, password, date} = req.body;
        // Get the file that was set to our field named "image"
        const { image } = req.files;
        if (req.files && !image.mimetype.startsWith('image')) return res.send({ status: 0, error: "File is not an image!" });

        const hashed_password = md5(password.toString())
        const checkEmail = `SELECT Email FROM Accounts WHERE Email = ?`;
        con.query(checkEmail, [email], (err, result, fields) => {
            console.log(result)
            if (!result.length) {
                let token = jwt.sign({ data: hashed_password }, 'secret');
                const sql = `Insert Into Accounts (Name, Surname, Email, Password, exam_date, token) VALUES ( ?, ?, ?, ?, ?, ?)`
                con.query(sql, [name, surname, email, hashed_password, date, token], (err, result, fields) => {
                    if (err) {
                        res.send({ status: 0, data: err });
                    } else {

                        // Move the uploaded image to our upload folder
                        if(req.files && image){
                            let imgPath = path.join(uploadPath, email+'.jpg');
                            image.mv(imgPath);
                        }
                        if (token) {
                            //send email to the user
                            //with the function coming from the mailing.js file
                            //message containing the user id and the token to help verify their email
                            sendingMail({
                                from: "no-reply@toefl-test.uz",
                                to: `${email}`,
                                subject: "Account Verification Link",
                                text: `Hello, ${name} Please verify your email by clicking this link :
                                        ${process.env.url}/account/verify-email/${token} `,
                            });
                        } else{
                            return res.status(400).send("token not created");
                        }
                        console.log("user", JSON.stringify(result, null, 2));
                        return res.status(201).send({ status: 1, data: result });
                    }
                })
            } else {
                res.send({status: 0, error: "Email already exist!"})
            }
        });
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

exports.registerEmail = (req, res, next) => {
    try {
        let { name, surname, email, password} = req.body;

        console.log(req.body)

        const hashed_password = md5(password.toString())
        console.log(password)
        const checkEmail = `SELECT Email FROM Accounts WHERE Email = ?`;
        con.query(checkEmail, [email], (err, result, fields) => {
            if (!result.length) {
                let token = jwt.sign({ data: hashed_password }, 'secret');
                if(!token){
                    return res.status(400).send("token not created");
                }
                const sql = `Insert Into Accounts (Name, Surname, Email, Password, token) VALUES ( ?, ?, ?, ?, ?)`
                con.query(sql, [name, surname, email, hashed_password, token], (err, result, fields) => {
                    if (err) {
                        res.send({ status: 0, data: err });
                    } else {

                        // Move the uploaded image to our upload folder
                        if(req.files && image){
                            let imgPath = path.join(uploadPath, email+'.jpg');
                            image.mv(imgPath);
                        }

                        sendingMail({
                            from: "no-reply@toefl-test.uz",
                            to: `${email}`,
                            subject: "Account Confirmation",
                            text: `Hello ${name}, Your account has been created!`,
                        });
                        return res.status(201).send({ message: "Your account has been created" });
                    }
                })
            } else {
                return res.status(409).send({status: 0, error: "Email already exist!"});
            }
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({ error: error.message });
    }
}

exports.uploadImage = (req, res) => {
    try {
        const { id } = req.params;
        const { image } = req.files;
        if (req.files && !image.mimetype.startsWith('image')) return res.send({ status: 0, error: "File is not an image!" });
        const sql = `UPDATE Accounts SET image = ? WHERE id = ?`;
        con.query(sql, [image.name, id], (err, result, fields) => {
            
        });
    } catch (error) {
        res.status(404).send({ status: 0, error: error });
    }
}

exports.login = (req, res, next) => {
    try {
        let { email, password } = req.body;

        const hashed_password = md5(password.toString())
        const sql = `SELECT * FROM Accounts WHERE Email = ? AND Password = ?`
        con.query(
            sql, [email, hashed_password],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    if(!result.length){
                        res.send({status: 0, error: "Email or password is incorrect!"})
                        return;
                    } else if(result[0].is_verified == 0){
                        return res.status(401).send({error: "Please verify your email!"});
                    }
                    const options = {
                      expiresIn: "24h",
                    };
                    let token = jwt.sign({ data: result }, "secret", options)
                    res.send({ status: 1, data: result[0], token: token });
                }

            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

exports.checkEmailExistence = (req, res) => {
    try {
        const email = req.query.email; // get email from query parameters
        const sql = `SELECT COUNT(*) as count FROM Accounts WHERE email = ?`;
        con.query(
            sql, [email],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    const emailExists = result[0].count > 0;
                    res.send({ status: 1, data: { exist: emailExists } });
                }
            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

exports.image = (req, res) => {
    const { email } = req.params;
    console.log(email);
    // const url = 'https://example.com/images/test.jpg';
  
    // request({
    //   url: url,
    //   encoding: null
    // }, 
    // (err, resp, buffer) => {
    //   if (!err && resp.statusCode === 200){
    //     res.set("Content-Type", "image/jpeg");
    //     res.send(resp.body);
    //   }
    // });
    let imgPath = path.join(uploadPath, email+'.jpg');
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
        return;
    }
    res.send()
  }

exports.all = (req, res) => {
    try {
        const sql = `SELECT * FROM Accounts`
        con.query(
            sql, [],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    res.send({ status: 1, data: result });
                }

            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

exports.checkDateAvailability = (req, res) => {
    try {
        const requestedDate = req.query.date; // assuming date is sent in the request body
        const sql = `SELECT date, freespace FROM Exams WHERE date = ?`;
        con.query(
            sql, [requestedDate],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    if(result.length > 0) {
                        res.send({ status: 1, data: result[0] });
                    } else {
                        res.send({ status: 1, data: {date: requestedDate, freespace: -1} });
                    }
                }
            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

exports.getAllDateAvailability = (req, res) => {
    try {
        const sql = `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, freespace FROM Exams`;
        con.query(
            sql, [],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    res.send({ status: 1, data: result });
                }
            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}
exports.verifyEmail = async(req, res) => {
    try {
        const token = req.params.token;

        const sql = `SELECT token FROM Accounts WHERE token = ?`;
        con.query(
            sql, [token],
            function (err, result, fields) {
                if (err) {
                    res.status(500).send({ status: 0, data: err });
                } else {
                    if(result.length > 0) {
                        const usertoken = result[0].token;
                        console.log(usertoken);

                        // New SQL query to update is_verified field
                        const updateSql = `UPDATE Accounts SET is_verified = 1 WHERE token = ?`;
                        con.query(updateSql, [usertoken], function(updateErr, updateResult) {
                            if(updateErr) {
                                res.status(500).send({ status: 0, data: updateErr });
                            } else {
                                res.redirect(`${process.env.webUrl}/verification?status=verified`);
                                // res.status(200).send({ status: 1, data: result[0] });
                            }
                        });
                    } else {
                        res.status(404).send({ status: 0, data: {message: 'Token not found'} });
                    }
                }
            });
    
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 0, data: error });
    }
}

exports.resendVerificationEmail = (req, res) => {

    let { email } = req.body;

    // SQL query to get the token of the user
    const sql = `SELECT name, token FROM Accounts WHERE email = ?`;
    con.query(sql, [email], function(err, result) {
        if (err) {
            res.status(500).send({ status: 0, data: err });
        } else {
            if (result.length > 0) {
                const token = result[0].token;

                if (token) {
                    //send email to the user
                    //with the function coming from the mailing.js file
                    //message containing the user id and the token to help verify their email
                    sendingMail({
                        from: "no-reply@toefl-uzbek.uz",
                        to: `${email}`,
                        subject: "Account Verification Link",
                        text: `Hello, ${result[0].name} Please verify your email by
                                clicking this link :
                                ${process.env.url}/account/verify-email/${token} `,
                    });
                    return res.status(200).send({ message: 'Verification email sent' });
                } else{
                    return res.status(400).send("token not created");
                }
            } else {
                res.status(404).send({ status: 0, data: { message: 'Email not found' } });
            }
        }
    });
}

exports.allHtml = (req, res) => {
    try {
        const sql = `SELECT * FROM Accounts`
        con.query(
            sql, [],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    let resultHtml = renderUserList(result);
                    res.setHeader("Content-Type", "text/html");
                    res.send(resultHtml);
                }

            })
    } catch (error) {
        res.status(404).send({ status: 0, error: error });
    }
}

exports.delete = (req, res) => {
    try {
        const { id } = req.query;
        console.log(id);
        const sql = `DELETE FROM Accounts WHERE id = ?`
        con.query(
            sql, [id],
            function (err, result, fields) {
                if (err) {
                    res.send({ status: 0, data: err });
                } else {
                    res.send({ status: 1, data: result });
                }

            });
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}

function renderUserList(users) {
    let result = users.length > 0 ? `` : `<p id="users">No users</p>`;
  
    result += users.map((item) => {
      return `
        <tr>
            <td>
            <a href="javascript:void(0)" data-id="${item.id}">delete</a> 
            </td>
            <td>${item.Name}</td>
            <td> ${item.Surname}</td>
        </tr>
      `;
    }).join("");
  
    result += users.length > 0 ? "" : "";
    return result;
  }