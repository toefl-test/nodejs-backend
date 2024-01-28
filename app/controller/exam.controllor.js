const con = require("../models/db.js");

exports.registerExam = (req, res) => {
    try {
        const { account_id, exam_id } = req.body;

        let sql = `INSERT INTO AccountExam (account_id, exam_id) VALUES (?, ?);`;
        con.query(sql, [account_id, exam_id], function(updateErr, updateResult) {
            if(updateErr) {
                return res.status(500).send({ error: "You already registered for the exam!" });
            } else {
                return res.status(200).send({ message: "Succesffully registered exam!" });
            }
        });
        
    } catch (error) {
        res.status(404).send({ error: error });
    }
}

exports.getAllExamsForUser = (req, res) => {
    try {
        const id = req.decoded.id;

        let sql = `SELECT Exams.*, AccountExam.score FROM Exams
                   JOIN AccountExam ON Exams.exam_id = AccountExam.exam_id
                   WHERE AccountExam.account_id = ?;`;
        con.query(sql, [id], function(err, result) {
            if(err) {
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

        let sql = `SELECT Accounts.*, AccountExam.score FROM Accounts
                   JOIN AccountExam ON Accounts.id = AccountExam.account_id
                   WHERE AccountExam.exam_id = ?;`;
        con.query(sql, [id], function(err, result) {
            if(err) {
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
                       SET score = ?
                       WHERE account_id = ? AND exam_id = ?;`;
            console.log(scores);
            con.query(sql, [score.score, score.account_id, score.exam_id], function(err, result) {
                if(err) {
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