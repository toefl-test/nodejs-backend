const con = require("../models/db");
const moment = require("moment");
const path = require('path');
const uploadPath = path.join(__dirname, '..', 'views');
const fs = require('fs');
const puppeteer = require('puppeteer');
const imgConfig = require("../config/img.config")

exports.agreement = async (req, res) => {
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
                        console.log(html);
                        const browser = await puppeteer.launch({ headless: true });
                        const page = await browser.newPage();
                        await page.setContent(html);
                        const pdf = await page.pdf({ format: 'A4',
                            margin: {
                                top: '0.5in',
                                right: '0.5in',
                                bottom: '0.5in',
                                left: '0.5in'
                            } });

                        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });

                        await browser.close();


                        return res.send(pdf);
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

exports.signature = (req, res) => {
    let imgPath = path.join(uploadPath, 'signature.jpg');
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
        return;
    }
    res.send();
}

function renderUserList(id, full_name, birthdate, img) {
    let userTemplate = fs.readFileSync(path.join(uploadPath, 'agreement_template.html'), 'utf8');
    userTemplate = userTemplate.replaceAll('{ID}', id);
    userTemplate = userTemplate.replaceAll('{NAME}', full_name);
    userTemplate = userTemplate.replaceAll('{DATE}', moment().format('DD.MM.YYYY'));
    userTemplate = userTemplate.replaceAll('{BIRTHDATE}', birthdate.format('DD.MM.YYYY'));
    userTemplate = userTemplate.replaceAll('{IMAGE}', img);
    return userTemplate;
}
