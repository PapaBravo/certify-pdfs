const QRCode = require('qrcode');
const Handlebars = require("handlebars");
const wkhtmltopdf = require('wkhtmltopdf');
const { randomUUID } = require('crypto');

async function generateQR(data) {
    const qr = await QRCode.toDataURL(data);
    return `<img id="qrcode" src=${qr} height="300" width="300" />`;
}

async function makeInput(template, claim, signature, verificationUrl) {
    const link = verificationUrl + signature;
    const qr = await generateQR(link);

    const input = {
        claim,
        signature: {
            text: signature,
            link,
            qr
        }
    };

    return input;
}

function renderTemplate(template, input) {
    return Handlebars.compile(template)(input);
}

async function renderPDF(html) {
    let uuid = randomUUID();
    let destination = `public/files/${uuid}.pdf`;
    let stream = wkhtmltopdf(html, { output: destination });
    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(`/files/${uuid}.pdf`));
    });
}

module.exports = {
    generateQR,
    makeInput,
    renderTemplate,
    renderPDF
}