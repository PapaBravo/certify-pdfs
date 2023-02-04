const QRCode = require('qrcode');
const Handlebars = require("handlebars");
const wkhtmltopdf = require('wkhtmltopdf');
const { streamToBuffer } = require('./utils');
const { Certifier } = require('./certifier');
const { config } = require('./config');

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
    return await streamToBuffer(stream);
}


/**
 * 
 * @param {string} template An html template to be rendered by Handlebars 
 * @param {any} claim
 * @returns {Promise<Buffer>}
 */
async function renderDocument(template, claim) {
    // TODO: REMOVE artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const certifier = await Certifier.getInstance();
    let signature = await certifier.sign(JSON.stringify(claim));
    let input = await makeInput(template, claim, signature, config.context.verificationUrl);
    let html = renderTemplate(template, input);
    return renderPDF(html);
}

module.exports = {
    renderDocument
}