const QRCode = require('qrcode');
const Handlebars = require("handlebars");
const wkhtmltopdf = require('wkhtmltopdf');
const toArray = require('stream-to-array');

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
    const options = {};

    let stream = wkhtmltopdf(html, options);
    let parts = await toArray(stream);
    let buffers = [];
    for (let i = 0, l = parts.length; i < l; ++i) {
        let part = parts[i]
        buffers.push((part instanceof Buffer) ? part : Buffer.from(part))
    }
    return Buffer.concat(buffers)
}


/**
 * 
 * @param {string} template An html template to be rendered by Handlebars 
 * @param {any} claim
 * @returns {Promise<Buffer>}
 */
async function renderDocument(template, claim) {
    // sign claim
    let signature = '<signature>'; //TODO: add signing here
    let input = await makeInput(template, claim, signature, 'localhost:3000/verify/');
    let html = renderTemplate(template, input);
    return renderPDF(html);
}

module.exports = {
    renderDocument
}