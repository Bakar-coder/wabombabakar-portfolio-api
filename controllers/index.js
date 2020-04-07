const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { Resume, validateResume } = require('../models/Resume');
const { Message, validateMessage } = require('../models/Message');
const sendgrid_api_key = '';

const resume = 'test-resume.pdf';
const resumePath = path.join(__dirname, `../data/resume/${resume}`);

const transport = nodemailer.createTransport(
  sendGridTransport({
    auth: { api_key: sendgrid_api_key }
  })
);

exports.addMessage = async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, msg: error.details[0].message });
  const { name, company, phone, email, msg } = req.body;
  const phoneNumber = Number(phone);

  if (!phoneNumber)
    return res
      .status(400)
      .json({ success: false, msg: 'Enter a valid phone number' });

  let user = await Message.findOne({ email });
  if (user) {
    user.msg = [...user.msg, msg];
  } else {
    user = new Message({
      name,
      email,
      phone: phoneNumber,
      company,
      msg
    });
  }

  await user.save();
  await transport.sendMail({
    to: 'wabombabakar@gmail.com',
    from: `${user.name} -- ${user.email} -- ${user.phone}`,
    subject: `${user.msg}`
  });
  return res.json({
    success: true,
    msg: 'Message  sent successfully, Thanks!',
    user
  });
};

exports.sendResume = async (req, res) => {
  const { error } = validateResume(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, msg: error.details[0].message });
  const { email } = req.body;
  const buffer = await crypto.randomBytes(32);
  const token = buffer.toString('hex');
  let user = await Resume.findOne({ email });
  if (user) {
    (user.email = email),
      (user.resetToken = token),
      (user.resetTokenExp = Date.now() + 3600000);
  } else {
    user = new Resume({
      email,
      resetToken: token,
      resetTokenExp: Date.now() + 3600000
    });
  }

  transport.sendMail({
    to: `${user.email}`,
    from: 'wabombabakar@gmail.com',
    subject: 'Link to wabomba bakar resume',
    html: `<h3><a href='http://wambombabakar.com/resume/${user.resetToken}'>Download Resume</a></h3>`
  });

  transport.sendMail({
    to: 'wabombabakar@gmail.com',
    from: `${user.email}`,
    subject: `Some one with email ${user.email} Requested to download my resume.`
  });

  await user.save();
  res.json({
    success: true,
    msg: `The resume download link to has been sent to ${email}.`,
    token: user.resetToken
  });
};

exports.dowloadResume = async (req, res, next) => {
  const { token } = req.body;
  const user = await Resume.findOne({ resetToken: token });
  if (!user)
    return res.status(400).json({ success: false, msg: 'Invalid token' });
  if (user.resetTokenExp < Date.now())
    return res
      .status(400)
      .json({ success: false, msg: 'Token expired redownload resume.' });

  const file = fs.createReadStream(resumePath);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${resume}"`);
  res.setHeader('X-SendFile', `${resume}`);
  file.pipe(res);
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  return await user.save();
};
