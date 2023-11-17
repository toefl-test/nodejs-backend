const con = require("../models/db.js");

exports.registerExam = (req, res) => {
    try {
        const { date, id } = req.body;
        
        let sql = `UPDATE Accounts SET exam_date = ? WHERE id = ?`;
        con.query(sql, [date, id], function(updateErr, updateResult) {
            if(updateErr) {
                return res.status(500).send({ error: updateErr });
            } else {
                return res.status(200).send({ message: "Succesffully registered exam!" });
            }
        });

        
    } catch (error) {
        res.status(404).send({ error: error });
    }
}