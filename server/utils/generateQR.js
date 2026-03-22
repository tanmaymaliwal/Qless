const QRCode = require('qrcode');
const crypto = require('crypto');

exports.generateQRToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    return qrCode;
  } catch (error) {
    throw new Error('QR Code generation failed');
  }
};