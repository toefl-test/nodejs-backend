const con = require("../models/db.js");

exports.registerExam = (req, res) => {
    try {
        const { account_id, exam_id } = req.body;

        let sql = `INSERT INTO AccountExam (account_id, exam_id) VALUES (?, ?);`;
        con.query(sql, [account_id, exam_id], function (updateErr, updateResult) {
            if (updateErr) {
                console.log(updateErr);
                return res.status(500).send({ error: "You already registered for the exam!" });
            }

            sql = `UPDATE Exams SET freespace=(freespace - 1) WHERE exam_id=${exam_id};`;
            con.query(sql, function (err, result) {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                return res.status(200).send({ message: "Successfully registered exam!" });
            });

        });

    } catch (error) {
        res.status(404).send({ error: error });
    }
}

exports.getAllExamsForUser = (req, res) => {
    try {
        let id = req.decoded.id;
        if (req.decoded.permissions === 'ADMIN') {
            id = req.params.id;
        }

        let sql = `SELECT Exams.*, 
                            AccountExam.reading,
                            AccountExam.writing,
                            AccountExam.listening,
                            AccountExam.speaking,
                            AccountExam.payment FROM Exams
                   JOIN AccountExam ON Exams.exam_id = AccountExam.exam_id
                   WHERE AccountExam.account_id = ?;`;
        con.query(sql, [id], function (err, result) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ exams: result });
            }
        });

    } catch (error) {
        res.status(404).send({ error: error });
    }
}

exports.getAllAccountsForExam = (req, res) => {
    try {
        const id = req.params.id;

        let sql = `SELECT Accounts.*,
                          AccountExam.reading,
                          AccountExam.writing,
                          AccountExam.listening,
                          AccountExam.speaking,
                          AccountExam.payment
                   FROM Accounts
                            JOIN AccountExam ON Accounts.id = AccountExam.account_id
                   WHERE AccountExam.exam_id = ?;`;
        con.query(sql, [id], function (err, result) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ accounts: result });
            }
        });

    } catch (error) {
        res.status(404).send({ error: error });
    }
}

exports.updateScores = (req, res) => {
    try {
        const scores = req.body.scores; // array of { account_id, exam_id, score }

        scores.forEach(score => {
            let sql = `UPDATE AccountExam
                       SET reading = ?, listening = ?, writing = ?, speaking = ?, payment = ?
                       WHERE account_id = ? AND exam_id = ?;`;
            con.query(sql, [score.reading,
            score.listening,
            score.writing,
            score.speaking,
            score.payment,
            score.account_id,
            score.exam_id],
                function (err, result) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    }
                });
        });

        return res.status(200).send({ message: 'Scores updated successfully.' });

    } catch (error) {
        throw error;
        res.status(404).send({ error: error });
    }
}

exports.uploadCertificateFile = (req, res) => {
    try {
        const { account_id, exam_id } = req.body;
        const { file } = req.files;
        // Move the uploaded image to our upload folder
        if (req.files && file) {
            let filePath = path.join(uploadPath, `account_id.pdf`);
            file.mv(imgPath);
        }


    } catch (error) {
        res.status(404).send({ error: error });
    }
}