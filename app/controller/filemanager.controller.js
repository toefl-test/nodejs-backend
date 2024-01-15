const con = require("../models/db");
const moment = require("moment");
const path = require('path');
process.env.PLAYWRIGHT_BROWSERS_PATH = '/home/toefltes/tmp';
const uploadPath = path.join(__dirname, '..', 'views');
const fs = require('fs');
const imgConfig = require("../config/img.config")
var exec = require("child_process").exec;
const { spawn } = require('child_process');

exports.agreementHtml = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM Accounts WHERE id = ?`;
        con.query(
            sql, [id],
            async function (err, result, fields) {
                if (err) {
                    return res.status(500).send({ data: err });
                } else {
                    if(result.length>0){
                        let uniqueNumber = Math.floor(Math.random() * 1000000); // Generate a unique number
                        let replacedString = `AD${uniqueNumber}`; // Replace AD2345678 with AD{unique number}

                        let img = fs.readFileSync(path.join(uploadPath, 'signature.jpg')).toString('base64');
                        const html = renderUserList(replacedString, result[0].Name, moment(result[0].Birthdate), imgConfig.IMAGE);

                        res.set({ 'Content-Type': 'text/html', 'Content-Length': html.length });

                        return res.send(html);
                    }
                    else{
                        return res.status(404).send({ error: "User not found!" });
                    }
                }

            });
    } catch (error) {
        return res.status(404).send({ error: error });
    }
}


exports.agreementPHP = (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM Accounts WHERE id = ?`;
        con.query(
            sql, [id],
            async function (err, result, fields) {
                if (err) {
                    return res.status(500).send({ data: err });
                } else {
                    if(result.length>0){
                        let uniqueNumber = Math.floor(Math.random() * 1000000); // Generate a unique number
                        let replacedString = `AD${uniqueNumber}`; // Replace AD2345678 with AD{unique number}

                        //pass these (replacedString, result[0].Name, moment(result[0].Birthdate))
                        const pUrl = path.join(__dirname, '..', '..', 'php', 'convert2.php');
                        const php = spawn('php', [pUrl, replacedString, `${result[0].Name} ${result[0].Surname}`, moment(result[0].Birthdate).format('YYYY-MM-DD')]);

                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename=filename.pdf');

                        php.stdout.on('data', (data) => {
                            res.write(data);
                        });

                        php.stderr.on('data', (data) => {
                            console.error(`stderr: ${data}`);
                        });

                        php.on('close', (code) => {
                            res.end();
                            console.log(`child process exited with code ${code}`);
                        });
                    }
                    else{
                        return res.status(404).send({ error: "User not found!" });
                    }
                }

            });
    } catch (error) {
        return res.status(404).send({ error: error });
    }
};

exports.signature = (req, res) => {
    let imgPath = path.join(uploadPath, 'signature.jpg');
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
        return;
    }
    res.send();
}

function renderUserList(id, full_name, birthdate, img = null) {
    let userTemplate = fs.readFileSync(path.join(uploadPath, 'agreement_template.html'), 'utf8');
    userTemplate = userTemplate.replaceAll('{ID}', id);
    userTemplate = userTemplate.replaceAll('{NAME}', full_name);
    userTemplate = userTemplate.replaceAll('{DATE}', moment().format('DD.MM.YYYY'));
    userTemplate = userTemplate.replaceAll('{BIRTHDATE}', birthdate.format('DD.MM.YYYY'));
    if (img !== null) {
        userTemplate = userTemplate.replaceAll('{IMAGE}', img);
    }
    return userTemplate;
}
