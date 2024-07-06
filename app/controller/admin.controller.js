const con = require("../models/db.js");
exports.getAllUsers = (req, res) => {
    try {
        let sql = `SELECT id, Name, Surname, Email, permissions, phone FROM Accounts`;
        con.query(sql, function(err, result) {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ users: result });
            }
        });
    } catch (error) {
        res.status(404).send({ error: error });
    }
}

exports.allAnyTable = (req, res) => {
    try {

        let sql = `SELECT * FROM ${req.body.tableName}`;
        con.query(sql, function(err, result) {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                result.forEach((item) => {
                    for (let key in item) {
                        if(key.includes('date')) {
                            item[key] = item[key].toLocaleDateString();
                        }
                    }
                });
                return res.status(200).send({ items: result });
            }
        });
    } catch (error) {
        return res.status(404).send({ error: error });
    }
}

exports.updateAccountTable = (req, res) => {
    try{
        let data = req.body;
        const updateSql = `UPDATE Accounts SET Name = ?, Surname = ?, Email = ?, phone = ?, gender = ?, birthdate = ?, country = ?, agreeTerms = ? WHERE id = ?`;
        con.query(updateSql, [data.name, data.surname, data.email, data.phone, data.gender, data.birthdate, data.country, data.agreeTerms, data.id], function(updateErr, updateResult) {
            if(updateErr) {
                res.status(500).send({ error: updateErr });
            } else {
                res.status(200).send({ message: "Successfully Updated!" });
            }
        });
    } catch (e){
        return req.status(404).send({error: error});
    }
}

exports.updateAnyRow = (req, res) => {
    try {
        let id_key = 'id';
        let generatedColumns = "";
        for (let key in req.body.item) {
            if(key === 'id' || req.body.item[key] === "null" || key.includes('_id')) {
                if(key.includes('_id')){
                    id_key = key;
                }
                continue;
            }

            generatedColumns += `${key} = '${req.body.item[key]}', `;
        }
        if(generatedColumns === "") return res.status(500).send({ error: "No column to update!" });
        generatedColumns = generatedColumns.slice(0, -2);
        let sql = `UPDATE ${req.body.tableName} SET ${generatedColumns} WHERE ${id_key} = ?`;
        console.log(sql);
        con.query(sql, [req.body.item[id_key]], function(err, result) {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ message: "Successfully Updated!" });
            }
        });
    } catch (error) {
        return res.status(404).send({error: error});
    }
}

exports.deleteAnyRow = (req, res) => {
    try {
        let id_key = req.body.id_key ?? 'id';
        let sql = `DELETE FROM ${req.body.tableName} WHERE ${id_key} = ?`;

        con.query(sql, [req.body.id], function(err, result) {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ message: "Successfully Deleted!" });
            }
        });
    } catch (error) {
        return req.status(404).send({error: error});
    }
}

exports.addAnyRow = (req, res) => {
    try {
        let generatedColumns = "";
        let generatedValues = "";
        for (let key in req.body.item) {
            if(key === 'id' || req.body.item[key] === "null") continue;
            generatedColumns += `${key}, `;
            generatedValues += `'${req.body.item[key]}', `;
        }
        if(generatedColumns === "") return res.status(500).send({ error: "No column to update!" });
        generatedColumns = generatedColumns.slice(0, -2);
        generatedValues = generatedValues.slice(0, -2);
        let sql = `INSERT INTO ${req.body.tableName} (${generatedColumns}) VALUES (${generatedValues})`;
        console.log(sql);
        con.query(sql, function(err, result) {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ message: "Successfully Added!" });
            }
        });
    } catch (error) {
        throw error;
        return res.status(404).send({error: error});
    }
}
