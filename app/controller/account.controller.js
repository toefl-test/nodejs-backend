// const Account = require("../models/account.model.js");
const con = require("../models/db.js");
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const path = require('path');
const uploadPath = path.join(__dirname, '..', '..', 'upload');
const fs = require('fs');
const uuid = require('uuid');
const {sendingMail} = require('./mailing.controller');
const {createToken} = require("../services/auth.service");

const mailToSend = process.env.EMAIL_TO_SEND ?? 'info@toefl-test.uz';

exports.registerEmail = (req, res, next) => {
    try {
        let { name, surname, email, password, phone} = req.body;

        const hashed_password = md5(password.toString());
        const checkEmail = `SELECT Email FROM Accounts WHERE Email = ?`;
        con.query(checkEmail, [email], (err, result, fields) => {
            if (!result.length) {

                const sql = `Insert Into Accounts (Name, Surname, Email, Password, phone) VALUES ( ?, ?, ?, ?, ?)`;
                console.log(sql, [name, surname, email, hashed_password, phone]);
                con.query(sql, [name, surname, email, hashed_password, phone], (err, result, fields) => {
                    if (err) {
                        return res.status(400).send({ error: err });
                    } else {
                        let token = createToken(result.insertId, email, 'user');
                        if(!token){
                            return res.status(400).send("token not created");
                        }
                        sendingMail({
                            from: "no-reply@toefl-test.uz",
                            to: `${email}`,
                            subject: "Account Confirmation",
                            text: `Hello ${name}, Your account has been created!`,
                        });
                        return res.status(201).send({ result: result, token: token, message: "Your account has been created" });
                    }
                })
            } else {
                return res.status(409).send({status: 0, error: "Email already exist!"});
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(404).send({ error: error.message });
    }
}

exports.uploadImage = (req, res) => {
    try {
        const {country, identity_type, id } = req.body;
        const { image } = req.files;
        if (req.files && !image.mimetype.startsWith('image')) return res.status(415).send({ error: "File is not an image!" });

        // Move the uploaded image to our upload folder
        if(req.files && image){
            let imgPath = path.join(uploadPath, id + '.jpg');
            image.mv(imgPath);
        }

        console.log(id, identity_type);

        const updateSql = `UPDATE Accounts SET country = ?, identity_type = ? WHERE id = ?`;
        con.query(updateSql, [country, identity_type, id], function(updateErr, updateResult) {
            if(updateErr) {
                res.status(500).send({ error: updateErr });
            } else {
                res.status(200).send({ message: "Succesffully uploaded!" });
            }
        });
    } catch (error) {
        res.status(404).send({ error: error });
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
                    } else if(result[0].is_verified === 0){
                        return res.status(401).send({error: "Please verify your email!"});
                    }
                    let token = createToken(result[0].id, email, result[0].permissions);
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
    const { id } = req.body;
    let imgPath = path.join(uploadPath, id+'.jpg');
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
                    res.status(404).send({ status: 0, data: err });
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
            sql, [requestedDate], (err, result, fields) => {
                if (err) {
                    return res.send({ status: 0, data: err });
                } else {
                    if(result.length > 0) {
                        return res.send({ status: 1, data: result[0] });
                    } else {
                        return res.send({ status: 1, data: {date: requestedDate, freespace: -1} });
                    }
                }
            });
    } catch (error) {
        return res.send({ status: 0, error: error });
    }
}

exports.getAllDateAvailability = (req, res) => {
    try {
        var type = req.query.type;
        let sql = `SELECT exam_id, DATE_FORMAT(date, '%Y-%m-%d') as date, time, freespace, description, type FROM Exams`;
        if(type){
            sql += ` WHERE type = '${type}'`;
        }
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

    sendingMail({
        from: "no-reply@toefl-test.uz",
        to: `${email}`,
        subject: "Account Verification Link",
        text: `HI`,
    });
    return res.status(200).send({email});
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

exports.profile = (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM Accounts WHERE id = ?`
        con.query(
            sql, [id],
            function (err, result, fields) {
                if (err) {
                    res.status(500).send({ data: err });
                } else {
                    if(!result.length){
                        res.status(404).send({error: "User not found!"})
                        return;
                    }
                    return res.status(200).send( result[0] );
                }

            });
    } catch (error) {
        res.send({ status: 0, error: error });
    }
}


exports.updateProfile = (req, res) => {
    try {
        const {name, surname, email, phone, gender, birthdate, country, agreeTerms } = req.body;
        const { id } = req.params;

        const updateSql = `UPDATE Accounts SET Name = ?, Surname = ?, Email = ?, phone = ?, gender = ?, birthdate = ?, country = ?, agreeTerms = ? WHERE id = ?`;
        con.query(updateSql, [name, surname, email, phone, gender, birthdate, country, agreeTerms, id], function(updateErr, updateResult) {
            if(updateErr) {
                res.status(500).send({ error: updateErr });
            } else {
                res.status(200).send({ message: "Successfully Updated!" });
            }
        });
    } catch (error) {
        res.status(404).send({ error: error });
    }
}


exports.sendContactFormFromUser = (req, res) => {

    let { fullName, email, subject, message } = req.body;
    try{
        sendingMail({
            from: 'info@toefl-test.uz',
            to: mailToSend,
            subject: `${subject} - ${fullName}`,
            text: `${message}\n\n\nfrom:${email}`,
        });
    } catch (e){
    }
    return res.status(200).send({message: "Your message has been sent!"});
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